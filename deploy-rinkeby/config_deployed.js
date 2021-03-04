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

    BDP_TOKEN_ADDRESS: '0x6603c77001Cc79610985cdf4eED2c219Ca3c7854', // your test bdp token on website
    BALPHA_TOKEN_ADDRESS: '0xFdEfc3F547203103c65d903adc581EE591967247', // your test balpha token on website
    BDP_MASTER_ADDRESS: '0x7B4372b751418fDF39d20a18A9707eC9e10EeD95',
    BALPHA_MASTER_ADDRESS: '0xF0ABE74bCf066d93bE1Ede7DdbA5eE411eee5F82',

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
        WBTC: '0x8Fa43084b69576709C408d3dAE0d4dec6161B57e',
        USDT: '0x99f86917C69179Cf9369996768FBC4e5b3Ac101B',
        USDC: '0xB837c744A16A7f133A750254270Dce792dBBAE77',
        OCEAN: '0x1BA0DdCa35e152bE46e85e1EF9Db22d431dDc95e',
        LINK: '0x6f7425954a609bc4f585A13664c414D543B676d8',
        SUSHI: '0x892B48211C254bE476130929D5897347aD0f6246',
        UNI: '0xE2107E94DD734D0677Fcd33537cC3B31257Ca8C6',
        YFI: '0x82aD3133616FeF68d3cC117E5E36e266bbA01d83',
        AAVE: '0xF0BAf1875B29780B29aFa6329DF385FB92B67691',
        SRM: '0x7c050D411f2219b0AA980F5A4d03753DC160C093',
        TOMOE: '0x0a58FEb5D17f4D1B07B5Fa71740985964636E50a',
    }

}