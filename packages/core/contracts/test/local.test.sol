//SPDX-License-Identifier: Unlicense
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;
import {ILendingPool} from '@aave/protocol-v2/contracts/interfaces/ILendingPool.sol';
import {ILendingPoolAddressesProvider} from '@aave/protocol-v2/contracts/interfaces/ILendingPoolAddressesProvider.sol';
import 'hardhat/console.sol';
import {ERC20} from '@aave/protocol-v2/contracts/dependencies/openzeppelin/contracts/ERC20.sol';

contract LocalSubscriber {
  struct Account {
    //18 DECIMALS or 19 decimals
    // 1039353425337400353
    uint256 hf;
    bool active;
    uint256 threshold;
  }
  mapping(address => Account) accounts;
  address[] subscribers;
  address[] unhealthy_subscribers;

  constructor() public {}

  function getAccount(address _subscriber) public view returns (Account memory _account) {
    require(_subscriber != address(0), 'address not present');
    require(accounts[_subscriber].active, 'user not found in our records');
    _account = accounts[_subscriber];
  }

  function getAccount() public view returns (Account memory _account) {
    require(accounts[msg.sender].active, 'you are not active in our records');
    _account = accounts[msg.sender];
  }

  function monitorSubscribersHealth() public view returns (bool needsPayback) {
    for (uint8 i = 0; i < subscribers.length; i++) {
      address addr = subscribers[i];
      if (accounts[addr].active) {
        uint256 hf = getUserAccountData(addr);
        if (hf < accounts[addr].threshold) {
          needsPayback = true;
          break;
        }
      }
    }
  }

  function getUnhealthySubscribers() public view returns (address[] memory _unhealthy_subscribers) {
    uint8 j = 0;
    for (uint8 i = 0; i < subscribers.length; i++) {
      address addr = subscribers[i];
      if (accounts[addr].active) {
        uint256 hf = getUserAccountData(addr);
        if (hf < accounts[addr].threshold) {
          j++;
          _unhealthy_subscribers[j] = addr;
        }
      }
    }
  }

  function activate(uint256 _threshold) public payable {
    console.log('threshold: %s', _threshold);
    console.log('byn      : %s', 101 * 10**16);

    require(!accounts[msg.sender].active, 'user has already been activated');
    require(_threshold >= 100 * 10**16, 'threshold below 1');
    require(_threshold <= 101 * 10**16, 'threshold too high, above 1.1');
    uint256 healthFactor;
    (healthFactor) = getUserAccountData(msg.sender);
    accounts[msg.sender].hf = healthFactor;
    accounts[msg.sender].active = true;
    accounts[msg.sender].threshold = _threshold;
    subscribers.push(msg.sender);
  }

  function getUserAccountData(address _user) internal pure returns (uint256) {
    return (1039353425337400353);
  }
}
