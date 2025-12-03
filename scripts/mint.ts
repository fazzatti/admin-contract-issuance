import { LocalSigner } from "@colibri/core";
import { config } from "./config/settings.ts";
import { Settings } from "./config/settings.types.ts";
import { getArgs } from "./utils/get-args.ts";
import { readFromJsonFile } from "./utils/io.ts";
import { ExchangeAllowance } from "./contracts/exchange-allowance.ts";

const { ioConfig } = config;
const settings = await readFromJsonFile<Settings>(ioConfig.exchangeSettings);

const { exchangeContractId, minterSk } = settings;

const amountArg = getArgs(1)[0];

let amount;
try {
  amount = BigInt(amountArg);
} catch {
  throw new Error("Amount argument must be a valid bigint string");
}

const minter = LocalSigner.fromSecret(minterSk);

const exchangeContract = new ExchangeAllowance(exchangeContractId);
await exchangeContract.loadSpecFromWasm();

console.log(`Minting ${amount} tokens to minter ${minter.publicKey()}`);

const result = await exchangeContract.swapMint({
  minter: minter.publicKey(),
  amount,
  config: {
    source: minter.publicKey(),
    fee: "10000",
    timeout: 145,
    signers: [minter],
  },
});

console.log("Mint transaction result:", result.hash);
