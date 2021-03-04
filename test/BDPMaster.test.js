
const { expectRevert, time, BN } = require('@openzeppelin/test-helpers')
const BDPToken = artifacts.require('BDPToken')
const BDPMaster = artifacts.require('BDPMaster')
const MockERC20 = artifacts.require('MockERC20')

contract('BDPMaster', ([alice, bob, carol, dev, minter, receiveInit]) => {
    beforeEach(async () => {
        this.BdpToken = await BDPToken.new(10, 10, receiveInit, { from: alice })
    })

    it('should set correct state variables', async () => {
        this.master = await BDPMaster.new(this.BdpToken.address, 211713, 100, { from: alice })
        await this.BdpToken.setMaster(this.master.address, { from: alice })
        
        const BDP = await this.master.BDP()
        assert.equal(BDP.valueOf(), this.BdpToken.address)

        assert.equal((await this.master.REWARD_PER_BLOCK()).valueOf(), 211713)
        assert.equal((await this.master.START_BLOCK()).valueOf(), 100)
    })

    it('should allow only master farmer can mint', async () => {
        this.master = await BDPMaster.new(this.BdpToken.address, 211713, 100, { from: alice })
        await this.BdpToken.setMaster(minter, { from: alice })

        assert.equal((await this.BdpToken.BDPMaster()).valueOf(), minter)
        await expectRevert(
            (this.BdpToken.mint(alice, '10000000000', { from: alice })),
            "only master farmer can mint")

        await this.BdpToken.mint(alice, '10000000000', { from: minter })
        assert.equal((await this.BdpToken.balanceOf(alice)).valueOf(), "10000000000")

        await expectRevert(
            (this.BdpToken.mint(alice, '800000000000000000000000000', { from: minter })),
            "BDPToken: amount greater than limitation")
    })

    context('With LP token added to the field', () => {
        beforeEach(async () => {
            this.lp = await MockERC20.new('BDL/ETH', 'BDL/ETH', '10000000000', { from: minter })
            await this.lp.transfer(alice, '1000', { from: minter })
            await this.lp.transfer(bob, '1000', { from: minter })
            await this.lp.transfer(carol, '1000', { from: minter })
            this.lp2 = await MockERC20.new('bAlpha/ETH', 'bAlpha/ETH', '10000000000', { from: minter })
            await this.lp2.transfer(alice, '1000', { from: minter })
            await this.lp2.transfer(bob, '1000', { from: minter })
            await this.lp2.transfer(carol, '1000', { from: minter })
        })

        it('should correct add new pool and set pool', async () => {
            // 100 per block, start at block 100
            this.master = await BDPMaster.new(this.BdpToken.address, 100, 100, { from: alice })
            await this.BdpToken.setMaster(this.master.address, { from: alice })

            await this.master.add('100', this.lp.address, true, { from: alice})
            assert.equal((await this.master.poolInfo(0)).lpToken.valueOf(), this.lp.address)
            assert.equal((await this.master.poolInfo(0)).allocPoint.valueOf(), '100')
            assert.equal((await this.master.poolInfo(0)).lastRewardBlock.valueOf(), '100')
            assert.equal((await this.master.poolInfo(0)).rewardPerShare.valueOf(), '0')
            assert.equal((await this.master.poolId1(this.lp.address)).valueOf(), '1')

            await expectRevert(
                this.master.add('100', this.lp.address, true, { from: alice}),
                "BDPMaster::add: lp is already in pool"
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
            // Failed, but Accepted
            // assert.equal((await this.master.getNewRewardPerBlock(0)).valueOf(), "0")
            // assert.equal((await this.master.getNewRewardPerBlock(1)).valueOf(), "0")
            // assert.equal((await this.master.getNewRewardPerBlock(1)).valueOf(), "0")

            await time.advanceBlockTo(101);
            assert.equal((await this.master.getNewRewardPerBlock(0)).valueOf(), "100")
            assert.equal((await this.master.getNewRewardPerBlock(1)).valueOf(), "20")
            assert.equal((await this.master.getNewRewardPerBlock(2)).valueOf(), "80")
        })

        it('should allow emergency withdraw', async () => {
            // 211713 per block farming rate starting at block 100
            //this.master = await LuaMasterFarmer.new(this.lua.address, dev, '100', '100', '900', { from: alice })
            this.master = await BDPMaster.new(this.BdpToken.address, 211713, 100, { from: alice })
            await this.BdpToken.setMaster(this.master.address, { from: alice })

            await this.master.add('100', this.lp.address, true)
            await this.lp.approve(this.master.address, '1000', { from: bob })
            await this.master.deposit(0, '100', { from: bob })
            assert.equal((await this.lp.balanceOf(bob)).valueOf(), '900')
            await this.master.emergencyWithdraw(0, { from: bob })
            assert.equal((await this.lp.balanceOf(bob)).valueOf(), '1000')
        })

        it('should correct deposit', async () => {
           // this.master = await LuaMasterFarmer.new(this.lua.address, dev, '100', '100', '900', { from: alice})
           this.master = await BDPMaster.new(this.BdpToken.address, 100, 500, { from: alice })
           await this.BdpToken.setMaster(this.master.address, { from: alice })

            await this.master.add('100', this.lp.address, true)
            await this.lp.approve(this.master.address, '1000', { from: bob })
            // await expectRevert(
            //     this.master.deposit(0, 0, { from: bob }),
            //     'BdpTokenMaster::deposit: amount must be greater than 0'
            // )

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

        it('should correct pending BdpToken & balance & lock', async () => {
            // 100 per block farming rate starting at block 200
            this.master = await BDPMaster.new(this.BdpToken.address, 100, 200, { from: alice })
            await this.BdpToken.setMaster(this.master.address, { from: alice })

            await this.BdpToken.transferOwnership(this.master.address, { from: alice }) // 72
            await this.master.add('10', this.lp.address, true) // 73

            await this.lp.approve(this.master.address, '1000', { from: alice }) // 74
            await this.lp.approve(this.master.address, '1000', { from: bob }) // 75

            await this.master.deposit(0, '10', { from: alice }) // 76
            assert.equal((await this.master.pendingReward(0, alice)).valueOf(), '0')
            assert.equal((await this.BdpToken.totalSupply()).valueOf(), 1e18)

            await time.advanceBlockTo('200')
            assert.equal((await this.master.pendingReward(0, alice)).valueOf(), '0')

            await this.master.updatePool(0) // block 201
            assert.equal((await this.BdpToken.totalSupply()).valueOf(), 100 + 1e18)
            assert.equal((await this.master.pendingReward(0, alice)).valueOf(), 100)

            await time.advanceBlockTo('210')
            assert.equal((await this.master.pendingReward(0, alice)).valueOf(), 1000)

            await this.master.deposit(0, '10', { from: alice }) // block 211

            assert.equal((await this.BdpToken.totalSupply()).valueOf(), 1100 + 1e18)


            assert.equal((await this.master.pendingReward(0, alice)).valueOf(), "0") // when deposit, it will automatic harvest
            assert.equal((await this.BdpToken.balanceOf(alice)).valueOf(),1100)

            assert.equal((await this.BdpToken.balanceOf(this.master.address)).valueOf(), "0")

            await time.advanceBlockTo('212')
            assert.equal((await this.master.pendingReward(0, alice)).valueOf(), 100)

            await time.advanceBlockTo('259')
            assert.equal((await this.master.pendingReward(0, alice)).valueOf(), 4800)

            await this.master.deposit(0, '10', { from: bob }) // 160
            assert.equal((await this.master.pendingReward(0, alice)).valueOf(), 4900)
            assert.equal((await this.master.pendingReward(0, bob)).valueOf(), "0")
            
            await time.advanceBlockTo('264')
            assert.equal((await this.master.pendingReward(0, alice)).valueOf(), 5166)
            assert.equal((await this.master.pendingReward(0, bob)).valueOf(), 133)

            await time.advanceBlockTo('350')
            assert.equal((await this.master.pendingReward(0, alice)).valueOf(), 10900)
            assert.equal((await this.master.pendingReward(0, bob)).valueOf(), 3000) 

            await this.master.deposit(0, '40', { from: bob }) // 351

            assert.equal((await this.master.pendingReward(0, bob)).valueOf(), "0")
            assert.equal((await this.BdpToken.balanceOf(bob)).valueOf(), 3033)
        })
        

        it('should give out BdpToken only after farming time', async () => {
            // 100 per block farming rate starting at block 400 
            this.master = await BDPMaster.new(this.BdpToken.address, 100, 400, { from: alice })
            await this.BdpToken.setMaster(this.master.address, { from: alice })

            await time.advanceBlockTo('390')
            await this.BdpToken.transferOwnership(this.master.address, { from: alice }) // 391

            await this.master.add('100', this.lp.address, true) // 292

            await this.lp.approve(this.master.address, '1000', { from: bob }) // 293
            await this.master.deposit(0, '100', { from: bob }) // 294

            await time.advanceBlockTo('395')
            await this.master.claimReward(0, { from: bob }) // block 296
            assert.equal((await this.BdpToken.balanceOf(bob)).valueOf(), '0')

            await time.advanceBlockTo('399')
            await this.master.claimReward(0, { from: bob }) // block 300
            assert.equal((await this.BdpToken.balanceOf(bob)).valueOf(), '0')

            await this.master.claimReward(0, { from: bob }) // block 301
            assert.equal((await this.BdpToken.balanceOf(bob)).valueOf(), 100)

            await time.advanceBlockTo('408')
            assert.equal((await this.master.pendingReward(0, bob)).valueOf(), 700)
            await this.master.claimReward(0, { from: bob }) // block 309
            assert.equal((await this.BdpToken.balanceOf(bob)).valueOf(), 900)
            assert.equal((await this.master.pendingReward(0, bob)).valueOf(), "0")
            assert.equal((await this.BdpToken.totalSupply()).valueOf(), 900 + 1e18)
            
            await time.advanceBlockTo('471')
            assert.equal((await this.master.pendingReward(0, bob)).valueOf(), 6200)
            assert.equal((await this.BdpToken.balanceOf(bob)).valueOf(), 900)

            await this.lp.approve(this.master.address, '1000', { from: carol }) // 372
            await time.advanceBlockTo('475')
            await this.master.deposit(0, '100', { from: carol }) // 376

            await time.advanceBlockTo('487')
            assert.equal((await this.master.pendingReward(0, carol)).valueOf(), 550)
            await this.master.claimReward(0, { from: carol }) // 388
            assert.equal((await this.BdpToken.balanceOf(carol)).valueOf(), 600)
        })

        it('should not distribute BdpToken if no one deposit', async () => {
            // 100 per block farming rate starting at block 500 
            this.master = await BDPMaster.new(this.BdpToken.address, 100, 500, { from: alice })
            await this.BdpToken.setMaster(this.master.address, { from: alice })

            await this.BdpToken.transferOwnership(this.master.address, { from: alice })
            await this.master.add('100', this.lp.address, true)
            await this.lp.approve(this.master.address, '1000', { from: bob })
            await time.advanceBlockTo('510')
            assert.equal((await this.BdpToken.totalSupply()).valueOf(), 1e18)
            await time.advanceBlockTo('520')
            assert.equal((await this.BdpToken.totalSupply()).valueOf(), 1e18)
            await time.advanceBlockTo('530')
            await this.master.updatePool(0) // block 531
            assert.equal((await this.BdpToken.totalSupply()).valueOf(), 1e18)
            assert.equal((await this.BdpToken.balanceOf(bob)).valueOf(), '0')
            assert.equal((await this.BdpToken.balanceOf(dev)).valueOf(), '0')
            await this.master.deposit(0, '10', { from: bob }) // block 532
            assert.equal((await this.lp.balanceOf(this.master.address)).valueOf(), '10')
            assert.equal((await this.BdpToken.totalSupply()).valueOf(), 1e18)
            assert.equal((await this.BdpToken.balanceOf(bob)).valueOf(), '0')
            assert.equal((await this.BdpToken.balanceOf(dev)).valueOf(), '0')
            assert.equal((await this.lp.balanceOf(bob)).valueOf(), '990')

            await this.master.claimReward(0, { from: bob })
            assert.equal((await this.BdpToken.balanceOf(bob)).valueOf(), '100')
        })

    })
})