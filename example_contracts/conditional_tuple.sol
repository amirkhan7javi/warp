// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract WARP {
  function getValues() internal pure returns (uint8, uint16) {
    return (1, 2);
  }

  function useValues(bool choice) external pure returns (uint16, uint16) {
    return choice ? (3, 4) : getValues();
  }
}
