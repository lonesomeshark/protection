// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import {KeeperRegistryBaseInterface} from '../interfaces/KeeperRegistryInterface.sol';
import {KeeperCompatibleInterface} from '@chainlink/contracts/src/v0.6/interfaces/KeeperCompatibleInterface.sol';
import {IERC20} from '@aave/protocol-v2/contracts/dependencies/openzeppelin/contracts/IERC20.sol';
import 'hardhat/console.sol';

contract Payer {
  KeeperRegistryBaseInterface immutable registry;
  address immutable LINK_ADDRESS;

  constructor(KeeperRegistryBaseInterface _registry, address _link) public {
    registry = _registry;
    LINK_ADDRESS = _link;
  }

  function addFunds(uint256 _id, uint96 _amount) public {
    IERC20(LINK_ADDRESS).approve(address(this), _amount);
    registry.addFunds(_id, _amount);
  }

  function getBalance(address _account) public view returns (uint256) {
    return IERC20(LINK_ADDRESS).balanceOf(_account);
  }

  function transfer(address _recipient) public {
    IERC20(LINK_ADDRESS).approve(address(this), 1 ether);
    IERC20(LINK_ADDRESS).transfer(_recipient, 1 ether);
  }
}
