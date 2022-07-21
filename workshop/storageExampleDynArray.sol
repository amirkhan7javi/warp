pragma solidity ^0.8.0;
//SPDX-License-Identifier: MIT

contract StorageExample {
    
    uint8 x;

    uint256[] dynArray1;
    uint256[] dynArray2;

    function dynArrayRead() view external returns (uint256) {
        return dynArray1[0];
    }

    function dynArrayPush() external {
        dynArray1.push(33);
        dynArray2.push(44);
    }

    constructor() {
        dynArray1.push(11);
        x = 33;
        dynArray2.push(22);
    }
}
