import { expect } from 'chai';
import { ethers } from 'hardhat';
import chalk from 'chalk';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Subscribers } from '../typechain/Subscribers';
import { Subscribers__factory } from '../typechain/factories/Subscribers__factory';
import { ILendingPool } from '../typechain/ILendingPool';
import { ILendingPoolAddressesProvider } from '../typechain/ILendingPoolAddressesProvider';
import LendingPool from '@aave/protocol-v2/artifacts/contracts/protocol/lendingpool/LendingPool.sol/LendingPool.json';
import LendingPoolAddressesProvider from '@aave/protocol-v2/artifacts/contracts/protocol/configuration/LendingPoolAddressesProvider.sol/LendingPoolAddressesProvider.json';
import { ILendingPoolAddressesProvider__factory } from '../typechain/factories/ILendingPoolAddressesProvider__factory';
import { networkAddresses } from '../utils';
import { BigNumber } from '@ethersproject/bignumber';
import { Payer } from '../typechain/Payer';
import { Payer__factory } from '../typechain/factories/Payer__factory';
import { KeeperRegistryBaseInterface } from '../typechain/KeeperRegistryBaseInterface';
import { KeeperRegistryBaseInterface__factory } from '../typechain/factories/KeeperRegistryBaseInterface__factory';
import { IERC20__factory } from '../typechain/factories/IERC20__factory';

const useContracts = false;
let contract: Payer;

let owner: SignerWithAddress, accounts: SignerWithAddress[];

const {
  providerAddress,
  aaveProvider,
  uniswapRouterAddress,
  wethAddress,
  linkAddress,
  chainlinkRegistryAddress,
} = networkAddresses.kovan;

describe('kovan KEEPER REGISTRY', () => {
  it('create contract and add funds', async function () {
    this.timeout(250000);
    [owner, ...accounts] = await ethers.getSigners();
    contract = await new Payer__factory(owner).deploy(chainlinkRegistryAddress, linkAddress);
    await contract.addFunds(ethers.BigNumber.from(730), ethers.utils.parseEther('1.0'));
  });
  // it('get registry and play', async function () {
  //     this.timeout(150000)
  //     const registry = await KeeperRegistryBaseInterface__factory
  //         .connect(
  //             chainlinkRegistryAddress,
  //             owner);
  //     console.log("registry address", registry.address)
  //     await IERC20__factory.connect(linkAddress, owner).approve(registry.address, ethers.utils.parseEther('1.0'))
  //     await registry.addFunds(ethers.BigNumber.from(730), ethers.utils.parseEther('1.0'));

  // });

  // it("get link balance", async () => {
  //     console.log("owner address", owner.address)
  //     const balance = await contract.getBalance(owner.address)
  //     console.log(ethers.utils.formatEther(balance));
  // })
  // it("transfers directly to contract", async () => {
  //     const tx = await contract.transfer("0x48141e9034c1C42fd7Dd72C0CAfDC6E7B89909d6");
  //     console.log({ tx });
  // })
});
