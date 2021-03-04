const { expectRevert, time } = require('@openzeppelin/test-helpers')
const bAlphaToken = artifacts.require('bAlphaToken')

contract('bAlpha', ([alice, bob, carol, tom, receiveInit]) => {
    beforeEach(async () => {
        this.bAlpha = await bAlphaToken.new(receiveInit, { from: alice })
    })

    it('should have correct setting', async () => {
        const name = await this.bAlpha.name()
        const symbol = await this.bAlpha.symbol()
        const decimals = await this.bAlpha.decimals()
        const cap = await this.bAlpha.cap()
        assert.equal(name.valueOf(), 'bAlpha')
        assert.equal(symbol.valueOf(), 'bAlpha')
        assert.equal(decimals.valueOf(), '18')
        assert.equal(cap.valueOf(), 18000e18 + 1e17)
        assert.equal((await this.bAlpha.balanceOf(receiveInit)).valueOf(), 1e17)
    })

    it('should fail when assign to bAlphaMaster not from owner', async () => {
        await expectRevert(
            this.bAlpha.setMaster(bob, { from: carol }),
            "Ownable: caller is not the owner"
        )
        await this.bAlpha.setMaster(bob, { from: alice })
        assert.equal(await this.bAlpha.bAlphaMaster(), bob);
    })

    it('should fail, mint over token', async () => {

        await this.bAlpha.setMaster(bob, { from: alice })

        await expectRevert(
            this.bAlpha.mint(alice, '18000000000000000000001', { from: bob }),
            'ERC20Capped: cap exceeded',
        )
    })

    it('should only allow owner to mint token', async () => {

        await expectRevert(
            this.bAlpha.mint(alice, '100000', { from: alice }),
            'bAlphaToken: only master farmer can mint',
        )

        await this.bAlpha.setMaster(bob, { from: alice })
        
        await this.bAlpha.mint(alice, '100', { from: bob })
        await this.bAlpha.mint(bob, '1000', { from: bob })
        
        const totalSupply = await this.bAlpha.totalSupply()
        const aliceBal = await this.bAlpha.balanceOf(alice)
        const bobBal = await this.bAlpha.balanceOf(bob)
        const carolBal = await this.bAlpha.balanceOf(carol)
        assert.equal(totalSupply.valueOf(), 1100 + 1e17)
        assert.equal(aliceBal.valueOf(), '100')
        assert.equal(bobBal.valueOf(), '1000')
        assert.equal(carolBal.valueOf(), '0')
    })

    it('should supply token transfers properly', async () => {
        await this.bAlpha.setMaster(bob, { from: alice })
        await this.bAlpha.mint(alice, '500', { from: bob })
        await this.bAlpha.transfer(carol, '200', { from: alice })
        await this.bAlpha.transfer(bob, '100', { from: carol })
        const bobBal = await this.bAlpha.balanceOf(bob)
        const carolBal = await this.bAlpha.balanceOf(carol)
        assert.equal(bobBal.valueOf(), '100')
        assert.equal(carolBal.valueOf(), '100')
    })

    it('should fail if you try to do bad transfers', async () => {
        await this.bAlpha.setMaster(bob, { from: alice })
        await this.bAlpha.mint(alice, '500', { from: bob })
        await this.bAlpha.transfer(carol, '10', { from: alice })
        await expectRevert(
            this.bAlpha.transfer(alice, '110', { from: carol }),
            'ERC20: transfer amount exceeds balance',
        )
        await expectRevert(
            this.bAlpha.transfer(carol, '1', { from: tom }),
            'ERC20: transfer amount exceeds balance',
        )
    })

    it("should burn", async () => {
        await this.bAlpha.setMaster(bob, { from: alice })
        await this.bAlpha.mint(tom, '500', { from: bob })

        await expectRevert(
            this.bAlpha.burn(600, { from: tom }),
            "ERC20: burn amount exceeds balance"
        )

        await this.bAlpha.mint(tom, '10000000000000000000', { from: bob })
        
        await expectRevert(
            this.bAlpha.burn('2000000000000000000', { from: tom }),
            "bAlpphaToken: cannot burn more than 1 bAlpha"
        )

        assert.equal((await this.bAlpha.canBurnAmount(tom)).valueOf(), '1000000000000000000')
        this.bAlpha.burn('500000000000000000', { from: tom })

        assert.equal((await this.bAlpha.canBurnAmount(tom)).valueOf(), '500000000000000000')
        assert.equal((await this.bAlpha.redeemed(tom)).valueOf(), '500000000000000000')
        assert.equal((await this.bAlpha.balanceOf(tom)).valueOf(), '9500000000000000500')

        await this.bAlpha.safeBurn('10000000000000000000', { from: tom })


        assert.equal((await this.bAlpha.canBurnAmount(tom)).valueOf(), '0')
        assert.equal((await this.bAlpha.redeemed(tom)).valueOf(), '1000000000000000000')
        assert.equal((await this.bAlpha.balanceOf(tom)).valueOf(), '9000000000000000500')
    })
})
