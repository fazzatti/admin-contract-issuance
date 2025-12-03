# Admin Contract Issuance Demo

Demonstrates using a Soroban smart contract as an admin for a Stellar asset, managing token supply through an allowance token mechanism.

## Overview

The [`ExchangeAllowanceContract`](contracts/exchange-allowance/src/lib.rs) acts as the admin for a Stellar asset (FIFO). Users must hold allowance tokens (FIFOAllow) to mint the main asset, and receive them back when burning.

**Flow:**

- **Mint**: Transfer allowance tokens → Receive minted asset tokens
- **Burn**: Burn asset tokens → Receive allowance tokens back

## Project Structure

- [`contracts/exchange-allowance/`](contracts/exchange-allowance/) - Main exchange contract
- [`scripts/`](scripts/) - Deno scripts for deployment and interaction

## Commands

### Build Contracts

```sh
deno task build-contracts
```

### Setup Exchange

Deploys contracts and configures the exchange:

```sh
deno task setup
```

### Mint Tokens

```sh
deno task mint <amount>
```

### Burn Tokens

```sh
deno task burn <amount>
```

## Requirements

- [Deno](https://deno.land/)
- [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools/cli/stellar-cli)
- Rust with `wasm32v1-none` target
