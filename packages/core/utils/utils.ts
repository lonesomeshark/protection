import { ethers } from 'hardhat';
const linkAddress = '0xa36085F69e2889c224210F603D836748e7dC0088';
const chainlinkRegistryAddress = ethers.utils.getAddress(
  '0x4Cb093f226983713164A62138C3F718A5b595F73'
);
const providerAddress = ethers.utils.getAddress('0x88757f2f99175387ab4c6a4b3067c77a695b0349');
const aaveProvider = ethers.utils.getAddress('0x3c73A5E5785cAC854D468F727c606C07488a29D6');
const uniswapRouterAddress = ethers.utils.getAddress('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D');
const wethAddress = ethers.utils.getAddress('0xd0a1e359811322d97991e03f863a0c30c2cf029c');

export const kovan = {
  linkAddress,
  chainlinkRegistryAddress,
  providerAddress,
  aaveProvider,
  uniswapRouterAddress,
  wethAddress,
};
export const networkAddresses = { kovan };
