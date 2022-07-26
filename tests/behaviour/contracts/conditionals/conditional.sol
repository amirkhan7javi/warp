pragma solidity ^0.8.10;

// SPDX-License-Identifier: MIT

contract WARP {
  uint256 public x;

  function simpleScalar(
    bool choice,
    uint8 a,
    uint8 b
  ) public pure returns (uint8) {
    return choice ? a : b;
  }

  function voidReturn() public {
    return (x == 0) ? g() : (x < 10) ? f() : h();
  }

  function f() public {
    x = 10;
  }

  function g() public {
    x = 5;
  }

  function h() public {
    x = 20;
  }
}
