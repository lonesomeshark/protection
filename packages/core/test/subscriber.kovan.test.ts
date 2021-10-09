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
import { networkAddresses } from '../utils/utils';
import { BigNumber } from '@ethersproject/bignumber';
let contract: Subscribers;
const contractAddress: string = '';
let owner: SignerWithAddress, accounts: SignerWithAddress[];

const {
  providerAddress,
  aaveProvider,
  uniswapRouterAddress,
  wethAddress,
  linkAddress,
  chainlinkRegistryAddress,
} = networkAddresses.kovan;

describe('kovan Subscribers', () => {
  it('create contract', async function () {
    this.timeout(50000);
    [owner, ...accounts] = await ethers.getSigners();
    if (contractAddress) {
      contract = await new Subscribers__factory(owner).attach(contractAddress);
    } else {
      contract = await new Subscribers__factory(owner).deploy(
        providerAddress,
        aaveProvider,
        uniswapRouterAddress,
        wethAddress,
        linkAddress
      );
    }
    console.log('📰', 'contract address-> ', chalk.blue(contract.address));
  });

  it('finds out information about user debt', async function () {
    this.timeout(150000);
    const lendingPoolAddressesProvider = (await new ethers.ContractFactory(
      LendingPoolAddressesProvider.abi,
      LendingPoolAddressesProvider.bytecode,
      owner
    ).attach(providerAddress)) as ILendingPoolAddressesProvider;

    const lendingPoolAddress = await lendingPoolAddressesProvider.getLendingPool();
    // 0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe
    console.log('📰', 'lending pool address-> ', chalk.blue(lendingPoolAddress));

    const lendingPool = (await new ethers.ContractFactory(
      LendingPool.abi,
      LendingPool.bytecode,
      owner
    ).attach(lendingPoolAddress)) as ILendingPool;

    const userData = await lendingPool.getUserAccountData(owner.address);
    const userConf = await lendingPool.getUserConfiguration(owner.address);

    console.log({ userConf, userData });
    console.log({
      stringifiedConf: userConf.toString(),
      stringifiedData: userData.toString(),
    });
  });
  it('should subscribe user', async function () {
    this.timeout(50000);
    // const tx = await contract.activate(ethers.utils.parseEther("1.01"));
    // await tx.wait();
    const account = await contract['getAccount()']();
    console.log({ accountString: account.toString(), account });
    // expect(account.).to.be.greaterThan(1.03);
  });
  it('should get userdata', async () => {
    interface UserReserveData {
      currentATokenBalance: BigNumber;
      currentStableDebt: BigNumber;
      currentVariableDebt: BigNumber;
      principalStableDebt: BigNumber;
      scaledVariableDebt: BigNumber;
      stableBorrowRate: BigNumber;
      liquidityRate: BigNumber;
      stableRateLastUpdated: BigNumber;
      usageAsCollateralEnabled: boolean;
      address: string;
      symbol: string;
    }
    const data: UserReserveData[] = (await contract.getUserData()) as any;
    const parsedData = data.map((d: UserReserveData) => {
      return {
        currentATokenBalance: Number(ethers.utils.formatEther(d.currentATokenBalance)),
        currentStableDebt: Number(ethers.utils.formatEther(d.currentStableDebt)),
        currentVariableDebt: Number(ethers.utils.formatEther(d.currentVariableDebt)),
        principalStableDebt: Number(ethers.utils.formatEther(d.principalStableDebt)),
        scaledVariableDebt: Number(ethers.utils.formatEther(d.scaledVariableDebt)),
        stableBorrowRate: Number(ethers.utils.formatEther(d.stableBorrowRate)),
        liquidityRate: Number(ethers.utils.formatEther(d.liquidityRate)),
        stableRateLastUpdated: Number(ethers.utils.formatEther(d.stableRateLastUpdated)),
        usageAsCollateralEnabled: d.usageAsCollateralEnabled,
        symbol: d.symbol,
        address: d.address,
      };
    });
    console.log(parsedData);
  });
});
