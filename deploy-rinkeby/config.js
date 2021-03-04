module.exports = {
    // Config network, I tested on tomochain testnet. It's same with ethereum
    RPC: 'https://rinkeby.infura.io/v3/3b12337ef91e41bfa3f1e784dd17fea8',
    GAS_LIMIT: 5000000,
    GAS_PRICE_TX: 2000000000,
    GAS_PRICE_DEPLOY: 3000000000,
    BLOCK_TIME: 15000, // 2s, in minisecond


    // gas price:           200000000000, 200 Gwei
    // gas price deploy:    300000000000, 300 Gwei

    
    PRIVATE_KEY: 'de957dbd1cf5a519c22fe57aa6bd28ff3f69f2e17b41c4c07a3308d63be3122a',
    NUMBER_BLOCK_PER_DAY: 6000, // for ethereum
    START_AT_BLOCK: 11983792, // enter your start block at

    // start at block: 
    // https://www.timeanddate.com/countdown/generic?iso=20210306T08&p0=127&font=cursive
    // current time March 4: 4:59 PST 
    // 2 days: 2 * 24 * 60 * 60 = 172,800
    // 15 hours: 15 * 60 * 60 = 54,000
    // number of blocks: 15120
    // current block time: 11968672
    // start at block = 11968672 + 15120 = 11,983,792


    // If you deploy their contract before, 
    // enter contract address to re-use without deploy the new one

    BDP_TOKEN_ADDRESS: '', // your test bdp token on website
    BALPHA_TOKEN_ADDRESS: '', // your test balpha token on website
    BDP_MASTER_ADDRESS: '',
    BALPHA_MASTER_ADDRESS: '',

    BDP_REWARD_PER_BLOCK: '666000000000000000000', //dont change for 24000000 BDP in 6 weeks
    BALPHA_REWARD_PER_BLOCK: '15122370739158480', //dont change for 18000 bALPHA in 12 weeks

    // Enter Uniswapv2Factory and WETH address on ethereum for production
    UNISWAPV2_FACTORY_ADDRESS: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    WETH_ADDRESS: '0xc778417e063141139fce010982780140aa0cd5ab',
    UNISWAPV2_ROUTER_02_ADDRESS: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    // factory address source https://uniswap.org/docs/v2/smart-contracts/factory/
    // weth address source: https://etherscan.io/token/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2
    // router address source: https://uniswap.org/docs/v2/smart-contracts/router02/

    // Enter token address on mainnet for production
    TOKEN_ADDRESSES: {
        WETH: "0xc778417e063141139fce010982780140aa0cd5ab",
        WBTC: '',
        USDT: '',
        USDC: '',
        OCEAN: '',
        LINK: '',
        SUSHI: '',
        UNI: '',
        YFI: '',
        AAVE: '',
        SRM: '',
        TOMOE: '',
    }

}