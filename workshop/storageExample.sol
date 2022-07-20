pragma solidity ^0.8.0;
//SPDX-License-Identifier: MIT

contract StorageExample {
    struct S1 {
        uint8 x;
    }

    struct S2 {
        uint8 y;
        S1 z;
    }

    S2 struct1;
    mapping (uint8 => uint) mapping1;
    mapping (uint8 => uint) mapping2;

    function structExample() external returns (S2 memory) {
        struct1 = S2(10, S1(11));
        return struct1;
    }
    
    function mappingExample() external {
        mapping1[1] = 11;
        mapping2[1] = 22;
    }
}