import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Greeter, Greeter__factory } from '../typechain';
import { LocalSubscriber } from '../typechain/LocalSubscriber';
import { LocalSubscriber__factory } from '../typechain/factories/LocalSubscriber__factory';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

let greeter: Greeter;
let owner: SignerWithAddress, accounts: SignerWithAddress[];
describe('Greeter', () => {
  it("Should return the new greeting once it's changed", async () => {
    [owner, ...accounts] = await ethers.getSigners();
    greeter = await new Greeter__factory(owner).deploy('hello world');
    // const Greeter = await ethers.getContractFactory("Greeter");
    // const greeter = await Greeter.deploy("Hello, world!");
    // await greeter.deployed();
  });

  it('setGreeting(string,string)', async () => {
    await greeter['setGreeting(string,string)'](' hola', 'prefix');
    expect(await greeter.greet()).to.equal('prefix hola');
  });

  it('setGreeting(string)', async () => {
    await greeter['setGreeting(string)']('Hola, mundo!');
    expect(await greeter.greet()).to.equal('Hola, mundo!');
  });
});

describe('local discovery', () => {
  it('should revert', async () => {
    await expect(
      greeter.checklength(
        [
          '0xAD5ce863aE3E4E9394Ab43d4ba0D80f419F61789',
          '0xAD5ce863aE3E4E9394Ab43d4ba0D80f419F61789',
        ],
        [ethers.utils.parseEther('100.0')]
      )
    ).to.be.revertedWith('it is not matching length');
  });

  it('should give 1.03 ish', async () => {
    const amount = ethers.utils.formatEther(ethers.BigNumber.from('1039353425337400353'));
    console.log({ amount });
    expect(Number(amount)).to.be.greaterThan(1.03);
  });

  it('should have 1.01 hf', async function () {
    this.timeout(50000);
    const [owner, dev] = await ethers.getSigners();
    const contract = await new LocalSubscriber__factory(owner).deploy();
    const tx = await contract.activate(ethers.utils.parseEther('1.01'));
    await tx.wait();
    const account = await contract['getAccount()']();
    console.log({ accountString: account.toString(), account });
    // expect(account.).to.be.greaterThan(1.03);
    expect(Number(ethers.utils.formatEther(account.threshold))).to.be.equal(1.01);

    {
      await expect(contract.activate(ethers.utils.parseEther('1.01'))).to.be.revertedWith(
        'user has already been activated'
      );
    }

    //
    {
      await expect(
        contract.connect(dev).activate(ethers.utils.parseEther('1.011'))
      ).to.be.revertedWith('threshold too high, above 1.1');
    }
  });

  it('checkAddressArray 3:', async () => {
    const resp = await greeter.checkAddressArray();
    console.log({ resp });
    expect(resp.length).to.be.equal(3);
  });

  it('checkAddressInitializedArray 2 but length 3 initialized:', async () => {
    const resp = await greeter.checkAddressInitializedArray();
    console.log({ resp });
    expect(resp.length).to.be.equal(3);
  });

  it('checkAddressNotInitializedArray 2 but length 3 initialized:', async () => {
    const resp = await greeter.checkAddressNotInitializedArray();
    console.log({ resp });
    expect(resp.length).to.be.equal(2);
  });

  it('should just log no ethers', async () => {
    const balance1 = await owner.getBalance();
    const tx = greeter.sendEthersToUser();
    const balance2 = await owner.getBalance();
  });

  it('should transfer ethers to contract and should have transfered it back to other user: ', async () => {
    const other = accounts[0];
    const dev = accounts[1];
    const balance_other_1 = await other.getBalance();
    const balance1 = await dev.getBalance();

    const tx = await dev.sendTransaction({
      to: greeter.address,
      value: ethers.utils.parseEther('1.0'),
    });

    const tx_other = await greeter.connect(other).sendEthersToUser();
    const balance_other_2 = await other.getBalance();
    const balance2 = await dev.getBalance();
    const gasPrice = Number(ethers.utils.formatEther(tx.gasPrice || ethers.BigNumber.from(0)));
    const gasPrice_other = Number(
      ethers.utils.formatEther(tx_other.gasPrice || ethers.BigNumber.from(0))
    );
    const other_diff = Number(ethers.utils.formatEther(balance_other_2.sub(balance_other_1)));
    const diff = Number(ethers.utils.formatEther(balance2.sub(balance1)));
    console.log({
      diff,
      other_diff,
      gasPrice,
      gasPrice_other,
      calculated_other: 1 - gasPrice_other,
      calculated: -1 - gasPrice,
    });
    expect(other_diff).to.be.equal(1 - gasPrice_other);
    expect(diff).to.be.equal(-1 - gasPrice);
  });

  it('should transfer ethers to contract and should have transfered it back to other user using call: ', async () => {
    const other = accounts[2];
    const dev = accounts[3];
    const balance_other_1 = await other.getBalance();
    const balance1 = await dev.getBalance();

    const tx = await dev.sendTransaction({
      to: greeter.address,
      value: ethers.utils.parseEther('1.0'),
    });

    const tx_other = await greeter.connect(other).sendEthersToUserCall();
    const balance_other_2 = await other.getBalance();
    const balance2 = await dev.getBalance();
    const gasPrice = Number(ethers.utils.formatEther(tx.gasPrice || ethers.BigNumber.from(0)));
    const gasPrice_other = Number(
      ethers.utils.formatEther(tx_other.gasPrice || ethers.BigNumber.from(0))
    );
    const other_diff = Number(ethers.utils.formatEther(balance_other_2.sub(balance_other_1)));
    const diff = Number(ethers.utils.formatEther(balance2.sub(balance1)));
    console.log({
      diff,
      other_diff,
      gasPrice,
      gasPrice_other,
      calculated_other: 1 - gasPrice_other,
      calculated: -1 - gasPrice,
    });
    expect(other_diff).to.be.equal(1 - gasPrice_other);
    expect(diff).to.be.equal(-1 - gasPrice);
  });
});
