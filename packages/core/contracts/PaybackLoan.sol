// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import { FlashLoanReceiverBase } from "@aave/protocol-v2/contracts/flashloan/base/FlashLoanReceiverBase.sol";
import { ILendingPool } from "@aave/protocol-v2/contracts/interfaces/ILendingPool.sol";
import { ILendingPoolAddressesProvider } from "@aave/protocol-v2/contracts/interfaces/ILendingPoolAddressesProvider.sol";
import { IERC20 } from "@aave/protocol-v2/contracts/dependencies/openzeppelin/contracts/IERC20.sol";
import { ERC20 } from "@aave/protocol-v2/contracts/dependencies/openzeppelin/contracts/ERC20.sol";
// https://docs.aave.com/developers/guides/flash-loans#step-by-step
/** 
    !!!
    Never keep funds permanently on your FlashLoanReceiverBase contract as they could be 
    exposed to a 'griefing' attack, where the stored funds are used by an attacker.
    !!!
 */
contract PaybackLoan is FlashLoanReceiverBase {


    address immutable owner;
    constructor(ILendingPoolAddressesProvider _provider) 
    FlashLoanReceiverBase(_provider) 
    public {
        owner = msg.sender;
        // payable(address(this)).call{value: msg.value}("");
    }
    /**
        This function is called after your contract has received the flash loaned amount
     */
    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address initiator,
        bytes calldata params
    )
        external
        override
        returns (bool)
    {
        //
        // This contract now has the funds requested.
        // Your logic goes here.
        //

        address onBehalfOf = address(this);
        // deposits the flashed onto the lending pool
        for(uint i=0; i< assets.length; i++){
            // IERC20(assets[i]).approve(address(LENDING_POOL), amounts[i]);
            // LENDING_POOL.deposit(assets[i], amounts[i], onBehalfOf, uint16(0));
            // approve the repayment from this contract
            IERC20(assets[i]).approve(address(LENDING_POOL), amounts[i]);
            // function repay( address _reserve, uint256 _amount, address payable _onBehalfOf)
            LENDING_POOL.repay(assets[i], amounts[i], 1, onBehalfOf);

        }

            // LENDING_POOL.withdraw(assets[i], amounts[i], onBehalfOf);
        
        // At the end of your logic above, this contract owes
        // the flashloaned amounts + premiums.
        // Therefore ensure your contract has enough to repay
        // these amounts.
        
        // Approve the LendingPool contract allowance to *pull* the owed amount
        for (uint i = 0; i < assets.length; i++) {
            uint amountOwing = amounts[i].add(premiums[i]);
            IERC20(assets[i]).approve(address(LENDING_POOL), amountOwing);
        }
        
        return true;
    }
   

     function flashLoanCall(address _subscriber, address[] memory assets, uint[] memory amounts) public {
        require(_subscriber== owner,"_subscriber needs to own the payback contract");
        require(assets.length == amounts.length, "assets and amounts have no equal length");
        address receiverAddress = address(this);
        uint256[] memory modes = new uint256[](amounts.length);
        for(uint i = 0; i< assets.length;i++){
            // assets[i]=_assets[i];
            // amounts[i]=_amounts[i];
            // 0 = no debt, 1 = stable, 2 = variable
            modes[0] = 0;
        }

        address onBehalfOf = address(this);
        bytes memory params = "";
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

    // receive() payable external {}
}