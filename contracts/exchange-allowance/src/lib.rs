#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

#[derive(Clone)]
#[contracttype]
pub enum StorageKey {
    Allowance, //Address
    Asset,     //Address
}

#[contract]
pub struct ExchangeAllowanceContract;

#[contractimpl]
impl ExchangeAllowanceContract {
    pub fn __constructor(_env: Env, asset: Address, allowance_asset: Address) {
        write_allowance(&_env, allowance_asset);
        write_asset(&_env, asset);
    }

    pub fn mint(env: Env, to: Address, amount: i128, minter: Address) {
        minter.require_auth();

        let allowance_asset = read_allowance(&env);
        let allowance_client = soroban_sdk::token::StellarAssetClient::new(&env, &allowance_asset);

        allowance_client.transfer(&minter.clone(), env.current_contract_address(), &amount);

        let asset = read_asset(&env);
        let asset_client = soroban_sdk::token::StellarAssetClient::new(&env, &asset);

        asset_client.mint(&to, &amount);
    }

    pub fn burn(env: Env, minter: Address, amount: i128) {
        minter.require_auth();

        let asset = read_asset(&env);
        let asset_client = soroban_sdk::token::StellarAssetClient::new(&env, &asset);

        asset_client.burn(&minter, &amount);

        let allowance_asset = read_allowance(&env);
        let allowance_client = soroban_sdk::token::StellarAssetClient::new(&env, &allowance_asset);

        allowance_client.transfer(&env.current_contract_address(), &minter, &amount);
    }
}

pub fn write_allowance(e: &Env, asset: Address) {
    e.storage().instance().set(&StorageKey::Allowance, &asset);
}

pub fn write_asset(e: &Env, asset: Address) {
    e.storage().instance().set(&StorageKey::Asset, &asset);
}

pub fn read_allowance(e: &Env) -> Address {
    e.storage().instance().get(&StorageKey::Allowance).unwrap()
}

pub fn read_asset(e: &Env) -> Address {
    e.storage().instance().get(&StorageKey::Asset).unwrap()
}
