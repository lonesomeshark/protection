// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import {KeeperRegistryBaseInterface} from './interfaces/KeeperRegistryInterface.sol';
import {KeeperCompatibleInterface} from '@chainlink/contracts/src/v0.6/interfaces/KeeperCompatibleInterface.sol';
import {Subscribers} from './Subscribers.sol';
import {PaybackLoan} from './PaybackLoan.sol';

contract LoneSomeSharkMonitor is KeeperCompatibleInterface {
  Subscribers immutable subscribers;
  KeeperRegistryBaseInterface immutable registry;

  address immutable LINK_ADDRESS;
  address internal ADMIN_ADDRESS;

  bool internal pause;
  bool internal test_trigger;
  uint256 internal registryID = 730;

  constructor(
    Subscribers _subscribers,
    KeeperRegistryBaseInterface _registry,
    address _link
  ) public {
    ADMIN_ADDRESS = msg.sender;
    LINK_ADDRESS = _link;
    subscribers = _subscribers;
    registry = _registry;
  }

  event SuccessFlashEvent(address subscriber, address[] assets, uint256[] amounts);
  event CatchFlashEvent(address subscriber, address[] assets, uint256[] amounts);
  event MonitoringTriggered(bool _paused, bool _test_triggered);

  function updateRegistryId(uint256 _id) public {
    require(ADMIN_ADDRESS == msg.sender, 'require admin to update link cost');
    registryID = _id;
  }

  function getRegistryID() public view returns (uint256) {
    return registryID;
  }

  function getRegistry() public view returns (address) {
    return address(registry);
  }

  function setPause(bool _pause) public {
    require(msg.sender == ADMIN_ADDRESS, 'need to be admin');
    pause = _pause;
  }

  function setTrigger(bool _trigger) public {
    test_trigger = _trigger;
  }

  function checkUpkeep(
    bytes calldata /* checkData */
  )
    external
    override
    returns (
      bool upkeepNeeded,
      bytes memory /* performData */
    )
  {
    // We don't use the checkData in this example. The checkData is defined when the Upkeep was registered.
    if (test_trigger) {
      upkeepNeeded = test_trigger;
    } else if (pause) {
      upkeepNeeded = !pause;
    } else {
      upkeepNeeded = subscribers.monitorSubscribersHealth();
    }
    if (upkeepNeeded) {
      emit MonitoringTriggered(pause, test_trigger);
    }
  }

  function performUpkeep(
    bytes calldata /* performData */
  ) external override {
    // We don't use the performData in this example. The performData is generated by the Keeper's call to your checkUpkeep function
    address[] memory unhealthy_accounts = subscribers.getUnhealthySubscribers();
    for (uint256 i = 0; i < unhealthy_accounts.length; i++) {
      if (unhealthy_accounts[i] != address(0)) {
        (address[] memory _assets, uint256[] memory _amounts) = subscribers.getAssetsAndAmounts(
          unhealthy_accounts[i]
        );
        if (_assets.length == _amounts.length) {
          address _payback = subscribers.getAccount(unhealthy_accounts[i]).payback;
          try PaybackLoan(_payback).flashLoanCall(unhealthy_accounts[i], _assets, _amounts) {
            emit SuccessFlashEvent(unhealthy_accounts[i], _assets, _amounts);
          } catch {
            emit CatchFlashEvent(unhealthy_accounts[i], _assets, _amounts);
          }
        }
      }
    }
  }

  // receive() external payable {}
}
