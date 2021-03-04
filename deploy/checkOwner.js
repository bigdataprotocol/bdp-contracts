const { Contract, walletAddress, txParams, encodeParameters, sleep } = require('./coreFunction')

var {
  RPC,
  GAS_LIMIT,
  GAS_PRICE_TX,
  GAS_PRICE_DEPLOY,
  BLOCK_TIME,
  PRIVATE_KEY,
  BDP_TOKEN_ADDRESS,
  BDP_MASTER_ADDRESS,
  BALPHA_TOKEN_ADDRESS,
  BALPHA_MASTER_ADDRESS,

  UNISWAPV2_FACTORY_ADDRESS,
  WETH_ADDRESS,
  UNISWAPV2_ROUTER_02,
  
  TOKEN_ADDRESSES
} = require('./config')



async function main(address) {
  var BDP_TOKEN = await Contract(
    RPC,
    PRIVATE_KEY,
    GAS_PRICE_DEPLOY,
    GAS_LIMIT,
    BDP_TOKEN_ADDRESS,
    'BDPToken'
  )

  var BALPHA_TOKEN = await Contract(
    RPC,
    PRIVATE_KEY,
    GAS_PRICE_DEPLOY,
    GAS_LIMIT,
    BALPHA_TOKEN_ADDRESS,
    'bAlphaToken'
  )

  var BDP_MASTER = await Contract(
    RPC,
    PRIVATE_KEY,
    GAS_PRICE_DEPLOY,
    GAS_LIMIT,
    BDP_MASTER_ADDRESS,
    'BDPMaster'
  )

  var BALPHA_MASTER = await Contract(
    RPC,
    PRIVATE_KEY,
    GAS_PRICE_DEPLOY,
    GAS_LIMIT,
    BALPHA_MASTER_ADDRESS,
    'bAlphaMaster'
  )

  console.log('--------- CURRENT OWNER -------')
  console.log('Owner of BDP_TOKEN:    ', await BDP_TOKEN.owner())
  console.log('Owner of BALPHA_TOKEN: ', await BALPHA_TOKEN.owner())
  console.log('Owner of BDP_MASTER:   ', await BDP_MASTER.owner())
  console.log('Owner of BALPHA_MASTER:', await BALPHA_MASTER.owner())

}

main()