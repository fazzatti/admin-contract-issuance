import { NetworkConfig } from "@colibri/core";

export const config = {
  wasmDir: "./target/wasm32v1-none/release/",
  exchangeWasmFile: "exchange_allowance.wasm",
  networkConfig: NetworkConfig.TestNet(),
  ioConfig: {
    outputDirectory: "./.json",
    exchangeSettings: "exchange-settings",
  },
};
