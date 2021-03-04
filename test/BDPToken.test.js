const { expectRevert, time } = require('@openzeppelin/test-helpers')
const BN = require('bn.js')
const BDPToken = artifacts.require('BDPToken')
const NUMBER_BLOCK_PER_DAY = 10
const START_AT_BLOCK = 20
contract('BDPToken', ([alice, bob, carol, tom, receiveInit]) => {
    beforeEach(async () => {
        this.BdpToken = await BDPToken.new(START_AT_BLOCK, NUMBER_BLOCK_PER_DAY, receiveInit, { from: alice })
        await this.BdpToken.setMaster(alice, { from: alice })
    })

    it('should have correct setting', async () => {
        const name = await this.BdpToken.name()
        const symbol = await this.BdpToken.symbol()
        const decimals = await this.BdpToken.decimals()
        const cap = await this.BdpToken.cap()
        assert.equal(name.valueOf(), 'BDPToken')
        assert.equal(symbol.valueOf(), 'BDP')
        assert.equal(decimals.valueOf(), '18')
        assert.equal(cap.valueOf(), 80000001e18)
        assert.equal((await this.BdpToken.startAtBlock()).valueOf(), "20")
        assert.equal((await this.BdpToken.seedPoolAmount()).valueOf(), "24000000000000000000000000")
        assert.equal((await this.BdpToken.TEAM_TOTAL_AMOUNT()).valueOf(), "8000000000000000000000000")
        assert.equal((await this.BdpToken.PARTNERSHIP_TOTAL_AMOUNT()).valueOf(), '20000000000000000000000000')
        assert.equal((await this.BdpToken.FUTURE_TOTAL_AMOUNT()).valueOf(), "28000000000000000000000000")
        assert.equal((await this.BdpToken.balanceOf(receiveInit)).valueOf(), 1e18)
    })

    it('set master', async () => {
        await expectRevert(
            this.BdpToken.setMaster(bob, { from: alice }),
            'BDPToken: Cannot set master',
        )

        await this.BdpToken.setPendingMaster(tom, { from: alice })

        assert.equal((await this.BdpToken.BDPMasterPending()).valueOf(), tom)

        await expectRevert(
            this.BdpToken.confirmMaster({ from: alice }),
            "BDPToken: cannot confirm at this time"
        )

        await time.advanceBlockTo(NUMBER_BLOCK_PER_DAY * 2 + (await time.latestBlock()).toNumber()) 
        this.BdpToken.confirmMaster({ from: alice })

        assert.equal((await this.BdpToken.BDPMaster()).valueOf(), tom)
    })

    it('should fail, mint over token', async () => {
        await expectRevert(
            this.BdpToken.mint(alice, '24000000000000000000000001', { from: alice }),
            'BDPToken: amount greater than limitation',
        )
    })

    it('should only allow master to mint token', async () => {
        await this.BdpToken.mint(alice, '100', { from: alice })
        await this.BdpToken.mint(bob, '1000', { from: alice })
        await expectRevert(
            this.BdpToken.mint(carol, '1000', { from: bob }),
            'BDPToken: only master farmer can mint',
        )
        const totalSupply = await this.BdpToken.totalSupply()
        const aliceBal = await this.BdpToken.balanceOf(alice)
        const bobBal = await this.BdpToken.balanceOf(bob)
        const carolBal = await this.BdpToken.balanceOf(carol)
        assert.equal(totalSupply.valueOf(), 1100 + 1e18)
        assert.equal(aliceBal.valueOf(), '100')
        assert.equal(bobBal.valueOf(), '1000')
        assert.equal(carolBal.valueOf(), '0')
    })

    it('should supply token transfers properly', async () => {
        await this.BdpToken.mint(alice, '500', { from: alice })
        await this.BdpToken.transfer(carol, '200', { from: alice })
        await this.BdpToken.transfer(bob, '100', { from: carol })
        const bobBal = await this.BdpToken.balanceOf(bob)
        const carolBal = await this.BdpToken.balanceOf(carol)
        assert.equal(bobBal.valueOf(), '100')
        assert.equal(carolBal.valueOf(), '100')
    })

    it('should fail if you try to do bad transfers', async () => {
        await this.BdpToken.mint(alice, '500', { from: alice })
        await this.BdpToken.transfer(carol, '10', { from: alice })
        await expectRevert(
            this.BdpToken.transfer(bob, '110', { from: carol }),
            'ERC20: transfer amount exceeds balance',
        )
        await expectRevert(
            this.BdpToken.transfer(carol, '1', { from: bob }),
            'ERC20: transfer amount exceeds balance',
        )
    })

    it('should correct mint for partnership, team and future', async () => {
        await expectRevert(
            this.BdpToken.mintForPartnership(alice, { from: alice }),
            'BDPToken: Cannot mint at this time',
        )

        await expectRevert(
            this.BdpToken.mintForTeam(alice, { from: alice }),
            'BDPToken: Cannot mint at this time',
        )

        await expectRevert(
            this.BdpToken.mintForFutureFarming(alice, { from: alice }),
            'BDPToken: Cannot mint at this time',
        )

        await time.advanceBlockTo(NUMBER_BLOCK_PER_DAY * 8 + START_AT_BLOCK + 10)  // 110

        await this.BdpToken.mintForPartnership(alice, { from: alice }) //Block 111
        assert.equal(await this.BdpToken.balanceOf(alice).valueOf(), '8000000000000000000000000')
        assert.equal( await this.BdpToken.partnershipAmount().valueOf(), '12000000000000000000000000')
        assert.equal( await this.BdpToken.partnershipMintedAtBlock().valueOf(), NUMBER_BLOCK_PER_DAY * 7 + START_AT_BLOCK)

        await this.BdpToken.mintForTeam(bob, { from: alice }) //Block 112
        assert.equal(await this.BdpToken.balanceOf(bob).valueOf(), '65185185185185185185185')
        assert.equal( await this.BdpToken.teamAmount().valueOf(), '7934814814814814814814815')
        assert.equal( await this.BdpToken.teamMintedAtBlock().valueOf(), 112)

        // await time.advanceBlockTo(NUMBER_BLOCK_PER_DAY * 56 + START_AT_BLOCK - 1) 
        // await expectRevert(
        //     this.BdpToken.mintForFutureFarming(alice, { from: alice }),
        //     'BDPToken: Cannot mint at this time',
        // )

        await time.advanceBlockTo(NUMBER_BLOCK_PER_DAY * 56 + START_AT_BLOCK + 1) 
        await this.BdpToken.mintForFutureFarming(carol, { from: alice })

        assert.equal((await this.BdpToken.balanceOf(carol)).valueOf().toString(), '9333333000000000000000000')
        assert.equal(await this.BdpToken.futureAmount().valueOf(), '18666667000000000000000000')

        await this.BdpToken.mintForFutureFarming(carol, { from: alice })

        assert.equal((await this.BdpToken.balanceOf(carol)).valueOf().toString(), '9333333000000000000000000')
        assert.equal(await this.BdpToken.futureAmount().valueOf(), '18666667000000000000000000')

        await time.advanceBlockTo(NUMBER_BLOCK_PER_DAY * 86 + START_AT_BLOCK + 1) 

        await this.BdpToken.mintForFutureFarming(carol, { from: alice })

        assert.equal((await this.BdpToken.balanceOf(carol)).valueOf().toString(), '18666666000000000000000000')
        assert.equal(await this.BdpToken.futureAmount().valueOf(), '9333334000000000000000000')

        await time.advanceBlockTo(NUMBER_BLOCK_PER_DAY * 400) 
        await this.BdpToken.mintForPartnership(alice, {from: alice})
        await this.BdpToken.mintForTeam(bob, {from: alice})

        assert.equal((await this.BdpToken.balanceOf(alice)).valueOf().toString(), (await this.BdpToken.PARTNERSHIP_TOTAL_AMOUNT()).valueOf().toString())
        assert.equal(await this.BdpToken.partnershipAmount().valueOf(), '0')

        assert.equal((await this.BdpToken.balanceOf(bob)).valueOf().toString(), (await this.BdpToken.TEAM_TOTAL_AMOUNT()).valueOf().toString())
        assert.equal(await this.BdpToken.teamAmount().valueOf(), '0')

        await this.BdpToken.mintForFutureFarming(carol, { from: alice })
        assert.equal((await this.BdpToken.balanceOf(carol)).valueOf().toString(), (await this.BdpToken.FUTURE_TOTAL_AMOUNT()).valueOf().toString())
        assert.equal(await this.BdpToken.futureAmount().valueOf(), '0')
    })
})
