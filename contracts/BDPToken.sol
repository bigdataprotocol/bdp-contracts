// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract BDPToken is ERC20("BDPToken", "BDP"), Ownable {
    using SafeMath for uint256;

    uint256 public NUMBER_BLOCKS_PER_DAY;
    uint256 public cap = 80000000e18 + 1e18;
    address public BDPMaster;
    address public BDPMasterPending;
    uint public setBDPMasterPendingAtBlock;

    uint256 public seedPoolAmount = 24000000e18;

    uint256 constant public PARTNERSHIP_TOTAL_AMOUNT = 20000000e18;
    uint256 constant public PARTNERSHIP_FIRST_MINT = 8000000e18;
    uint256 public partnershipAmount = PARTNERSHIP_TOTAL_AMOUNT;
    uint256 public partnershipMintedAtBlock = 0;

    uint256 constant public TEAM_TOTAL_AMOUNT = 8000000e18;
    uint256 public teamAmount = TEAM_TOTAL_AMOUNT;
    uint256 public teamMintedAtBlock = 0;

    uint256 constant public FUTURE_TOTAL_AMOUNT = 28000000e18;
    uint256 constant public FUTURE_EACH_MINT = 9333333e18;
    uint256 public futureAmount = FUTURE_TOTAL_AMOUNT;
    uint256 public futureCanMintAtBlock = 0;

    uint256 public startAtBlock;

    constructor (uint _startAtBlock, uint _numberBlockPerDay, address _sendTo) public {
        startAtBlock = _startAtBlock;
        NUMBER_BLOCKS_PER_DAY = _numberBlockPerDay > 0 ? _numberBlockPerDay : 6000;
        _mint(_sendTo, 1e18);
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);

        if (from == address(0)) {
            require(totalSupply().add(amount) <= cap, "BDPToken: cap exceeded");
        }
    }

    function setPendingMaster(address _BDPMaster) public onlyOwner {
        BDPMasterPending = _BDPMaster;
        setBDPMasterPendingAtBlock = block.number;
    }

    function confirmMaster() public onlyOwner {
        require(block.number - setBDPMasterPendingAtBlock > 2 * NUMBER_BLOCKS_PER_DAY, "BDPToken: cannot confirm at this time");
        BDPMaster = BDPMasterPending;
    }

    function setMaster(address _BDPMaster) public onlyOwner {
        require(BDPMaster == address(0x0), "BDPToken: Cannot set master");
        BDPMaster = _BDPMaster;
    }

    function mint(address _to, uint256 _amount) public {
        require(msg.sender == BDPMaster, "BDPToken: only master farmer can mint");
        require(seedPoolAmount > 0, "BDPToken: cannot mint for pool");
        require(seedPoolAmount >= _amount, "BDPToken: amount greater than limitation");
        seedPoolAmount = seedPoolAmount.sub(_amount);
        _mint(_to, _amount);
    }

    function mintForPartnership(address _to) public onlyOwner {
        uint amount;

        require(block.number >= startAtBlock + 7 * NUMBER_BLOCKS_PER_DAY, "BDPToken: Cannot mint at this time");
        require(partnershipAmount > 0, "BDPToken: Cannot mint more token for partnership");

        // This first minting
        if (partnershipMintedAtBlock == 0) {
            amount = PARTNERSHIP_FIRST_MINT;
            partnershipMintedAtBlock = startAtBlock + 7 * NUMBER_BLOCKS_PER_DAY;
        }
        else {
            amount = PARTNERSHIP_TOTAL_AMOUNT
                .sub(PARTNERSHIP_FIRST_MINT)
                .mul(block.number - partnershipMintedAtBlock)
                .div(270 * NUMBER_BLOCKS_PER_DAY);
            partnershipMintedAtBlock = block.number;
        }

        amount = amount < partnershipAmount ? amount : partnershipAmount;

        partnershipAmount = partnershipAmount.sub(amount);
        _mint(_to, amount);
    }

    function mintForTeam(address _to) public onlyOwner {
        uint amount;

        require(block.number >= startAtBlock + 7 * NUMBER_BLOCKS_PER_DAY, "BDPToken: Cannot mint at this time");
        require(teamAmount > 0, "BDPToken: Cannot mint more token for team");
        // This first minting
        if (teamMintedAtBlock == 0) {
            teamMintedAtBlock = startAtBlock + 7 * NUMBER_BLOCKS_PER_DAY;
        }
        amount = TEAM_TOTAL_AMOUNT
            .mul(block.number - teamMintedAtBlock)
            .div(270 * NUMBER_BLOCKS_PER_DAY);
        teamMintedAtBlock = block.number;

        amount = amount < teamAmount ? amount : teamAmount;

        teamAmount = teamAmount.sub(amount);
        _mint(_to, amount);
    }

    function mintForFutureFarming(address _to) public onlyOwner {
        require(block.number >= startAtBlock + 56 * NUMBER_BLOCKS_PER_DAY, "BDPToken: Cannot mint at this time");
        require(futureAmount > 0, "BDPToken: Cannot mint more token for future farming");


        if (block.number >= startAtBlock + 56 * NUMBER_BLOCKS_PER_DAY 
            && futureAmount >= FUTURE_TOTAL_AMOUNT) {
            _mint(_to, FUTURE_EACH_MINT);
            futureAmount = futureAmount.sub(FUTURE_EACH_MINT);
        }

        if (block.number >= startAtBlock + 86 * NUMBER_BLOCKS_PER_DAY 
            && futureAmount >= FUTURE_TOTAL_AMOUNT.sub(FUTURE_EACH_MINT)) {
            _mint(_to, FUTURE_EACH_MINT);
            futureAmount = futureAmount.sub(FUTURE_EACH_MINT);
        }

        if (block.number >= startAtBlock + 116 * NUMBER_BLOCKS_PER_DAY
            && futureAmount > 0) {
            _mint(_to, futureAmount);
            futureAmount = 0;
        }
    }
}