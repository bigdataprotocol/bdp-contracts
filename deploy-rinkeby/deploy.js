const { Contract, walletAddress, txParams, encodeParameters, sleep } = require('./coreFunction')

// Config network, I tested on tomochain testnet. It's same with ethereum
var {
  RPC,
  GAS_LIMIT,
  GAS_PRICE_TX,
  GAS_PRICE_DEPLOY,
  BLOCK_TIME,
  PRIVATE_KEY,
  NUMBER_BLOCK_PER_DAY,
  START_AT_BLOCK,
  BDP_TOKEN_ADDRESS,
  BDP_MASTER_ADDRESS,
  BALPHA_TOKEN_ADDRESS,
  BALPHA_MASTER_ADDRESS,
  BDP_REWARD_PER_BLOCK,
  BALPHA_REWARD_PER_BLOCK,

  UNISWAPV2_FACTORY_ADDRESS,
  WETH_ADDRESS,
  UNISWAPV2_ROUTER_02,
  
  TOKEN_ADDRESSES
} = require('./config')

var BDP_TOKEN = null
var BDP_MASTER = null
var BALPHA_TOKEN = null
var BALPHA_MASTER = null
var BDP_ETH_PAIR = null
var BALPHA_ETH_PAIR = null

const OWNER_ADDRESS = walletAddress(PRIVATE_KEY, RPC)
const ADDRESS_0 = '0x0000000000000000000000000000000000000000'

console.log('OWNER_ADDRESS:', OWNER_ADDRESS);


async function deploy_BDPToken() {
  if (BDP_TOKEN_ADDRESS) {
    console.log('SKIP: Deployed BDPToken')
  }
  else {
    console.log('CALL: Deploy BDPToken')
  }

  BDP_TOKEN = await Contract(
    RPC, 
    PRIVATE_KEY, 
    GAS_PRICE_DEPLOY, 
    GAS_LIMIT,
    BDP_TOKEN_ADDRESS, 
    'BDPToken', 
    START_AT_BLOCK, 
    NUMBER_BLOCK_PER_DAY, 
    OWNER_ADDRESS
  )

  BDP_TOKEN_ADDRESS = BDP_TOKEN.address
  console.log('DONE: BDPToken:', BDP_TOKEN_ADDRESS)

  return BDP_TOKEN;
}

async function deploy_BDPMaster() {
  if (BDP_MASTER_ADDRESS) {
    console.log('SKIP: Deployed BDPMaster')
  }
  else {
    console.log('CALL: Deploy BDPMaster')
  }
  BDP_MASTER = await Contract(
    RPC,
    PRIVATE_KEY, 
    GAS_PRICE_DEPLOY,
    GAS_LIMIT,
    BDP_MASTER_ADDRESS,
    'BDPMaster',
    BDP_TOKEN_ADDRESS,
    BDP_REWARD_PER_BLOCK,
    START_AT_BLOCK
  );
  
  BDP_MASTER_ADDRESS = BDP_MASTER.address
  console.log('DONE: BDPMaster:', BDP_MASTER_ADDRESS)

  return BDP_MASTER
}

async function set_BDPMasterForBDPToken() {
  var masterInBdpToken = await BDP_TOKEN.BDPMaster()
  if (masterInBdpToken == ADDRESS_0) {
    console.log('CALL: Set BDPMaster for BDPToken')
    var tx = await BDP_TOKEN.setMaster(BDP_MASTER.address, txParams(
      RPC,
      OWNER_ADDRESS,
      GAS_PRICE_TX,
      GAS_LIMIT
    ))
    console.log('DONE: Set BDPMaster for BDPToken')
    return tx;
  }
  else {
    console.log('SKIP: BDLToken set BDPMaster already')
  }
}


async function deploy_bAlphaToken() {
  if (BALPHA_TOKEN_ADDRESS) {
    console.log('SKIP: Deployed bAlphaToken')
  }
  else {
    console.log('CALL: Deploy bAlphaToken')
  }

  BALPHA_TOKEN = await Contract(
    RPC, 
    PRIVATE_KEY, 
    GAS_PRICE_DEPLOY, 
    GAS_LIMIT,
    BALPHA_TOKEN_ADDRESS, 
    'bAlphaToken', 
    OWNER_ADDRESS
  )

  BALPHA_TOKEN_ADDRESS = BALPHA_TOKEN.address
  console.log('DONE: bAlphaToken:', BALPHA_TOKEN_ADDRESS)

  return BALPHA_TOKEN;
}

async function deploy_bAlphaMaster() {
  if (BALPHA_MASTER_ADDRESS) {
    console.log('SKIP: Deployed bAlphaMaster')
  }
  else {
    console.log('CALL: Deploy bAlphaMaster')
  }
  BALPHA_MASTER = await Contract(
    RPC,
    PRIVATE_KEY, 
    GAS_PRICE_DEPLOY,
    GAS_LIMIT,
    BALPHA_MASTER_ADDRESS,
    'bAlphaMaster',
    BALPHA_TOKEN_ADDRESS,
    BALPHA_REWARD_PER_BLOCK,
    START_AT_BLOCK,
    NUMBER_BLOCK_PER_DAY * 7
  );
  
  BALPHA_MASTER_ADDRESS = BALPHA_MASTER.address
  console.log('DONE: bAlphaMaster:', BALPHA_MASTER_ADDRESS)

  return BALPHA_MASTER
}

async function set_bAlphaMasterForbAlphaToken() {
  var masterInbAlphaToken = await BALPHA_TOKEN.bAlphaMaster()
  if (masterInbAlphaToken == ADDRESS_0) {
    console.log('CALL: Set bAlphaMaster for bAlphaToken')
    var tx = await BALPHA_TOKEN.setMaster(BALPHA_MASTER.address, txParams(
      RPC,
      OWNER_ADDRESS,
      GAS_PRICE_TX,
      GAS_LIMIT
    ))
    console.log('DONE: Set bAlphaMaster for bAlphaToken')
    return tx;
  }
  else {
    console.log('SKIP: bAlphaToken set bAlphaMaster already')
  }
}

async function prepairTokenList() {
  console.log("IMPORTANT NOTE: You must make sure that token address is correct")
  console.log("If token address of token is empty, It will create a mock token then send 10000 token to owner address")
  
  var TOKENS = Object.keys(TOKEN_ADDRESSES);

  for (var i = 0; i < TOKENS.length; i++) {
    var symbol = TOKENS[i]
    if (!TOKEN_ADDRESSES[symbol]) {
      var mock = await Contract(RPC, PRIVATE_KEY, GAS_PRICE_DEPLOY, GAS_LIMIT, '', 'MockERC20', symbol, symbol, '1000000000000000000000000')
      TOKEN_ADDRESSES[symbol] = mock.address
      console.log("Created Mock token:", symbol, "|", mock.address)
      await sleep(BLOCK_TIME * 2)
    }
  }
  console.log("DONE: finish prepair token list")
}

async function addTokenToPoolInBDPMaster() {
  var TOKENS = Object.keys(TOKEN_ADDRESSES);
  for (var i = 0; i < TOKENS.length; i++) {
    var symbol = TOKENS[i]
    var address = TOKEN_ADDRESSES[symbol]

    var id = (await BDP_MASTER.poolId1(address)).toString()

    if (id == 0) {
      await BDP_MASTER.add(100, address, false, await txParams(
        RPC,
        OWNER_ADDRESS,
        GAS_PRICE_TX,
        GAS_LIMIT
      ))
      console.log(`Added ${symbol} to pool in BDPMaster`)
      await sleep(BLOCK_TIME * 2)
    }
    else {
      console.log(`${symbol} is in pool, skip it`)
    }
  }
}

async function createPair_BDP_ETH() {
  const uniswap = await Contract(
    RPC,
    PRIVATE_KEY,
    GAS_PRICE_DEPLOY,
    GAS_LIMIT,
    UNISWAPV2_FACTORY_ADDRESS,
    'UniswapV2Factory',
    ADDRESS_0
  );

  BDP_ETH_PAIR = await uniswap.getPair(BDP_TOKEN_ADDRESS, WETH_ADDRESS)
  if (BDP_ETH_PAIR == ADDRESS_0) {
    await uniswap.createPair(BDP_TOKEN_ADDRESS, WETH_ADDRESS);
    await sleep(BLOCK_TIME * 2)
    BDP_ETH_PAIR = await uniswap.getPair(BDP_TOKEN_ADDRESS, WETH_ADDRESS)
    console.log("DONE: Crated pair BDP_ETH, pair address:", BDP_ETH_PAIR)
  }
  else {
    console.log('SKIP: Already create pair BDP_ETH')
  }
}

async function createPair_BALPHA_ETH() {
  const uniswap = await Contract(
    RPC,
    PRIVATE_KEY,
    GAS_PRICE_DEPLOY,
    GAS_LIMIT,
    UNISWAPV2_FACTORY_ADDRESS,
    'UniswapV2Factory',
    ADDRESS_0
  );

  BALPHA_ETH_PAIR = await uniswap.getPair(BALPHA_TOKEN_ADDRESS, WETH_ADDRESS)
  if (BALPHA_ETH_PAIR == ADDRESS_0) {
    await uniswap.createPair(BALPHA_TOKEN_ADDRESS, WETH_ADDRESS);
    await sleep(BLOCK_TIME * 2)
    BALPHA_ETH_PAIR = await uniswap.getPair(BALPHA_TOKEN_ADDRESS, WETH_ADDRESS)
    console.log("DONE: Crated pair BALPHA_ETH, pair address:", BALPHA_ETH_PAIR)
  }
  else {
    console.log('SKIP: Already create pair BALPHA_ETH')
  }
}

async function add_BDP_ETH_ToPoolInBAlphaMaster() {
  var id = (await BALPHA_MASTER.poolId1(BDP_ETH_PAIR)).toString()

  if (id == 0) {
    await BALPHA_MASTER.add(200, BDP_ETH_PAIR, false, await txParams(
      RPC,
      OWNER_ADDRESS,
      GAS_PRICE_TX,
      GAS_LIMIT
    ))
    console.log(`Added BDP_ETH_LP to pool in bAlphaMaster`)
    await sleep(BLOCK_TIME * 2)
  }
  else {
    console.log(`BDP_ETH_LP is in pool, skip it`)
  }
}

async function add_BALPHA_ETH_ToPoolInBAlphaMaster() {
  var id = (await BALPHA_MASTER.poolId1(BALPHA_ETH_PAIR)).toString()

  if (id == 0) {
    await BALPHA_MASTER.add(100, BALPHA_ETH_PAIR, false, await txParams(
      RPC,
      OWNER_ADDRESS,
      GAS_PRICE_TX,
      GAS_LIMIT
    ))
    console.log(`Added BALPHA_ETH_LP to pool in bAlphaMaster`)
    await sleep(BLOCK_TIME * 2)
  }
  else {
    console.log(`BALPHA_ETH_LP is in pool, skip it`)
  }
}

async function main() {
  console.log('\n\n------STEP 1: Deploy BDPToken')
  await deploy_BDPToken()
  await sleep(BLOCK_TIME * 2)
  
  console.log('\n\n------STEP 2: Deploy BDPMaster')
  await deploy_BDPMaster()
  await sleep(BLOCK_TIME * 2)

  console.log('\n\n------STEP 3: Deploy bAlphaToken')
  await deploy_bAlphaToken()
  await sleep(BLOCK_TIME * 2)

  console.log('\n\n------STEP 4: Deploy bAlphaMaster')
  await deploy_bAlphaMaster()
  await sleep(BLOCK_TIME * 2)

  console.log('\n\n------STEP 5: Set BDPMaster for BDPToken')
  await set_BDPMasterForBDPToken()
  await sleep(BLOCK_TIME * 2)

  console.log('\n\n------STEP 6: Set bAlphaMaster for bAlphaToken')
  await set_bAlphaMasterForbAlphaToken()
  await sleep(BLOCK_TIME * 2)

  console.log('\n\n------STEP 7: Prepair token list for BDPMaster')
  await prepairTokenList()
  await sleep(BLOCK_TIME * 2)

  console.log('\n\n------STEP 8: Add token list to pool in BDPMaster')
  await addTokenToPoolInBDPMaster()
  await sleep(BLOCK_TIME * 2)

  console.log('\n\n------STEP 9: Create pair BDP_ETH')
  await createPair_BDP_ETH()
  await sleep(BLOCK_TIME * 2)

  console.log('\n\n------STEP 10: Create pair BALPHA_ETH')
  await createPair_BALPHA_ETH()
  await sleep(BLOCK_TIME * 2)

  console.log('\n\n------STEP 11: Add BDP_ETH_LP to bAlphaMaster pool')
  await add_BDP_ETH_ToPoolInBAlphaMaster()
  await sleep(BLOCK_TIME * 2)

  console.log('\n\n------STEP 12: Add bALPHA_ETH_LP to bAlphaMaster pool')
  await add_BALPHA_ETH_ToPoolInBAlphaMaster()
  await sleep(BLOCK_TIME * 2)

  await sleep(BLOCK_TIME * 10)

  console.log({
    BDP_TOKEN_ADDRESS,
    BDP_MASTER_ADDRESS,
    BALPHA_TOKEN_ADDRESS,
    BALPHA_MASTER_ADDRESS,
    BDP_ETH_PAIR,
    BALPHA_ETH_PAIR,
    WETH_ADDRESS,
    UNISWAPV2_FACTORY_ADDRESS,
    TOKEN_ADDRESSES,

    "_": "",

    RE_CHECK_INFO_PLEASE____NUMBER_BLOCK_PER_DAY: NUMBER_BLOCK_PER_DAY,
    RE_CHECK_INFO_PLEASE____FARMING_START_AT_BLOCK: START_AT_BLOCK,
    RE_CHECK_INFO_PLEASE____VIEW_ESTIMATE_TIME_START_FARMING: `https://etherscan.io/block/countdown/${START_AT_BLOCK}`,
    
    "__": "",
    RE_CHECK_INFO_PLEASE____bdp_master_set_bdp_token_is: await BDP_MASTER.BDP(),
    RE_CHECK_INFO_PLEASE____bdp_master_reward_per_block: (await BDP_MASTER.REWARD_PER_BLOCK()).toString(),
    RE_CHECK_INFO_PLEASE____bdp_master_start_block: (await BDP_MASTER.START_BLOCK()).toString(),
    RE_CHECK_INFO_PLEASE____bdp_master_pool_length: (await BDP_MASTER.poolLength()).toString(),
    "______": "",
    RE_CHECK_INFO_PLEASE____balpha_master_set_balpha_token_is: await BALPHA_MASTER.bAlpha(),
    RE_CHECK_INFO_PLEASE____balpha_master_reward_per_block: (await BALPHA_MASTER.REWARD_PER_BLOCK()).toString(),
    RE_CHECK_INFO_PLEASE____balpha_master_start_block: (await BALPHA_MASTER.START_BLOCK()).toString(),
    RE_CHECK_INFO_PLEASE____balpha_master_pool_length: (await BALPHA_MASTER.poolLength()).toString(),
    "___": "",

    RE_CHECK_INFO_PLEASE____bdp_token_set_bdp_master_is: await BDP_TOKEN.BDPMaster(),
    RE_CHECK_INFO_PLEASE____bdp_token_CAP: (await BDP_TOKEN.cap()).toString(),
    RE_CHECK_INFO_PLEASE____bdl_token_balanceOf_OWNER: (await BDP_TOKEN.balanceOf(OWNER_ADDRESS)).toString(),
    RE_CHECK_INFO_PLEASE____bdl_token_amount_for_seed_pool: (await BDP_TOKEN.seedPoolAmount()).toString(),

    RE_CHECK_INFO_PLEASE____bdl_token_total_for_partner_ship: (await BDP_TOKEN.PARTNERSHIP_TOTAL_AMOUNT()).toString(),
    RE_CHECK_INFO_PLEASE____bdl_token_firt_mint_for_partner_ship: (await BDP_TOKEN.PARTNERSHIP_FIRST_MINT()).toString(),
    RE_CHECK_INFO_PLEASE____bdl_token_total_for_team: (await BDP_TOKEN.TEAM_TOTAL_AMOUNT()).toString(),
    RE_CHECK_INFO_PLEASE____bdl_token_total_for_future: (await BDP_TOKEN.FUTURE_TOTAL_AMOUNT()).toString(),
    RE_CHECK_INFO_PLEASE____bdl_token_each_mint_for_future: (await BDP_TOKEN.FUTURE_EACH_MINT()).toString(),
    
    "____": "",

    RE_CHECK_INFO_PLEASE____balpha_token_balanceOf_OWNER: (await BALPHA_TOKEN.balanceOf(OWNER_ADDRESS)).toString(),
    RE_CHECK_INFO_PLEASE____balpha_token_set_balpha_master_is: await BALPHA_TOKEN.bAlphaMaster()
  })
}

main()