import { Contract, Ed25519PublicKey, TransactionConfig } from "@colibri/core";
import { config } from "../config/settings.ts";
import { loadWasmFile } from "../utils/load-wasm.ts";
import { Methods, Payload } from "./exchange-allowance.types.ts";

const { networkConfig, exchangeWasmFile } = config;

const wasm = await loadWasmFile(exchangeWasmFile);

export class ExchangeAllowance extends Contract {
  constructor(contractId?: string) {
    super({
      networkConfig,
      // deno-lint-ignore no-explicit-any
      contractConfig: { wasm, contractId } as any,
    });
  }
  async swapMint({
    minter,
    amount,
    config,
  }: {
    minter: Ed25519PublicKey;
    amount: bigint;
    config: TransactionConfig;
  }) {
    return await this.invoke({
      method: Methods.SwapMint,
      methodArgs: {
        minter: minter,
        to: minter,
        amount,
      } as Payload[Methods.SwapMint],
      config,
    });
  }
}
