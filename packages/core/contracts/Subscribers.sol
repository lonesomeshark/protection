//SPDX-License-Identifier: Unlicense
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;
import { ILendingPool } from "@aave/protocol-v2/contracts/interfaces/ILendingPool.sol";
import { ILendingPoolAddressesProvider } from "@aave/protocol-v2/contracts/interfaces/ILendingPoolAddressesProvider.sol";
import {AaveProtocolDataProvider} from '@aave/protocol-v2/contracts/misc/AaveProtocolDataProvider.sol';
import { PaybackLoan } from "./PaybackLoan.sol";


contract Subscribers {
    struct Account {
        //18 DECIMALS or 19 decimals
        // 1039353425337400353
        uint hf;
        bool active;
        address payback;
        uint threshold;
    }

    mapping(address => Account) accounts;
    address[] subscribers;
    ILendingPoolAddressesProvider public immutable ADDRESSES_PROVIDER;

    ILendingPool immutable lendingPool;
    AaveProtocolDataProvider immutable aave;
    constructor(ILendingPoolAddressesProvider _provider, AaveProtocolDataProvider _aave_provider ) public {
        ADDRESSES_PROVIDER =  _provider;
        address _lendingPool = _provider.getLendingPool();
        lendingPool = ILendingPool(_lendingPool);
        aave = AaveProtocolDataProvider(_aave_provider);
    }
    function getAccount(address _subscriber) public view returns (Account memory _account){ 
        require(_subscriber != address(0),"address not present");
        require(accounts[_subscriber].hf == 0, "you are not registered in our records");
        require(accounts[_subscriber].active, "user is not active in our records");
        _account = accounts[_subscriber];
    }
    function getAccount() public view returns (Account memory _account){
        require(accounts[msg.sender].hf == 0, "you are not registered in our records");
        require(accounts[msg.sender].active, "you are not active in our records");
        _account = accounts[msg.sender]; 
    }
    function monitorSubscribersHealth() external view returns (bool needsPayback) {
      for(uint8 i=0; i < subscribers.length; i++){
        address addr   = subscribers[i];
        if(accounts[addr].active) {
             (,,,,,uint256 hf) = lendingPool.getUserAccountData(addr);
             if(hf < accounts[addr].threshold){
                 needsPayback = true;
                 break;
             }
        }
      }
    }
    function getAssetsAndAmounts(address _subscriber) external view returns (address[] memory, uint[] memory) {
          AaveProtocolDataProvider.TokenData[] memory tokenData =  aave.getAllReservesTokens();

          for(uint i=0; i < tokenData.length; i++){
          ( , , , , , , , , bool usageAsCollateralEnabled) = aave.getUserReserveData(tokenData[i].tokenAddress, _subscriber);
            if(usageAsCollateralEnabled){

            }
          }

    }

    function getUnhealthySubscribers() external view returns (address[] memory) {
      uint8 j=0;
      address[] memory _unhealthy_subscribers = new address[](subscribers.length);
      for(uint8 i=0; i < subscribers.length; i++){
        address addr   = subscribers[i];
        if(accounts[addr].active) {
             (,,,,,uint256 hf) = lendingPool.getUserAccountData(addr);
             if(hf <= accounts[addr].threshold){
                 j++;
                 _unhealthy_subscribers[j]=addr;
             }
        }
      }
      return _unhealthy_subscribers;
    }
   
    function activate(uint _threshold) public  {
        require(!accounts[msg.sender].active, "user has already been activated");
        require(_threshold>= 100*10**16, "threshold below 1");
        require(_threshold<= 101*10**16, "threshold too high, above 1.1");
        (,,,,,uint healthFactor) = lendingPool.getUserAccountData(msg.sender);
        accounts[msg.sender].hf = healthFactor; 
        accounts[msg.sender].active = true;
        accounts[msg.sender].threshold = _threshold;
        PaybackLoan _payback = new PaybackLoan(ADDRESSES_PROVIDER);
        accounts[msg.sender].payback = address(_payback);
        payable(address(_payback)).call{value: 2000};
        subscribers.push(msg.sender);
    }


}