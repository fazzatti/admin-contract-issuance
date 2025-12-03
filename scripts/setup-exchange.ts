import {
  Ed25519SecretKey,
  initializeWithFriendbot,
  LocalSigner,
  PIPE_ClassicTransaction,
  StellarAssetContract,
} from "@colibri/core";
import { config } from "./config/settings.ts";
import { Asset, Keypair, Operation } from "stellar-sdk";
import { saveToJsonFile } from "./utils/io.ts";
import { Settings } from "./config/settings.types.ts";
import { ExchangeAllowance } from "./contracts/exchange-allowance.ts";
import { Methods, Payload } from "./contracts/exchange-allowance.types.ts";

const { networkConfig, ioConfig } = config;

const issuerSk = Keypair.random().secret() as Ed25519SecretKey;
const minterSk = Keypair.random().secret() as Ed25519SecretKey;
const issuer = LocalSigner.fromSecret(issuerSk);
const minter = LocalSigner.fromSecret(minterSk);

const asset = new StellarAssetContract({
  networkConfig,
  code: "FIFO",
  issuer: issuer.publicKey(),
});

const assetAllow = new StellarAssetContract({
  networkConfig,
  code: "FIFOAllow",
  issuer: issuer.publicKey(),
});

console.log("Initializing acounts...");

await initializeWithFriendbot(networkConfig.friendbotUrl, issuer.publicKey());
console.log("Issuer initialized: ", issuer.publicKey());

await initializeWithFriendbot(networkConfig.friendbotUrl, minter.publicKey());
console.log("Minter initialized: ", minter.publicKey());

console.log("Setting up minter account...");

const classicPipeline = PIPE_ClassicTransaction.create({
  networkConfig,
});

// Setup trustlines and initial funding
// for the minter account
{
  const result = await classicPipeline.run({
    operations: [
      Operation.changeTrust({
        asset: new Asset("FIFO", issuer.publicKey()),
        source: minter.publicKey(),
      }),
      Operation.changeTrust({
        asset: new Asset("FIFOAllow", issuer.publicKey()),
        source: minter.publicKey(),
      }),
      Operation.payment({
        asset: new Asset("FIFOAllow", issuer.publicKey()),
        amount: "1000000",
        destination: minter.publicKey(),
        source: issuer.publicKey(),
      }),
    ],
    config: {
      source: minter.publicKey(),
      fee: "10000",
      timeout: 45,
      signers: [minter, issuer],
    },
  });

  console.log("Minter setup complete:", result.hash);
}

// Deploy the SAC contract
// for the FIFO asset
{
  console.log("Deploy Asset SAC...");

  const result = await asset.deploy({
    source: issuer.publicKey(),
    fee: "10000",
    timeout: 45,
    signers: [issuer],
  });

  console.log("Asset contract deployed:", result.contractId);
}

// Deploy the SAC contract
// for the FIFOAllow asset
{
  console.log("Deploy Asset Allow SAC...");

  const result = await assetAllow.deploy({
    source: issuer.publicKey(),
    fee: "10000",
    timeout: 45,
    signers: [issuer],
  });

  console.log("Asset contract deployed:", result.contractId);
}

const exchangeContract = new ExchangeAllowance();
await exchangeContract.loadSpecFromWasm();

// Upload the WASM ofr the
// Exchange Allowance contract
{
  console.log("Uploading Exchange Allowance contract WASM...");
  const result = await exchangeContract.uploadWasm({
    source: issuer.publicKey(),
    fee: "10000",
    timeout: 45,
    signers: [issuer],
  });

  console.log("Exchange Allowance contract WASM uploaded:", result.hash);
}

// Deploy a new instance of the
// Exchange Allowance contract
{
  console.log("Deploying Exchange Allowance contract...");

  const result = await exchangeContract
    .deploy<Payload[Methods.Constructor]>({
      constructorArgs: {
        asset: asset.contractId,
        allowance_asset: assetAllow.contractId,
      },
      config: {
        source: issuer.publicKey(),
        fee: "10000",
        timeout: 45,
        signers: [issuer],
      },
    })
    .catch((error) => {
      console.error("Error deploying Exchange Allowance contract:", error);
      throw error;
    });

  console.log("Exchange Allowance contract instantiated:", result.hash);
}

// Set exchange contract as
// the new adming of the asset
{
  console.log("Setting Exchange Allowance contract as asset admin...");

  const result = await asset.setAdmin({
    newAdmin: exchangeContract.getContractId(),
    config: {
      source: issuer.publicKey(),
      fee: "10000",
      timeout: 45,
      signers: [issuer],
    },
  });

  console.log("Asset admin updated:", result.hash);
}

console.log("Saving Setup...");
await saveToJsonFile<Settings>(
  {
    issuerSk: issuerSk,
    minterSk: minterSk,
    assetId: asset.contractId,
    assetAllowId: assetAllow.contractId,
    exchangeContractId: exchangeContract.getContractId(),
  },
  ioConfig.exchangeSettings
);
