// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract bAlphaToken is ERC20("bAlpha", "bALPHA"), Ownable {
    uint256 public cap = 18000e18 + 1e17;
    address public bAlphaMaster;
    mapping(address => uint) public redeemed;

    constructor(address _sendTo) public {
        _mint(_sendTo, 1e17);
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);

        if (from == address(0)) {
            require(totalSupply().add(amount) <= cap, "ERC20Capped: cap exceeded");
        }
    }

    function setMaster(address _bAlphaMaster) public onlyOwner {
        bAlphaMaster = _bAlphaMaster;
    }

    function mint(address _to, uint256 _amount) public {
        require(msg.sender == bAlphaMaster, "bAlphaToken: only master farmer can mint");
        _mint(_to, _amount);
    }

    function safeBurn(uint256 _amount) public {
        uint canBurn = canBurnAmount(msg.sender);
        uint burnAmount = canBurn > _amount ? _amount : canBurn;
        redeemed[msg.sender] += burnAmount;
        _burn(msg.sender, burnAmount);
    }

    function burn(uint256 _amount) public {
        require(redeemed[msg.sender] + _amount <= 1e18, "bAlpphaToken: cannot burn more than 1 bAlpha");
        redeemed[msg.sender] += _amount;
        _burn(msg.sender, _amount);
    }

    function canBurnAmount(address _add) public view returns (uint) {
        return 1e18 - redeemed[_add];
    }
}