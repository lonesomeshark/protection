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
import { PaybackLoan__factory } from '../typechain/factories/PaybackLoan__factory';
import { PaybackLoan } from '../typechain/PaybackLoan';
import { networkAddresses } from '../utils';
let contract: PaybackLoan;
const contractAddress: string = '0x90A37ccc6B2033a47DED00E25F5423bAF9caaA14';
let owner: SignerWithAddress, accounts: SignerWithAddress[];

const subscribersAddress = '';
const monitorAddress = '';
const {
  providerAddress,
  aaveProvider,
  uniswapRouterAddress,
  wethAddress,
  linkAddress,
  chainlinkRegistryAddress,
} = networkAddresses.kovan;

describe('kovan PAYBACK LOAN', () => {
  it('create contract', async function () {
    this.timeout(50000);
    [owner, ...accounts] = await ethers.getSigners();

    if (contractAddress) {
      contract = await new PaybackLoan__factory(owner).attach(contractAddress);
    } else {
      contract = await new PaybackLoan__factory(owner).deploy(
        providerAddress,
        uniswapRouterAddress,
        subscribersAddress,
        wethAddress,
        monitorAddress,
        owner.address
      );
    }
    console.log('📰', 'contract PAYBACKLOAN address-> ', chalk.blue(contract.address));
  });

  // it("should revert", async function () {
  //     this.timeout(70000);
  //     const linkAddress = "0xAD5ce863aE3E4E9394Ab43d4ba0D80f419F61789"
  //     const assets = [linkAddress, linkAddress];
  //     const amounts = [ethers.utils.parseEther("100.0")];
  //     await expect(contract.flashLoanCall(assets, amounts))
  //         .to.be.revertedWith("assets and amounts have no equal length");
  // })
  it('should call loan DIRECT without instanciating in one transaction', async function () {
    // links
    this.timeout(250000);
    const linkAddress = '0xAD5ce863aE3E4E9394Ab43d4ba0D80f419F61789';
    const assets = [linkAddress];
    const amounts = [ethers.utils.parseEther('100.0')];
    const balance1 = await owner.getBalance();
    const tx = await contract.flashLoanCall(owner.address, assets, amounts);
    const balance2 = await owner.getBalance();
    const diff = balance1.sub(balance2);
    await tx.wait();
    console.log(chalk.blue('transaction output'), tx);
    console.log(
      chalk.blue('difference between flashloan transaction: '),
      ethers.utils.formatEther(diff)
    );
    console.log(tx.toString());
  });

  // it("should call loan to payback within one transaction", async function () {
  //     // links
  //     this.timeout(250000);
  //     const linkAddress = "0xAD5ce863aE3E4E9394Ab43d4ba0D80f419F61789"
  //     const assets = [linkAddress];
  //     const amounts = [ethers.utils.parseEther("100.0")];
  //     const balance1 = await owner.getBalance();
  //     const tx = await contract.flashLoanCall(assets, amounts)
  //     const balance2 = await owner.getBalance();
  //     const diff = balance1.sub(balance2);
  //     await tx.wait();
  //     console.log(chalk.blue("transaction output"), tx)
  //     console.log(chalk.blue("difference between flashloan transaction: "), ethers.utils.formatEther(diff));
  //     console.log(tx.toString());
  // })
});
