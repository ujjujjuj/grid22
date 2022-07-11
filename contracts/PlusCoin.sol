//SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PlusCoin is ERC20 {
    constructor(uint initialSupply) ERC20("PlusCoin", "PLUS") {
        _mint(msg.sender, initialSupply);
    }
}