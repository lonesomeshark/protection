//SPDX-License-Identifier: Unlicense
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import {KeeperRegistryBaseInterface} from './interfaces/KeeperRegistryInterface.sol';
import {IUniswapV2Router02} from '@aave/protocol-v2/contracts/interfaces/IUniswapV2Router02.sol';
import {ILendingPool} from '@aave/protocol-v2/contracts/interfaces/ILendingPool.sol';
import {ILendingPoolAddressesProvider} from '@aave/protocol-v2/contracts/interfaces/ILendingPoolAddressesProvider.sol';
import {AaveProtocolDataProvider} from '@aave/protocol-v2/contracts/misc/AaveProtocolDataProvider.sol';
import {PaybackLoan} from './PaybackLoan.sol';

contract Subscribers {
  struct Account {
    //18 DECIMALS or 19 decimals
    // 1039353425337400353
    uint256 hf;
    bool active;
    address payback;
    uint256 threshold;
  }

  mapping(address => Account) accounts;
  address[] subscribers;
  ILendingPoolAddressesProvider immutable ADDRESSES_PROVIDER;
  address immutable WETH_ADDRESS;
  address immutable LINK_ADDRESS;
  address LONESOME_SHARK_ADDRESS;
  address internal ADMIN_ADDRESS;
  ILendingPool immutable LENDING_POOL;
  AaveProtocolDataProvider immutable aave;
  IUniswapV2Router02 immutable uniswapRouter;

  constructor(
    ILendingPoolAddressesProvider _provider,
    AaveProtocolDataProvider _aave_provider,
    IUniswapV2Router02 _uniswapRouter,
    address wethAddress,
    address linkAddress
  ) public {
    WETH_ADDRESS = wethAddress;
    LINK_ADDRESS = linkAddress;
    ADMIN_ADDRESS = msg.sender;
    ADDRESSES_PROVIDER = _provider;
    address _lendingPool = _provider.getLendingPool();
    LENDING_POOL = ILendingPool(_lendingPool);
    uniswapRouter = _uniswapRouter;
    aave = AaveProtocolDataProvider(_aave_provider);
  }

  function updateAdmin(address _new) public {
    require(address(0) != _new, 'need valid address');
    require(ADMIN_ADDRESS == msg.sender, 'only admin allowed to transfer admin');
    ADMIN_ADDRESS = _new;
  }

  function updateLoneSomeSharkAddress(address _new) public {
    require(ADMIN_ADDRESS == msg.sender, 'only admin can update');
    LONESOME_SHARK_ADDRESS = _new;
  }

  function getAccount(address _subscriber) public view returns (Account memory _account) {
    require(_subscriber != address(0), 'address not present');
    require(accounts[_subscriber].hf == 0, 'you are not registered in our records');
    require(accounts[_subscriber].active, 'user is not active in our records');
    _account = accounts[_subscriber];
  }

  function getAccount() public view returns (Account memory _account) {
    require(accounts[msg.sender].hf == 0, 'you are not registered in our records');
    require(accounts[msg.sender].active, 'you are not active in our records');
    _account = accounts[msg.sender];
  }

  function monitorSubscribersHealth() external view returns (bool needsPayback) {
    for (uint8 i = 0; i < subscribers.length; i++) {
      address addr = subscribers[i];
      if (accounts[addr].active) {
        (, , , , , uint256 hf) = LENDING_POOL.getUserAccountData(addr);
        if (hf < accounts[addr].threshold) {
          needsPayback = true;
          break;
        }
      }
    }
  }

  struct UserReserveData {
    uint256 currentATokenBalance;
    uint256 currentStableDebt;
    uint256 currentVariableDebt;
    uint256 principalStableDebt;
    uint256 scaledVariableDebt;
    uint256 stableBorrowRate;
    uint256 liquidityRate;
    uint40 stableRateLastUpdated;
    bool usageAsCollateralEnabled;
  }

  function getUserData() public returns (UserReserveData[] memory) {
    AaveProtocolDataProvider.TokenData[] memory tokenData = aave.getAllReservesTokens();
    UserReserveData[] memory data = new UserReserveData[](tokenData.length);
    for (uint256 i = 0; i < tokenData.length; i++) {
      (
        uint256 currentATokenBalance,
        uint256 currentStableDebt,
        uint256 currentVariableDebt,
        uint256 principalStableDebt,
        uint256 scaledVariableDebt,
        uint256 stableBorrowRate,
        uint256 liquidityRate,
        uint40 stableRateLastUpdated,
        bool usageAsCollateralEnabled
      ) = aave.getUserReserveData(tokenData[i].tokenAddress, msg.sender);
      data[i] = UserReserveData(
        currentATokenBalance,
        currentStableDebt,
        currentVariableDebt,
        principalStableDebt,
        scaledVariableDebt,
        stableBorrowRate,
        liquidityRate,
        stableRateLastUpdated,
        usageAsCollateralEnabled
      );
    }
    return data;
  }

  function getAssetsAndAmounts(address _subscriber)
    external
    view
    returns (address[] memory, uint256[] memory)
  {
    AaveProtocolDataProvider.TokenData[] memory tokenData = aave.getAllReservesTokens();

    for (uint256 i = 0; i < tokenData.length; i++) {
      (, , , , , , , , bool usageAsCollateralEnabled) = aave.getUserReserveData(
        tokenData[i].tokenAddress,
        _subscriber
      );
      if (usageAsCollateralEnabled) {}
    }
  }

  function getUnhealthySubscribers() external view returns (address[] memory) {
    uint8 j = 0;
    address[] memory _unhealthy_subscribers = new address[](subscribers.length);
    for (uint8 i = 0; i < subscribers.length; i++) {
      address addr = subscribers[i];
      if (accounts[addr].active) {
        (, , , , , uint256 hf) = LENDING_POOL.getUserAccountData(addr);
        if (hf <= accounts[addr].threshold) {
          j++;
          _unhealthy_subscribers[j] = addr;
        }
      }
    }
    return _unhealthy_subscribers;
  }

  function activate(uint256 _threshold) public payable {
    require(!accounts[msg.sender].active, 'user has already been activated');
    require(_threshold >= 100 * 10**16, 'threshold below 1');
    require(_threshold <= 101 * 10**16, 'threshold too high, above 1.1');
    (, , , , , uint256 healthFactor) = LENDING_POOL.getUserAccountData(msg.sender);
    accounts[msg.sender].hf = healthFactor;
    accounts[msg.sender].active = true;
    accounts[msg.sender].threshold = _threshold;
    PaybackLoan _payback = new PaybackLoan(
      ADDRESSES_PROVIDER,
      uniswapRouter,
      this,
      WETH_ADDRESS,
      LONESOME_SHARK_ADDRESS
    );
    accounts[msg.sender].payback = address(_payback);
    payable(address(_payback)).call{value: 2000};
    subscribers.push(msg.sender);
  }
}
