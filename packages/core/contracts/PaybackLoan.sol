// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import {IUniswapV2Router02} from '@aave/protocol-v2/contracts/interfaces/IUniswapV2Router02.sol';
import {BaseUniswapAdapter} from '@aave/protocol-v2/contracts/adapters/BaseUniswapAdapter.sol';
import {FlashLoanReceiverBase} from '@aave/protocol-v2/contracts/flashloan/base/FlashLoanReceiverBase.sol';
import {ILendingPool} from '@aave/protocol-v2/contracts/interfaces/ILendingPool.sol';
import {ILendingPoolAddressesProvider} from '@aave/protocol-v2/contracts/interfaces/ILendingPoolAddressesProvider.sol';
import {IERC20} from '@aave/protocol-v2/contracts/dependencies/openzeppelin/contracts/IERC20.sol';

import {Subscribers} from './Subscribers.sol';

contract PaybackLoan is BaseUniswapAdapter {
  address immutable LONESOME_SHARK_MONITOR;
  address immutable DEBTOR;
  Subscribers subscribers;
  struct FlashParams {
    address user;
  }

  constructor(
    ILendingPoolAddressesProvider _provider,
    IUniswapV2Router02 _uniswapRouter,
    Subscribers _subscriber,
    address _wethAddress,
    address _lonesome_shark,
    address user
  ) public BaseUniswapAdapter(_provider, _uniswapRouter, _wethAddress) {
    subscribers = _subscriber;
    LONESOME_SHARK_MONITOR = _lonesome_shark;
    DEBTOR = user;
  }

  function executeOperation(
    address[] calldata assets,
    uint256[] calldata amounts,
    uint256[] calldata premiums,
    address initiator,
    bytes calldata params
  ) external override returns (bool) {
    require(msg.sender == address(LENDING_POOL), 'CALLER_MUST_BE_LENDING_POOL');
    FlashParams memory decodedParams = _decodeParams(params);
    require(decodedParams.user == DEBTOR, 'THIS CONTRACT IS FOR DEBTOR ONLY');

    address onBehalfOf = address(this);
    // deposits the flashed onto the lending pool
    for (uint256 i = 0; i < assets.length; i++) {
      // IERC20(assets[i]).approve(address(LENDING_POOL), amounts[i]);
      // LENDING_POOL.deposit(assets[i], amounts[i], onBehalfOf, uint16(0));
      // approve the repayment from this contract
      IERC20(assets[i]).approve(address(LENDING_POOL), amounts[i]);
      // function repay( address _reserve, uint256 _amount, address payable _onBehalfOf)
      LENDING_POOL.repay(assets[i], amounts[i], 1, decodedParams.user);
    }

    // LENDING_POOL.withdraw(assets[i], amounts[i], onBehalfOf);

    // Approve the LendingPool contract allowance to *pull* the owed amount
    for (uint256 i = 0; i < assets.length; i++) {
      uint256 amountOwing = amounts[i].add(premiums[i]);
      IERC20(assets[i]).approve(address(LENDING_POOL), amountOwing);
    }

    return true;
  }

  function flashLoanCall(
    address _subscriber,
    address[] memory assets,
    uint256[] memory amounts
  ) public {
    require(msg.sender == LONESOME_SHARK_MONITOR, 'CALLER_MUST_BE_LONESOME_SHARK');
    require(_subscriber == owner(), '_subscriber needs to own the payback contract');
    require(assets.length == amounts.length, 'assets and amounts have no equal length');
    address receiverAddress = address(this);
    uint256[] memory modes = new uint256[](amounts.length);
    for (uint256 i = 0; i < assets.length; i++) {
      // assets[i]=_assets[i];
      // amounts[i]=_amounts[i];
      // 0 = no debt, 1 = stable, 2 = variable
      modes[0] = 0;
    }

    address onBehalfOf = address(this);
    bytes memory params = abi.encode(_subscriber);
    uint16 referralCode = 0;

    LENDING_POOL.flashLoan(
      receiverAddress,
      assets,
      amounts,
      modes,
      onBehalfOf,
      params,
      referralCode
    );
  }

  function _decodeParams(bytes memory params) internal pure returns (FlashParams memory) {
    address user = abi.decode(params, (address));

    return FlashParams(user);
  }

  // receive() payable external {}

  function getBalance() public view returns (uint256) {
    return address(this).balance;
  }
}
