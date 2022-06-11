// SPDX-License-Identifier: TEST
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./EthBank.sol";

contract EthBankV2 is EthBank, OwnableUpgradeable {
    bool public paused;

    event Transfered(
        address indexed to,
        address indexed token,
        uint256 indexed amount
    );
    event Sent(
        address indexed to,
        address indexed token,
        uint256 indexed amount
    );

    function initialize() public initializer {
        __Ownable_init();
    }

    function upgrade() public reinitializer(2) {
        __Ownable_init();
    }

    function name() public pure override returns (bytes32) {
        return "EthBankV2";
    }

    /**
        Scenario 3
        Pause
     */
    function pause() public onlyOwner {
        paused = true;
    }

    /**
        Scenario 3
        Resume
     */
    function resume() public onlyOwner {
        paused = false;
    }

    /**
        Scenario 3
        Deposit with pausable
     */
    function deposit(address token_, uint256 amount_) public override {
        require(!paused, "Transaction is paused");
        EthBank.deposit(token_, amount_);
    }

    /**
        Scenario 2
        Transfer Amount from one registered account to another within the bank

        Scenario 3
        Ability to pause
     */
    function transfer(
        address to_,
        address token_,
        uint256 amount_
    ) public {
        require(!paused, "Transaction is paused");
        require(msg.sender != to_, "Receiver is you");
        require(_accounts[msg.sender], "Sender is not created");
        require(_accounts[to_], "Receiver is not created");

        require(amount_ > 0, "Amount is not correct");
        require(
            _balances[msg.sender][token_] >= amount_,
            "Insufficient amount"
        );
        _balances[msg.sender][token_] -= amount_;
        _balances[to_][token_] += amount_;
        emit Transfered(to_, token_, amount_);
    }

    /**
        Scenario 2
        Send Amount to any external wallet address

        Scenario 3
        Ability to pause
     */
    function send(
        address to_,
        address token_,
        uint256 amount_
    ) public {
        require(!paused, "Transaction is paused");
        require(_accounts[msg.sender], "Sender is not created");
        require(amount_ > 0, "Amount is not correct");
        require(
            _balances[msg.sender][token_] >= amount_,
            "Insufficient amount"
        );
        _balances[msg.sender][token_] -= amount_;
        IERC20(token_).transfer(to_, amount_);
        emit Sent(to_, token_, amount_);
    }
}
