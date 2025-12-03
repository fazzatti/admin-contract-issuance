import { ContractId } from "@colibri/core";

export enum Methods {
  Constructor = "__constructor",
  SwapMint = "swap_mint",
}

export type Payload = {
  [Methods.Constructor]: {
    asset: ContractId;
    allowance_asset: ContractId;
  };

  [Methods.SwapMint]: {
    to: string;
    minter: string;
    amount: bigint;
  };
};
