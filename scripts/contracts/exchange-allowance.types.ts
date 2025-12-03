import { ContractId } from "@colibri/core";

export enum Methods {
  Constructor = "__constructor",
  Mint = "mint",
  Burn = "burn",
}

export type Payload = {
  [Methods.Constructor]: {
    asset: ContractId;
    allowance_asset: ContractId;
  };

  [Methods.Mint]: {
    to: string;
    minter: string;
    amount: bigint;
  };

  [Methods.Burn]: {
    minter: string;
    amount: bigint;
  };
};
