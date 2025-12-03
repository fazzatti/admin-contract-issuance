import { ContractId, Ed25519SecretKey } from "@colibri/core";

export type Settings = {
  issuerSk: Ed25519SecretKey;
  minterSk: Ed25519SecretKey;
  assetId: ContractId;
  assetAllowId: ContractId;
  exchangeContractId: ContractId;
};
