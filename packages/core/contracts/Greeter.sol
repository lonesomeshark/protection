//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import 'hardhat/console.sol';

contract Greeter {
  string private greeting;

  constructor(string memory _greeting) {
    console.log('Deploying a Greeter with greeting:', _greeting);
    greeting = _greeting;
  }

  function greet() public view returns (string memory) {
    return greeting;
  }

  function setGreeting(string memory _greeting) public {
    console.log("Changing greeting from '%s' to '%s'", greeting, _greeting);
    greeting = _greeting;
  }

  function setGreeting(string memory _greeting, string memory _prefix) public {
    console.log("Changing greeting from '%s' to '%s'", greeting, _greeting);

    greeting = string(abi.encodePacked(_prefix, _greeting));
  }

  function checklength(address[] memory assets, uint256[] memory amounts) public pure {
    require(assets.length == amounts.length, 'it is not matching length');
  }

  function checkAddressArray() public view returns (address[] memory) {
    uint8 len = 3;
    address[] memory _addresses = new address[](len);
    for (uint8 i = 0; i < len; i++) {
      _addresses[i] = address(this);
    }
    return _addresses;
  }

  function checkAddressInitializedArray() public view returns (address[] memory) {
    uint8 len = 3;
    address[] memory _addresses = new address[](len);
    for (uint8 i = 0; i < len; i++) {
      if (i != 2) {
        _addresses[i] = address(this);
      }
    }
    return _addresses;
  }

  function checkAddressNotInitializedArray() public view returns (address[] memory) {
    uint8 len = 3;
    uint256 j;
    for (uint8 i = 0; i < len; i++) {
      if (i != 2) {
        j++;
      }
    }
    address[] memory _addresses = new address[](j);
    uint256 u;
    for (uint8 i = 0; i < len; i++) {
      if (i != 2) {
        _addresses[u] = address(this);
        u++;
      }
    }
    return _addresses;
  }

  function sendEthersToUser() public {
    if (address(this).balance >= 1 ether) {
      payable(msg.sender).transfer(1 ether);
    } else {
      console.log('no funds: %s', address(this).balance);
    }
  }

  function sendEthersToUserCall() public {
    (bool success, ) = payable(msg.sender).call{value: 1 ether}('');
    require(success, 'Transfer failed.');
  }

  function approveToSpend(address payable _user) public {
    // _user.approve(1 ether);
  }

  receive() external payable {}
}
