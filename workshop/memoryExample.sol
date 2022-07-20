pragma solidity ^0.8.0;
//SPDX-License-Identifier: MIT

contract MemExample {
    struct S1 {
        uint8 x;
    }

    struct S2 {
        uint8 y;
        S1 z;
    }

    function f() external pure returns (S2 memory) {
        S2 memory struct1 = S2(10, S1(11));
        S2 memory struct2 = S2(20, S1(22));
        return struct2;
    }
}