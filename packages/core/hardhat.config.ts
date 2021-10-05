import { task } from 'hardhat/config';
import { HardhatUserConfig } from 'hardhat/types';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'hardhat-contract-sizer';
import dotenv from 'dotenv';
import '@nomiclabs/hardhat-etherscan';
import 'hardhat-gas-reporter';

const envPath = process.env.ENV_PATH ? { path: process.env.ENV_PATH } : {};
dotenv.config(envPath);
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      { version: '0.8.7' },
      { version: '0.8.4' },
      { version: '0.7.0' },
      { version: '0.7.4' },
      { version: '0.6.12' },
      { version: '0.6.6' },
    ],
  },
  networks: {
    local: {
      url: 'http://127.0.0.0:8545',
    },
    forking: {
      url: process.env.INFURA_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    kovan: {
      url: process.env.INFURA_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    hardhat: {
      initialBaseFeePerGas: 0, // workaround from https://github.com/sc-forks/solidity-coverage/issues/652#issuecomment-896330136 . Remove when that issue is closed.
    },
    ropsten: {
      url: process.env.ROPSTEN_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  mocha: {
    grep: process.env.ENV_TEST ? process.env.ENV_TEST : '',
  },
};

export default config;
