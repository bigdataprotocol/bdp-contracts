const methods = require('./methods')
const getPrice = require('./getPrice')
const BigNumber = require('bignumber.js')
const supportedPools = [
  {
    pid: 3,
    lpAddresses: {
      1: '0x96258bb42779bf300cf69c9b5bd2ba5245cb4bc4',
    },
    tokenAddresses: {
      1: '0xb1f66997a5760428d3a87d68b90bfe0ae64121cc',
    },
    token2Addresses: {
      1: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    },
    name: 'LUA - USDC',
    symbol: 'LUA-USDC LUA-V1 LP',
    symbolShort: 'LUA-USDC',
    description: `Deposit LUA-USDC LUA-V1 LP Earn 3xLUA`,
    tokenSymbol: 'LUA',
    token2Symbol: 'USDC',
    icon: 'https://luaswap.org/favicon.png',
    icon2: 'https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png',
    isHot: false,
    isNew: true,
    protocal: 'LuaSwap',
    iconProtocal: 'https://luaswap.org/favicon.png',
    pairLink:
      'https://info.luaswap.org/pair/0x96258BB42779Bf300cf69c9B5bD2Ba5245CB4bc4',
    addLiquidityLink:
      'https://app.luaswap.org/#/add/0xB1f66997A5760428D3a87D68b90BfE0aE64121cC/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    removeLiquidityLink:
      'https://app.luaswap.org/#/remove/0xB1f66997A5760428D3a87D68b90BfE0aE64121cC/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  }
]

var CACHE = {}

var sleep = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms)
})

const getLPValue = async (
  lpContract,
  tokenContract,
  token2Contract,
  pid,
) => {
  var masterChefContract = process.env.MASTER_CONTRACT

  CACHE[pid] = CACHE[pid] || {
    time: 0,
    old: 30 * 1000,
    value: null,
    isLoading: false
  }

  if (CACHE[pid].isLoading) {
    // console.log('> Wait get pool value', pid)
    await sleep(10000)
  }

  if (CACHE[pid].time + CACHE[pid].old <= new Date().getTime() || !CACHE[pid]) {
    console.log('Get pool value', pid)
    CACHE[pid].isLoading = true
    const [
      tokenAmountWholeLP, 
      tokenDecimals, 
      lpBalance, 
      totalSupply, 
      token2AmountWholeLP, 
      token2Decimals,
      newRewardPerBlock
    ] = await Promise.all([
      methods.balance(lpContract, tokenContract),
      methods.contract(tokenContract).methods('decimals():(uint256)').params().call(),
      methods.balance(masterChefContract, lpContract),
      methods.contract(lpContract).methods('totalSupply():(uint256)').params().call(),
      methods.balance(lpContract, token2Contract),
      methods.contract(token2Contract).methods('decimals():(uint256)').params().call(),
      methods.contract(masterChefContract).methods('getNewRewardPerBlock(uint256):(uint256)').params(pid + 1).call(),
    ])
    
    // Return p1 * w1 * 2
    const portionLp = new BigNumber(lpBalance).div(new BigNumber(totalSupply))
    const totalLpToken2Value = portionLp.times(token2AmountWholeLP).times(new BigNumber(2))
    // Calculate
    const tokenAmount = new BigNumber(tokenAmountWholeLP)
      .times(portionLp)
      .div(new BigNumber(10).pow(tokenDecimals))

    const token2Amount = new BigNumber(token2AmountWholeLP)
      .times(portionLp)
      .div(new BigNumber(10).pow(token2Decimals))

    var usdValue = 0;
    var totalToken2Value = totalLpToken2Value.div(new BigNumber(10).pow(token2Decimals))

    var price = await getPrice(token2Contract.toLowerCase());
    usdValue = totalToken2Value.times(price)

    const allocPoint = (await methods
      .contract(masterChefContract)
      .methods('poolInfo(uint256):(address,uint256,uint256,uint256)')
      .params(pid)
      .call())[1]
    const totalAllocPoint = await methods.contract(masterChefContract)
      .methods('totalAllocPoint():(uint256)')
      .params()
      .call()

    var myTokenPrice = await getPrice(process.env.TOKEN_ADDRESS);

    var result = {
      pid,
      tokenAmount: tokenAmount.toNumber(),
      token2Amount: token2Amount.toNumber(),
      totalToken2Value: totalToken2Value.toNumber(),
      tokenPriceInToken2: token2Amount.div(tokenAmount).toNumber(),
      usdValue: usdValue.toNumber(),
      newRewardPerBlock: new BigNumber(newRewardPerBlock).div(10 ** 18),
      poolWeight: new BigNumber(allocPoint).div(new BigNumber(totalAllocPoint)).toNumber(),
      apr: myTokenPrice * (process.env.NUMBER_BLOCK_PER_YEAR ? parseInt(process.env.NUMBER_BLOCK_PER_YEAR) : 2425000) * (new BigNumber(newRewardPerBlock).div(10 ** 18)).toNumber() / usdValue.toNumber(),
    }
    
    CACHE[pid].time = new Date().getTime()
    CACHE[pid].value = result;
    CACHE[pid].isLoading = false
  }
  return CACHE[pid].value

}

async function getAllLPValue() {
  return Promise.all(supportedPools.filter(e => active(e.pid)).map(e => getLPValue(
    e.lpAddresses[1],
    e.tokenAddresses[1],
    e.token2Addresses[1],
    e.pid,
  )))
}

function active(pid) {
  var e = supportedPools.find(e => e.pid == pid)
  if (e) {
    if (e.startAt) {
      return e.startAt < new Date().getTime() / 1000
    }
    else {
      return true
    }
  }
  else {
    return false
  }
}

module.exports = {
  getAllLPValue,
  active,
  getLPValue: (pid) => {
    var e = active(pid)

    if (e) {
      e = supportedPools.find(v => v.pid == pid)
      return getLPValue(
        e.lpAddresses[1],
        e.tokenAddresses[1],
        e.token2Addresses[1],
        e.pid,
      )
    }
    else {
      return {
        pid,
        tokenAmount: 0,
        token2Amount: 0,
        totalToken2Value: 0,
        tokenPriceInToken2: 0,
        usdValue: 0,
        newRewardPerBlock: 0,
        poolWeight: 0,
        
      }
    }

  },
  pools: supportedPools,
}