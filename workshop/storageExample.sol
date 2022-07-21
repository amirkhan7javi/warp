pragma solidity ^0.8.0;
//SPDX-License-Identifier: MIT

contract StorageExample {
    
    uint8 x;

    mapping (uint8 => uint) mapping1;
    mapping (uint8 => uint) mapping2;

    
    function mappingExample() external {
        mapping1[2] = 44;
        mapping2[2] = 55;
    }

    constructor() {
        mapping1[1] = 11;
        x = 33;
        mapping2[1] = 22;
    }
}
