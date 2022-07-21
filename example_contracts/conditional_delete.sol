// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.13;

contract Warp {
  bool locked = false;
  uint256 x = 10000000;

  function test() public {
    return locked ? aux() : delete x;
  }

  function aux() private {
    x = 10000000;
    locked = false;
  }
}
