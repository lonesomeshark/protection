import { ethers, config } from 'hardhat';
import { networkAddresses } from '../utils/utils';
import { Subscribers__factory } from '../typechain/factories/Subscribers__factory';
import { LoneSomeSharkMonitor__factory } from '../typechain/factories/LoneSomeSharkMonitor__factory';
import { PaybackLoan__factory } from '../typechain/factories/PaybackLoan__factory';
import chalk from 'chalk';
import fs from 'fs';

import path from 'path';
const {
  providerAddress,
  aaveProvider,
  uniswapRouterAddress,
  wethAddress,
  linkAddress,
  chainlinkRegistryAddress,
} = networkAddresses.kovan;

console.log(chalk.green('ABOUT TO START NEW DEPLOYMENT'));
async function main() {
  const [owner, ...accounts] = await ethers.getSigners();
  console.log('deployer of contract is: ', chalk.blue(owner.address));
  const network = await ethers.provider.getNetwork();
  console.log('network: ', chalk.blue(network.name));

  const subscribers = await new Subscribers__factory(owner).deploy(
    providerAddress,
    aaveProvider,
    uniswapRouterAddress,
    wethAddress,
    linkAddress
  );
  console.log('subscribers deployed', chalk.blue(subscribers.address));

  const monitor = await new LoneSomeSharkMonitor__factory(owner).deploy(
    subscribers.address,
    chainlinkRegistryAddress,
    linkAddress
  );
  console.log('monitor deployed', chalk.blue(monitor.address));

  await subscribers.updateLoneSomeSharkAddress(monitor.address);
  console.info('updated lonesomeshark address into the subscriber!');

  // const payback = await new PaybackLoan__factory(owner).deploy(
  //   providerAddress,
  //   uniswapRouterAddress,
  //   subscribers.address,
  //   wethAddress,
  //   monitor.address
  // );
  // console.log('payback deployed', chalk.blue(payback.address));

  const p = config.paths.artifacts;
  console.log('📰', `smart contracts deplpoyed with: `, chalk.blue(owner.address));

  [
    // {
    //   name: 'PaybackLoan',
    //   address: payback.address,
    // },
    {
      name: 'Subscribers',
      address: subscribers.address,
    },
    {
      name: 'LoneSomeSharkMonitor',
      address: monitor.address,
    },
  ].forEach(({ name, address }) => {
    const f: any = fs.readFileSync(`${p}/contracts/${name}.sol/${name}.json`).toString();
    const pf = JSON.parse(f);
    pf.network = network.name;
    pf.address = address;
    const deployedPath = path.resolve(__dirname, `../deployed/${network.name}`);
    if (!fs.existsSync(deployedPath)) {
      fs.mkdirSync(deployedPath, { recursive: true });
    }
    fs.writeFileSync(path.resolve(deployedPath, name + '.json'), JSON.stringify(pf));
    console.log('📰', `contract ${name} ${network.name} address: `, chalk.blue(address));
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(chalk.redBright('-----------       THERE HAS BEEN AN ERROR      ----------'));
    console.error(error);
    process.exit(1);
  });
