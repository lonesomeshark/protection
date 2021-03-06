import { expect } from 'chai';
import { ethers } from 'hardhat';
import chalk from 'chalk';
import { Subscribers } from '../typechain/Subscribers';
import { Subscribers__factory } from '../typechain/factories/Subscribers__factory';
import { ILendingPool } from '../typechain/ILendingPool';
import { ILendingPoolAddressesProvider } from '../typechain/ILendingPoolAddressesProvider';
import LendingPool from '@aave/protocol-v2/artifacts/contracts/protocol/lendingpool/LendingPool.sol/LendingPool.json';
import LendingPoolAddressesProvider from '@aave/protocol-v2/artifacts/contracts/protocol/configuration/LendingPoolAddressesProvider.sol/LendingPoolAddressesProvider.json';
import { ILendingPoolAddressesProvider__factory } from '../typechain/factories/ILendingPoolAddressesProvider__factory';
import { PaybackLoan } from '../typechain/PaybackLoan';
import { LoneSomeSharkMonitor } from '../typechain/LoneSomeSharkMonitor';
import { PaybackLoan__factory } from '../typechain/factories/PaybackLoan__factory';
import { LoneSomeSharkMonitor__factory } from '../typechain/factories/LoneSomeSharkMonitor__factory';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { networkAddresses } from '../utils';
let subscribers: Subscribers;
let monitor: LoneSomeSharkMonitor;
let payback: PaybackLoan;

const subscriberAddress: string = '';
const monitorAddress: string = '';
const paybackAddress: string = '';
let owner: SignerWithAddress, accounts: SignerWithAddress[];
const {
  providerAddress,
  aaveProvider,
  uniswapRouterAddress,
  wethAddress,
  linkAddress,
  chainlinkRegistryAddress,
} = networkAddresses.kovan;

describe('kovan DEPLOYMENT AND DYNAMIC INTERACTIONS', () => {
  it('create 3 CONTRACTS: LONESOMESHARKMONITOR, SUBSCRIBERS, PAYBACKLOAN', async function () {
    this.timeout(100000);
    [owner, ...accounts] = await ethers.getSigners();
    // owner is the admin & deployer.
    if (subscriberAddress) {
      subscribers = await new Subscribers__factory(owner).attach(subscriberAddress);
    } else {
      subscribers = await new Subscribers__factory(owner).deploy(
        providerAddress,
        aaveProvider,
        uniswapRouterAddress,
        wethAddress,
        linkAddress
      );
    }
    if (monitorAddress) {
      monitor = await new LoneSomeSharkMonitor__factory(owner).attach(monitorAddress);
    } else {
      monitor = await new LoneSomeSharkMonitor__factory(owner).deploy(
        subscribers.address,
        chainlinkRegistryAddress,
        linkAddress
      );
    }

    if (paybackAddress) {
      payback = await new PaybackLoan__factory(owner).attach(paybackAddress);
    } else {
      payback = await new PaybackLoan__factory(owner).deploy(
        providerAddress,
        uniswapRouterAddress,
        subscribers.address,
        wethAddress,
        monitor.address,
        owner.address
      );
    }

    // subscribers.set
    console.log('????', 'SUBSCRIBERS address-> ', chalk.blue(subscribers.address));
    console.log('????', 'PAYBACKLOAN address-> ', chalk.blue(payback.address));
    console.log('????', 'LONESOMESHARKMONITOR address-> ', chalk.blue(monitor.address));
  });

  it('activates owner as an active user', async function () {});
});
