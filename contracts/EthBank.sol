// SPDX-License-Identifier: TEST
pragma solidity ^0.8.0;
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract EthBank is Initializable {
    mapping(address => mapping(address => uint256)) internal _balances;
    mapping(address => bool) internal _accounts;

    event AccountCreated(address indexed account);
    event Deposited(
        address indexed account,
        address indexed token,
        uint256 indexed amount
    );
    event Withdrawn(
        address indexed account,
        address indexed token,
        uint256 indexed amount
    );

    function name() public pure virtual returns (bytes32) {
        return "EthBank";
    }

    function symbol() public pure virtual returns (bytes32) {
        return "ETB";
    }

    /**
        Scenario 1
        Create Account
     */
    function createAccount() public {
        require(msg.sender != address(0), "Should be valid address");
        require(!_accounts[msg.sender], "Account is created already");
        _accounts[msg.sender] = true;
        emit AccountCreated(msg.sender);
    }

    /**
        Scenario 1
        Deposit Amount
     */
    function deposit(address token_, uint256 amount_) public virtual {
        require(_accounts[msg.sender], "Account is not created");
        require(amount_ > 0, "Amount is not correct");
        _balances[msg.sender][token_] += amount_;
        IERC20(token_).transferFrom(msg.sender, address(this), amount_);
        emit Deposited(msg.sender, token_, amount_);
    }

    /**
        Scenario 1
        Withdraw Amount
     */
    function withdraw(address token_, uint256 amount_) public virtual {
        require(_accounts[msg.sender], "Account is not created");
        require(amount_ > 0, "Amount is not correct");
        require(
            _balances[msg.sender][token_] >= amount_,
            "Insufficient amount"
        );
        _balances[msg.sender][token_] -= amount_;
        IERC20(token_).transfer(msg.sender, amount_);
        emit Withdrawn(msg.sender, token_, amount_);
    }

    /**
        Scenario 1
        Get Account Balance
     */
    function getAccountBalance(address account, address token_)
        public
        view
        returns (uint256)
    {
        return _balances[account][token_];
    }
}
