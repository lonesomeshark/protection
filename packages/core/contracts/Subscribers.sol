//SPDX-License-Identifier: Unlicense
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import {KeeperRegistryBaseInterface} from './interfaces/KeeperRegistryInterface.sol';
import {IUniswapV2Router02} from '@aave/protocol-v2/contracts/interfaces/IUniswapV2Router02.sol';
import {ILendingPool} from '@aave/protocol-v2/contracts/interfaces/ILendingPool.sol';
import {ILendingPoolAddressesProvider} from '@aave/protocol-v2/contracts/interfaces/ILendingPoolAddressesProvider.sol';
import {AaveProtocolDataProvider} from '@aave/protocol-v2/contracts/misc/AaveProtocolDataProvider.sol';
import {PaybackLoan} from './PaybackLoan.sol';
import {IERC20} from '@aave/protocol-v2/contracts/dependencies/openzeppelin/contracts/IERC20.sol';

import {LoneSomeSharkMonitor} from './LoneSomeSharkMonitor.sol';

contract Subscribers {
  uint256 immutable MAX = 2**256 - 1;
  uint256 internal UPKEEP_ID;

  enum Status {
    PAUSED,
    REGISTERED,
    ACTIVATED
  }
  struct Account {
    Status status;
    address payable payback;
    uint256 threshold;
    address[] collaterals;
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
    address token;
    string symbol;
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

  function updateUpkeepID(uint256 _id) public {
    require(ADMIN_ADDRESS == msg.sender, 'only admin allowed to update');
    UPKEEP_ID = _id;
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

  function getAccount(address _subscriber) public view returns (Account memory) {
    require(_subscriber != address(0), 'address not present');
    return accounts[_subscriber];
  }

  function getAccount() public view returns (Account memory) {
    return accounts[msg.sender];
  }

  function monitorSubscribersHealth() external view returns (bool needsPayback) {
    for (uint8 i = 0; i < subscribers.length; i++) {
      address addr = subscribers[i];
      if (accounts[addr].status == Status.ACTIVATED) {
        (, , , , , uint256 hf) = LENDING_POOL.getUserAccountData(addr);
        if (hf < accounts[addr].threshold) {
          needsPayback = true;
          break;
        }
      }
    }
  }

  function getUserData()
    public
    view
    returns (
      UserReserveData[] memory,
      uint256 totalCollateralETH,
      uint256 totalDebtETH,
      uint256 availableBorrowsETH,
      uint256 currentLiquidationThreshold,
      uint256 ltv,
      uint256 healthFactor
    )
  {
    AaveProtocolDataProvider.TokenData[] memory tokenData = aave.getAllReservesTokens();
    UserReserveData[] memory userTokenData = new UserReserveData[](tokenData.length);
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
      userTokenData[i] = UserReserveData(
        currentATokenBalance,
        currentStableDebt,
        currentVariableDebt,
        principalStableDebt,
        scaledVariableDebt,
        stableBorrowRate,
        liquidityRate,
        stableRateLastUpdated,
        usageAsCollateralEnabled,
        tokenData[i].tokenAddress,
        tokenData[i].symbol
      );
    }

    (
      totalCollateralETH,
      totalDebtETH,
      availableBorrowsETH,
      currentLiquidationThreshold,
      ltv,
      healthFactor
    ) = LENDING_POOL.getUserAccountData(msg.sender);

    return (
      userTokenData,
      totalCollateralETH,
      totalDebtETH,
      availableBorrowsETH,
      currentLiquidationThreshold,
      ltv,
      healthFactor
    );
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
      if (accounts[addr].status == Status.ACTIVATED) {
        (, , , , , uint256 hf) = LENDING_POOL.getUserAccountData(addr);
        if (hf <= accounts[addr].threshold) {
          j++;
          _unhealthy_subscribers[j] = addr;
        }
      }
    }
    return _unhealthy_subscribers;
  }

  function startMonitoring() public {
    if (accounts[msg.sender].status >= Status.REGISTERED) {
      accounts[msg.sender].status = Status.ACTIVATED;
    }
  }

  function pauseMonitoring() public hasAccount {
    accounts[msg.sender].status = Status.PAUSED;
  }

  modifier checkHF(uint256 _threshold) {
    require(_threshold >= 100 * 10**16, 'threshold below 1');
    require(_threshold <= 101 * 10**16, 'threshold too high, above 1.1');
    _;
  }
  modifier hasAccount() {
    require(accounts[msg.sender].payback != address(0), 'ALREADY HAS AN ACCOUNT');
    _;
  }
  modifier hasNoAccount() {
    require(accounts[msg.sender].payback == address(0), 'ALREADY HAS AN ACCOUNT');
    _;
  }

  function updateHF(uint256 _threshold) public checkHF(_threshold) hasAccount {
    accounts[msg.sender].threshold = _threshold;
  }

  function registerHF(uint256 _threshold) public payable checkHF(_threshold) hasNoAccount {
    accounts[msg.sender].status = Status.REGISTERED;
    accounts[msg.sender].threshold = _threshold;
    subscribers.push(msg.sender);
    PaybackLoan _payback = new PaybackLoan(
      ADDRESSES_PROVIDER,
      uniswapRouter,
      this,
      WETH_ADDRESS,
      LONESOME_SHARK_ADDRESS,
      msg.sender
    );
    accounts[msg.sender].payback = address(_payback);
    payable(accounts[msg.sender].payback).transfer(msg.value);
  }

  function addMoreGas() public payable hasAccount {
    payable(accounts[msg.sender].payback).transfer(msg.value);
  }

  function approveAsCollateralOnlyIfAllowedInAave(address _token) public {
    require(accounts[msg.sender].status == Status.REGISTERED, 'NEED TO BE REGISTERED');
    IERC20(_token).approve(accounts[msg.sender].payback, MAX);
    accounts[msg.sender].collaterals.push(_token);
  }
}
