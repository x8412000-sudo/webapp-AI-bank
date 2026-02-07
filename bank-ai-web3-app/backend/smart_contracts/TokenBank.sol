// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TokenBank
 * @dev ERC20 token for Digital Trust Bank with minting capabilities
 */
contract TokenBank is ERC20, Ownable {
    
    // Mapping to track user balances in the bank
    mapping(address => uint256) public bankBalances;
    
    // Events
    event TokensDeposited(address indexed user, uint256 amount);
    event TokensWithdrawn(address indexed user, uint256 amount);
    event InterestPaid(address indexed user, uint256 amount);
    
    // Interest rate (in basis points, 100 = 1%)
    uint256 public interestRate = 500; // 5% annual interest
    
    // Last interest payment timestamp per user
    mapping(address => uint256) public lastInterestPayment;
    
    constructor() ERC20("Digital Trust Bank Token", "DTB") {
        // Mint initial supply to contract deployer
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
    
    /**
     * @dev Deposit tokens into the bank
     * @param amount Amount of tokens to deposit
     */
    function depositTokens(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient token balance");
        
        // Transfer tokens from user to contract
        _transfer(msg.sender, address(this), amount);
        
        // Update bank balance
        bankBalances[msg.sender] += amount;
        lastInterestPayment[msg.sender] = block.timestamp;
        
        emit TokensDeposited(msg.sender, amount);
    }
    
    /**
     * @dev Withdraw tokens from the bank
     * @param amount Amount of tokens to withdraw
     */
    function withdrawTokens(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(bankBalances[msg.sender] >= amount, "Insufficient bank balance");
        
        // Calculate and pay interest first
        _payInterest(msg.sender);
        
        // Update bank balance
        bankBalances[msg.sender] -= amount;
        
        // Transfer tokens back to user
        _transfer(address(this), msg.sender, amount);
        
        emit TokensWithdrawn(msg.sender, amount);
    }
    
    /**
     * @dev Get user's bank balance
     * @param user Address of the user
     * @return Bank balance of the user
     */
    function getBankBalance(address user) external view returns (uint256) {
        return bankBalances[user];
    }
    
    /**
     * @dev Calculate interest for a user
     * @param user Address of the user
     * @return Interest amount
     */
    function calculateInterest(address user) public view returns (uint256) {
        uint256 balance = bankBalances[user];
        if (balance == 0) return 0;
        
        uint256 timeSinceLastPayment = block.timestamp - lastInterestPayment[user];
        uint256 secondsInYear = 365 days;
        
        // Interest = balance * interestRate * time / (10000 * secondsInYear)
        uint256 interest = (balance * interestRate * timeSinceLastPayment) / (10000 * secondsInYear);
        
        return interest;
    }
    
    /**
     * @dev Pay interest to a user
     * @param user Address of the user
     */
    function _payInterest(address user) internal {
        uint256 interest = calculateInterest(user);
        
        if (interest > 0) {
            // Mint new tokens as interest
            _mint(address(this), interest);
            
            // Add interest to user's bank balance
            bankBalances[user] += interest;
            lastInterestPayment[user] = block.timestamp;
            
            emit InterestPaid(user, interest);
        }
    }
    
    /**
     * @dev Claim interest for the caller
     */
    function claimInterest() external {
        _payInterest(msg.sender);
    }
    
    /**
     * @dev Set interest rate (only owner)
     * @param newRate New interest rate in basis points
     */
    function setInterestRate(uint256 newRate) external onlyOwner {
        require(newRate <= 2000, "Interest rate too high"); // Max 20%
        interestRate = newRate;
    }
    
    /**
     * @dev Mint new tokens (only owner)
     * @param to Address to mint to
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Transfer tokens with built-in interest payment
     */
    function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
        // Pay interest to sender before transfer
        if (bankBalances[msg.sender] > 0) {
            _payInterest(msg.sender);
        }
        
        return super.transfer(recipient, amount);
    }
    
    /**
     * @dev Get total bank deposits
     * @return Total tokens deposited in the bank
     */
    function totalBankDeposits() external view returns (uint256) {
        return balanceOf(address(this));
    }
}