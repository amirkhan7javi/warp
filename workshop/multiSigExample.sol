// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;
import '../tests/behaviour/contracts/ERC20/ERC20.sol';
contract MultiSigWallet is WARP {
  // Events
  event Deposit(address sender, uint256 amount);
  event Submit(uint256 txId);
  event Approve(address owner, uint256 txId);
  event Revoke(address owner, uint256 txId);
  event Execute(uint256 txId);
  
  // Struct Definition
  struct Transaction {
    address to;
    uint256 value;
    bool executed;
  }

  // Storage
  address[] public owners;
  mapping(address => bool) public isOwner;
  uint256 public requiredApprovals;
  Transaction[] public transactions;
  //txId => owner => true/false
  mapping(uint256 => mapping(address => bool)) public txApprovals;

  // Modifiers
  modifier onlyOwner() {
    require(isOwner[msg.sender], 'You are not one of the owners');
    _;
  }
  modifier txExists(uint256 _txId) {
    require(transactions.length > _txId, 'Transaction does not exist');
    _;
  }
  modifier notApproved(uint256 _txId) {
    require(!txApprovals[_txId][msg.sender], 'Transaction already approved');
    _;
  }
  modifier notExecuted(uint256 _txId) {
    require(!transactions[_txId].executed, 'Transaction already executed');
    _;
  }

  
  constructor(address[] memory _owners, uint256 _requiredApprovals) {
    require(_owners.length > 0, 'At least 1 owner is required');
    require(_requiredApprovals > 0 && _requiredApprovals <= _owners.length, 'Invalid required number of owners');
    for (uint256 i = 0; i < _owners.length; i++) {
      address owner = _owners[i];
      require(owner != address(0), 'Invalid owner');
      require(!isOwner[owner], 'Multiple instance of an owner');
      isOwner[owner] = true;
      owners.push(owner);
    }
    requiredApprovals = _requiredApprovals;
  }

  function submit(
    address _to,
    uint256 _value
  ) external onlyOwner {
    transactions.push(Transaction({to: _to, value: _value, executed: false}));
    emit Submit(transactions.length - 1);
  }

  function approve(uint256 _txId)
    external
    onlyOwner
    txExists(_txId)
    notApproved(_txId)
    notExecuted(_txId)
  {
    txApprovals[_txId][msg.sender] = true;
    emit Approve(msg.sender, _txId);
  }

  function _getApprovalCount(uint256 _txId) public view returns (uint256 count) {
    for (uint256 i = 0; i < owners.length; i++) {
      if (txApprovals[_txId][owners[i]]) {
        count += 1;
      }
    }
  }

  function execute(uint256 _txId) external txExists(_txId) notExecuted(_txId) {
    require(
      _getApprovalCount(_txId) >= requiredApprovals,
      'Not enough approvals to execute the transaction'
    );
    Transaction storage transaction = transactions[_txId];
    transaction.executed = true;
    mint(msg.sender, transaction.value);
    transfer(transaction.to, transaction.value);
    emit Execute(_txId);
  }

  function revoke(uint256 _txId) external onlyOwner txExists(_txId) notExecuted(_txId) {
    require(txApprovals[_txId][msg.sender], 'Transaction already not approved');
    txApprovals[_txId][msg.sender] = false;
    emit Revoke(msg.sender, _txId);
  }
}