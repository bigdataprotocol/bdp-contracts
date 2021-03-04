const { Contract, walletAddress, txParams, encodeParameters, sleep } = require('./coreFunction')

var {
    RPC,
    GAS_LIMIT,
    GAS_PRICE_DEPLOY,
    PRIVATE_KEY
} = require('./config')
const OWNER_ADDRESS = walletAddress(PRIVATE_KEY, RPC)

console.log('OWNER_ADDRESS:', OWNER_ADDRESS);


async function main() {
    var WETH = await Contract(
        RPC,
        PRIVATE_KEY,
        GAS_PRICE_DEPLOY,
        GAS_LIMIT,
        '',
        'WETH9'
    )

    await sleep(BLOCK_TIME * 2)
    
    var FACTORY = await Contract(
        RPC,
        PRIVATE_KEY,
        GAS_PRICE_DEPLOY,
        GAS_LIMIT,
        '',
        'UniswapV2Factory',
        '0x0000000000000000000000000000000000000000'
    )

    await sleep(BLOCK_TIME * 2)

    var ROUTER = await Contract(
        RPC,
        PRIVATE_KEY,
        GAS_PRICE_DEPLOY,
        GAS_LIMIT,
        '',
        'UniswapV2Router02',
        FACTORY.address,
        WETH.address
    )

    console.log({
        WETH: WETH.address,
        FACTORY: FACTORY.address,
        ROUTER: ROUTER.address
    })
}

main()