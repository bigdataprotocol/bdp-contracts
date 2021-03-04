const { Contract, walletAddress, txParams, encodeParameters, sleep } = require('./coreFunction')


var {
    RPC,
    GAS_LIMIT,
    GAS_PRICE_TX,
    GAS_PRICE_DEPLOY,
    BLOCK_TIME,
    PRIVATE_KEY,
    BALPHA_TOKEN_ADDRESS,
    UNISWAPV2_FACTORY_ADDRESS,
    UNISWAPV2_ROUTER_02_ADDRESS,
    WETH_ADDRESS
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

    var BALPHA_TOKEN = await Contract(
        RPC,
        PRIVATE_KEY,
        GAS_PRICE_DEPLOY,
        GAS_LIMIT,
        BALPHA_TOKEN_ADDRESS,
        'bAlphaToken'
    )

    await BALPHA_TOKEN.approve(UNISWAPV2_ROUTER_02_ADDRESS, '100000000000000000000000000000', txParams(
        RPC,
        OWNER_ADDRESS,
        GAS_PRICE_TX,
        GAS_LIMIT
    ))

    console.log('BALPHA_TOKEN.balanceOf(', OWNER_ADDRESS, ') = ', (await BALPHA_TOKEN.balanceOf(OWNER_ADDRESS)).toString())

    await sleep(BLOCK_TIME * 2)
    await ROUTER.addLiquidityETH(BALPHA_TOKEN_ADDRESS, '1000000000000000000', '0', '0', OWNER_ADDRESS, 9999999999999, Object.assign(
        {
            value: '0x16345785D8A0000' //0.1 eth
        },
        txParams(
            RPC,
            OWNER_ADDRESS,
            GAS_PRICE_TX,
            GAS_LIMIT
        )
    ))
    await sleep(BLOCK_TIME * 2)
    var BALPHA_ETH_PAIR = await FACTORY.getPair(BALPHA_TOKEN_ADDRESS, WETH_ADDRESS)
    var BALPHA_ETH_LP_TOKEN = await Contract(
        RPC,
        PRIVATE_KEY,
        GAS_PRICE_DEPLOY,
        GAS_LIMIT,
        BALPHA_ETH_PAIR,
        'UniswapV2ERC20'
    )
    console.log('BALPHA_ETH_PAIR', BALPHA_ETH_PAIR)
    console.log('BALPHA_ETH_LP_TOKEN.balanceOf(', OWNER_ADDRESS, ') = ', (await BALPHA_ETH_LP_TOKEN.balanceOf(OWNER_ADDRESS)).toString())
}

main()