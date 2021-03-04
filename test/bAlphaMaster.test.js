
const { expectRevert, time, BN } = require('@openzeppelin/test-helpers')
const bAlphaToken = artifacts.require('bAlphaToken')
const bAlphaMaster = artifacts.require('bAlphaMaster')
const MockERC20 = artifacts.require('MockERC20')

contract('bAlphaMaster', ([alice, bob, carol, dev, minter, receiveInit]) => {
    beforeEach(async () => {
        this.bAlpha = await bAlphaToken.new(receiveInit,  { from: alice })
    })

    it('should set correct state variables', async () => {
        this.master = await bAlphaMaster.new(this.bAlpha.address, 211713, 100, 100, { from: alice })
        await this.bAlpha.setMaster(this.master.address, { from: alice })
        
        const bAlpha = await this.master.bAlpha()
        assert.equal(bAlpha.valueOf(), this.bAlpha.address)

        assert.equal((await this.master.REWARD_PER_BLOCK()).valueOf(), 211713)
        assert.equal((await this.master.START_BLOCK()).valueOf(), 100)
        assert.equal((await this.master.REWARD_MULTIPLIER(0)).valueOf(), 688)
        assert.equal((await this.master.REWARD_MULTIPLIER(1)).valueOf(), 413)
        assert.equal((await this.master.REWARD_MULTIPLIER(2)).valueOf(), 310)
        assert.equal((await this.master.REWARD_MULTIPLIER(3)).valueOf(), 232)
        assert.equal((await this.master.REWARD_MULTIPLIER(4)).valueOf(), 209)
        assert.equal((await this.master.REWARD_MULTIPLIER(5)).valueOf(), 188)
        assert.equal((await this.master.REWARD_MULTIPLIER(6)).valueOf(), 169)
        assert.equal((await this.master.REWARD_MULTIPLIER(7)).valueOf(), 152)
        assert.equal((await this.master.REWARD_MULTIPLIER(8)).valueOf(), 137)
        assert.equal((await this.master.REWARD_MULTIPLIER(9)).valueOf(), 123)
        assert.equal((await this.master.REWARD_MULTIPLIER(10)).valueOf(), 111)
        assert.equal((await this.master.REWARD_MULTIPLIER(11)).valueOf(), 100)

        assert.equal((await this.master.HALVING_AT_BLOCK(0)).valueOf(), 200)
        assert.equal((await this.master.HALVING_AT_BLOCK(4)).valueOf(), 600)

        assert.equal((await this.master.FINISH_BONUS_AT_BLOCK()).valueOf(), 1200)
    })

    it ('should correct multiplier', async () => {
        // start at block 10 and halving after 10 blocks
        this.master = await bAlphaMaster.new(this.bAlpha.address, 211713, 10, 10, { from: alice })
        await this.bAlpha.setMaster(minter, { from: alice })
        assert.equal((await this.master.getMultiplier(0, 1)).valueOf(), "0")
        assert.equal((await this.master.getMultiplier(0, 9)).valueOf(), "0")
        assert.equal((await this.master.getMultiplier(0, 10)).valueOf(), "0")
        assert.equal((await this.master.getMultiplier(10, 11)).valueOf(), "688")
        assert.equal((await this.master.getMultiplier(10, 15)).valueOf(), 688 * 5)
        assert.equal((await this.master.getMultiplier(10, 29)).valueOf(), 688 * 10 + 413 * 9)
        assert.equal((await this.master.getMultiplier(10, 30)).valueOf(), 688 * 10 + 413 * 10)
        assert.equal((await this.master.getMultiplier(25, 39)).valueOf(), 413 * 5 + 310 * 9)
        assert.equal((await this.master.getMultiplier(50, 51)).valueOf(), "209")
        assert.equal((await this.master.getMultiplier(10, 51)).valueOf(), 688 * 10 + 413 * 10 + 310 * 10 + 232 * 10 + 209)
        assert.equal((await this.master.getMultiplier(10, 90)).valueOf(), 688 * 10 + 413 * 10 + 310 * 10 + 232 * 10 + 209 * 10 + 188 * 10 + 169 * 10 + 152 * 10)
        assert.equal((await this.master.getMultiplier(85, 90)).valueOf(), 152 * 5)
        assert.equal((await this.master.getMultiplier(85, 91)).valueOf(), 152 * 5 + 137)
        assert.equal((await this.master.getMultiplier(10, 91)).valueOf(), 688 * 10 + 413 * 10 + 310 * 10 + 232 * 10 + 209 * 10 + 188 * 10 + 169 * 10 + 152 * 10 + 137)
    })

    context('With LP token added to the field', () => {
        beforeEach(async () => {
            this.lp = await MockERC20.new('BDP/ETH', 'BDP/ETH', '10000000000', { from: minter })
            await this.lp.transfer(alice, '1000', { from: minter })
            await this.lp.transfer(bob, '1000', { from: minter })
            await this.lp.transfer(carol, '1000', { from: minter })

            this.lp2 = await MockERC20.new('bAlpha/ETH', 'bAlpha/ETH', '10000000000', { from: minter })
            await this.lp2.transfer(alice, '1000', { from: minter })
            await this.lp2.transfer(bob, '1000', { from: minter })
            await this.lp2.transfer(carol, '1000', { from: minter })
        })

        it('should correct add new pool and set pool', async () => {
            // 211713 per block, start at block 100 and halving after 10 block
            this.master = await bAlphaMaster.new(this.bAlpha.address, 211713, 100, 10, { from: alice })
            await this.bAlpha.setMaster(this.master.address, { from: alice })

            await this.master.add('100', this.lp.address, true, { from: alice})
            assert.equal((await this.master.poolInfo(0)).lpToken.valueOf(), this.lp.address)
            assert.equal((await this.master.poolInfo(0)).allocPoint.valueOf(), '100')
            assert.equal((await this.master.poolInfo(0)).lastRewardBlock.valueOf(), '100')
            assert.equal((await this.master.poolInfo(0)).rewardPerShare.valueOf(), '0')
            assert.equal((await this.master.poolId1(this.lp.address)).valueOf(), '1')

            await expectRevert(
                this.master.add('100', this.lp.address, true, { from: alice}),
                "bAlphaMaster::add: lp is already in pool"
            )
            await expectRevert(
                this.master.add('100', this.lp2.address, true, { from: bob}),
                "Ownable: caller is not the owner"
            )

            await this.master.add('300', this.lp2.address, true, { from: alice})
            assert.equal((await this.master.poolInfo(1)).lpToken.valueOf(), this.lp2.address)
            assert.equal((await this.master.poolInfo(1)).allocPoint.valueOf(), '300')
            assert.equal((await this.master.poolInfo(1)).lastRewardBlock.valueOf().toString(), '100')
            assert.equal((await this.master.poolInfo(1)).rewardPerShare.valueOf(), '0')
            assert.equal((await this.master.poolId1(this.lp2.address)).valueOf(), '2')

            assert.equal((await this.master.totalAllocPoint()).valueOf(), '400')

            await this.master.set(1, 400, true, { from: alice})
            assert.equal((await this.master.poolInfo(1)).allocPoint.valueOf(), '400')
            assert.equal((await this.master.totalAllocPoint()).valueOf(), '500')

            assert.equal((await this.master.getRewardPerBlock(0)).valueOf(), "0")
            assert.equal((await this.master.getRewardPerBlock(1)).valueOf(), "0")
            assert.equal((await this.master.getRewardPerBlock(1)).valueOf(), "0")

            await time.advanceBlockTo(101);
            assert.equal((await this.master.getRewardPerBlock(0)).valueOf(), "1456585")
            assert.equal((await this.master.getRewardPerBlock(1)).valueOf(), "291317")
            assert.equal((await this.master.getRewardPerBlock(2)).valueOf(), "1165268")
        })

        it('should allow emergency withdraw', async () => {
            // 211713 per block farming rate starting at block 100 and halving after each 900 blocks
            this.master = await bAlphaMaster.new(this.bAlpha.address, 211713, 100, 900, { from: alice })
            await this.bAlpha.setMaster(this.master.address, { from: alice })

            await this.master.add('100', this.lp.address, true)
            await this.lp.approve(this.master.address, '1000', { from: bob })
            await this.master.deposit(0, '100', { from: bob })
            assert.equal((await this.lp.balanceOf(bob)).valueOf(), '900')
            await this.master.emergencyWithdraw(0, { from: bob })
            assert.equal((await this.lp.balanceOf(bob)).valueOf(), '1000')
        })

        it('should correct deposit', async () => {
           this.master = await bAlphaMaster.new(this.bAlpha.address, 100, 500, 900, { from: alice })
           await this.bAlpha.setMaster(this.master.address, { from: alice })

            await this.master.add('100', this.lp.address, true)
            await this.lp.approve(this.master.address, '1000', { from: bob })

            await this.master.deposit(0, 100, { from: bob })
            assert.equal((await this.lp.balanceOf(bob)).valueOf(), '900')
            assert.equal((await this.lp.balanceOf(this.master.address)).valueOf(), '100')

            assert.equal((await this.master.pendingReward(0, bob)).valueOf(), "0")
            assert.equal((await this.master.userInfo(0, bob)).rewardDebt.valueOf(), "0")
            assert.equal((await this.master.poolInfo(0)).rewardPerShare.valueOf(), "0")

            await this.lp.approve(this.master.address, '1000', { from: carol })
            await this.master.deposit(0, 50, { from: carol })
            assert.equal((await this.lp.balanceOf(carol)).valueOf(), '950')
            assert.equal((await this.lp.balanceOf(this.master.address)).valueOf(), '150')
            
            assert.equal((await this.master.poolInfo(0)).rewardPerShare.valueOf(), "0")

            assert.equal((await this.master.pendingReward(0, bob)).valueOf(), '0')
            assert.equal((await this.master.pendingReward(0, carol)).valueOf(), '0')
        })

        it('should correct pending BAlpha & balance', async () => {
            // 211713 per block farming rate starting at block 200
            this.master = await bAlphaMaster.new(this.bAlpha.address, 211713, 200, 10, { from: alice })
            await this.bAlpha.setMaster(this.master.address, { from: alice })

            await this.master.add('10', this.lp.address, true) // 73

            await this.lp.approve(this.master.address, '1000', { from: alice }) // 74
            await this.lp.approve(this.master.address, '1000', { from: bob }) // 75

            await this.master.deposit(0, '10', { from: alice }) // 76
            assert.equal((await this.master.pendingReward(0, alice)).valueOf(), '0')
            assert.equal((await this.bAlpha.totalSupply()).valueOf(), 1e17)

            await time.advanceBlockTo('200')
            assert.equal((await this.master.pendingReward(0, alice)).valueOf(), '0')

            await this.master.updatePool(0) // block 201
            assert.equal((await this.bAlpha.totalSupply()).valueOf(), 1456585 + 1e17)
            assert.equal((await this.master.pendingReward(0, alice)).valueOf(), 1456585)

            await time.advanceBlockTo('210')
            assert.equal((await this.master.pendingReward(0, alice)).valueOf(), 14565853)

            await this.master.deposit(0, '10', { from: alice }) // block 211

            assert.equal((await this.bAlpha.totalSupply()).valueOf(), 15440228 + 1e17)


            assert.equal((await this.master.pendingReward(0, alice)).valueOf(), "0") // when deposit, it will automatic harvest
            assert.equal((await this.bAlpha.balanceOf(alice)).valueOf(),15440228)

            assert.equal((await this.bAlpha.balanceOf(this.master.address)).valueOf(), "0")

            await time.advanceBlockTo('212')
            assert.equal((await this.master.pendingReward(0, alice)).valueOf(), 874374)

            await time.advanceBlockTo('259')
            assert.equal((await this.master.pendingReward(0, alice)).valueOf(), 27351202)

            await this.master.deposit(0, '10', { from: bob }) // 160
            assert.equal((await this.master.pendingReward(0, alice)).valueOf(), "27749222")
            assert.equal((await this.master.pendingReward(0, bob)).valueOf(), "0")
            
            await time.advanceBlockTo('264')
            assert.equal((await this.master.pendingReward(0, alice)).valueOf(), 28703341)
            assert.equal((await this.master.pendingReward(0, bob)).valueOf(), 477059)

            await time.advanceBlockTo('350')
            assert.equal((await this.master.pendingReward(0, alice)).valueOf(), 43161928)
            assert.equal((await this.master.pendingReward(0, bob)).valueOf(), 7706353) 

            await this.master.deposit(0, '40', { from: bob }) // 351

            assert.equal((await this.master.pendingReward(0, bob)).valueOf(), "0")
            assert.equal((await this.bAlpha.balanceOf(bob)).valueOf(), 7776924)
        })
        

        it('should give out BAlpha only after farming time', async () => {
            // 211713 per block farming rate starting at block 400
            this.master = await bAlphaMaster.new(this.bAlpha.address, 211713, 400, 10, { from: alice })
            await this.bAlpha.setMaster(this.master.address, { from: alice })

            await time.advanceBlockTo('391')

            await this.master.add('100', this.lp.address, true) // 392

            await this.lp.approve(this.master.address, '1000', { from: bob }) // 393
            await this.master.deposit(0, '100', { from: bob }) // 394

            await time.advanceBlockTo('395')
            await this.master.claimReward(0, { from: bob }) // block 396
            assert.equal((await this.bAlpha.balanceOf(bob)).valueOf(), '0')

            await time.advanceBlockTo('399')
            await this.master.claimReward(0, { from: bob }) // block 400
            assert.equal((await this.bAlpha.balanceOf(bob)).valueOf(), '0')

            await this.master.claimReward(0, { from: bob }) // block 401
            assert.equal((await this.bAlpha.balanceOf(bob)).valueOf(), 1456585)

            await time.advanceBlockTo('408')
            assert.equal((await this.master.pendingReward(0, bob)).valueOf(), 10196098)
            await this.master.claimReward(0, { from: bob }) // block 409
            assert.equal((await this.bAlpha.balanceOf(bob)).valueOf(), 13109268)
            assert.equal((await this.master.pendingReward(0, bob)).valueOf(), "0")
            assert.equal((await this.bAlpha.totalSupply()).valueOf(), 13109268 + 1e17)
            
            await time.advanceBlockTo('471')
            assert.equal((await this.master.pendingReward(0, bob)).valueOf(), 33979936)
            assert.equal((await this.bAlpha.balanceOf(bob)).valueOf(), 13109268)

            await this.lp.approve(this.master.address, '1000', { from: carol }) // 472
            await time.advanceBlockTo('475')
            await this.master.deposit(0, '100', { from: carol }) // 476

            await time.advanceBlockTo('487')
            assert.equal((await this.master.pendingReward(0, carol)).valueOf(), 1658771)
            await this.master.claimReward(0, { from: carol }) // 488
            assert.equal((await this.bAlpha.balanceOf(carol)).valueOf(), 1803794)
        })

        it('should not distribute BAlpha if no one deposit', async () => {
            // 211713 per block farming rate starting at block 500
            this.master = await bAlphaMaster.new(this.bAlpha.address, 211713, 500, 10, { from: alice })
            await this.bAlpha.setMaster(this.master.address, { from: alice })

            await this.master.add('100', this.lp.address, true)
            await this.lp.approve(this.master.address, '1000', { from: bob })
            await time.advanceBlockTo('510')
            assert.equal((await this.bAlpha.totalSupply()).valueOf(), 1e17)
            await time.advanceBlockTo('520')
            assert.equal((await this.bAlpha.totalSupply()).valueOf(), 1e17)
            await time.advanceBlockTo('530')
            await this.master.updatePool(0) // block 531
            assert.equal((await this.bAlpha.totalSupply()).valueOf(), 1e17)
            assert.equal((await this.bAlpha.balanceOf(bob)).valueOf(), '0')
            assert.equal((await this.bAlpha.balanceOf(dev)).valueOf(), '0')
            await this.master.deposit(0, '10', { from: bob }) // block 532
            assert.equal((await this.lp.balanceOf(this.master.address)).valueOf(), '10')
            assert.equal((await this.bAlpha.totalSupply()).valueOf(), 1e17)
            assert.equal((await this.bAlpha.balanceOf(bob)).valueOf(), '0')
            assert.equal((await this.bAlpha.balanceOf(dev)).valueOf(), '0')
            assert.equal((await this.lp.balanceOf(bob)).valueOf(), '990')

            await this.master.claimReward(0, { from: bob })
            assert.equal((await this.bAlpha.balanceOf(bob)).valueOf(), '491174')
        })

        it('must be mint 6000bAlpha', async () => {
            this.master = await bAlphaMaster.new(this.bAlpha.address, '100000000000000000000', 600, 10, { from: alice })
            await this.bAlpha.setMaster(this.master.address, { from: alice })
            await this.master.add('100', this.lp.address, true)
            await this.lp.approve(this.master.address, '1000', { from: bob })
            await this.master.deposit(0, '10', { from: bob })

            await time.advanceBlockTo(1000)

            await this.master.claimReward(0, { from: bob })
            assert.equal((await this.bAlpha.balanceOf(bob)).valueOf(), '18000000000000000000000')
        })

    })
})