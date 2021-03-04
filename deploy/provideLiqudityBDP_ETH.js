const { Contract, walletAddress, txParams, encodeParameters, sleep } = require('./coreFunction')


var {
    RPC,
    GAS_LIMIT,
    GAS_PRICE_TX,
    GAS_PRICE_DEPLOY,
    PRIVATE_KEY,
    BDP_TOKEN_ADDRESS,
    UNISWAPV2_FACTORY_ADDRESS,
    UNISWAPV2_ROUTER_02_ADDRESS,
    WETH_ADDRESS,
    BLOCK_TIME
} = require('./config')
const OWNER_ADDRESS = walletAddress(PRIVATE_KEY, RPC)
const ADDRESS_0 = '0x0000000000000000000000000000000000000000'

console.log('OWNER_ADDRESS:', OWNER_ADDRESS);

async function main() {

    var ROUTER = await Contract(
        RPC,
        PRIVATE_KEY,
        GAS_PRICE_DEPLOY,
        GAS_LIMIT,
        UNISWAPV2_ROUTER_02_ADDRESS,
        'UniswapV2Router02'
    )

    var FACTORY = await Contract(
        RPC,
        PRIVATE_KEY,
        GAS_PRICE_DEPLOY,
        GAS_LIMIT,
        UNISWAPV2_FACTORY_ADDRESS,
        'UniswapV2Factory'
    )

    var BDP_TOKEN = await Contract(
        RPC,
        PRIVATE_KEY,
        GAS_PRICE_DEPLOY,
        GAS_LIMIT,
        BDP_TOKEN_ADDRESS,
        'BDPToken'
    )

    await BDP_TOKEN.approve(UNISWAPV2_ROUTER_02_ADDRESS, '100000000000000000000000000000', txParams(
        RPC,
        OWNER_ADDRESS,
        GAS_PRICE_TX,
        GAS_LIMIT
    ))
    await sleep(BLOCK_TIME * 2)
    await ROUTER.addLiquidityETH(BDP_TOKEN_ADDRESS, '1000000000000000000', '0', '0', OWNER_ADDRESS, 9999999999999, Object.assign(
        {
            value: '0x8AC7230489E80000' //1 eth
        },
        txParams(
            RPC,
            OWNER_ADDRESS,
            GAS_PRICE_TX,
            GAS_LIMIT
        )
    ))
    await sleep(BLOCK_TIME * 2)
    var BDP_ETH_PAIR = await FACTORY.getPair(BDP_TOKEN_ADDRESS, WETH_ADDRESS)
    var BDP_ETH_LP_TOKEN = await Contract(
        RPC,
        PRIVATE_KEY,
        GAS_PRICE_DEPLOY,
        GAS_LIMIT,
        BDP_ETH_PAIR,
        'UniswapV2ERC20'
    )
    console.log('BDP_ETH_PAIR', BDP_ETH_PAIR)
    console.log('BDP_ETH_LP_TOKEN.balanceOf(', OWNER_ADDRESS, ') = ', (await BDP_ETH_LP_TOKEN.balanceOf(OWNER_ADDRESS)).toString())
}

main()