//SPDX-License-Identifier: RatLab
// contract has been done by Ratlabs
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC20Token1 is ERC20("ERC20Token1", "TK1"), Ownable {
    function mint(address to_, uint256 amount_) public onlyOwner {
        _mint(to_, amount_);
    }
}
