module.exports = {
    // Config network, I tested on tomochain testnet. It's same with ethereum
    RPC: 'https://mainnet.infura.io/v3/58568cc195864a12ad8b99a1e9171dcf',
    GAS_LIMIT: 5000000,
    GAS_PRICE_TX: 120000000000,
    GAS_PRICE_DEPLOY: 120000000000,
    BLOCK_TIME: 15000, // 2s, in minisecond


    // gas price:           200000000000, 200 Gwei
    // gas price deploy:    300000000000, 300 Gwei

    
    PRIVATE_KEY: 'de957dbd1cf5a519c22fe57aa6bd28ff3f69f2e17b41c4c07a3308d63be3122a',
    NUMBER_BLOCK_PER_DAY: 6000, // for ethereum
    START_AT_BLOCK: 11985974, // enter your start block at

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

    BDP_TOKEN_ADDRESS: '0xf3dcbc6D72a4E1892f7917b7C43b74131Df8480e', //0x683d9cdd3239e0e01e8dc6315fa50ad92ab71d2d your test bdp token on website
    BALPHA_TOKEN_ADDRESS: '0x7a5ce6abD131EA6B148a022CB76fc180ae3315A6', //0x0fe4223ad99df788a6dcad148eb4086e6389ceb6 your test balpha token on website
    BDP_MASTER_ADDRESS: '0x0De845955E2bF089012F682fE9bC81dD5f11B372',
    BALPHA_MASTER_ADDRESS: '0xf20084BA368567fa3dA1Da85b43Ac1AC310880C8',

    BDP_REWARD_PER_BLOCK: '666000000000000000000',
    BALPHA_REWARD_PER_BLOCK: '15122370739158480',

    // Enter Uniswapv2Factory and WETH address on ethereum for production
    UNISWAPV2_FACTORY_ADDRESS: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    WETH_ADDRESS: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    UNISWAPV2_ROUTER_02_ADDRESS: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    // factory address source https://uniswap.org/docs/v2/smart-contracts/factory/
    // weth address source: https://etherscan.io/token/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2
    // router address source: https://uniswap.org/docs/v2/smart-contracts/router02/

    // Enter token address on mainnet for production
    TOKEN_ADDRESSES: {
        WETH: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        WBTC: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
        USDT: "0xdac17f958d2ee523a2206206994597c13d831ec7",
        USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        OCEAN: "0x967da4048cd07ab37855c090aaf366e4ce1b9f48",
        LINK: "0x514910771af9ca656af840dff83e8264ecf986ca",
        SUSHI: "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2",
        UNI: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
        YFI: "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e",
        AAVE: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
        SRM: "0x476c5e26a75bd202a9683ffd34359c0cc15be0ff",
        TOMOE: "0x05d3606d5c81eb9b7b18530995ec9b29da05faba",
    }

    // wbtc address source: https://etherscan.io/token/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599
    // usdt address source: https://etherscan.io/token/0xdac17f958d2ee523a2206206994597c13d831ec7
    // usdc address source: https://etherscan.io/token/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
    // ocean address source: https://etherscan.io/token/0x967da4048cd07ab37855c090aaf366e4ce1b9f48
    // link address source: https://etherscan.io/token/0x514910771af9ca656af840dff83e8264ecf986ca
    // sushi address source: https://etherscan.io/token/0x6b3595068778dd592e39a122f4f5a5cf09c90fe2
    // uni address source: https://etherscan.io/token/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984
    // yfi address source: https://etherscan.io/token/0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e
    // aave address source: https://etherscan.io/token/0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9
    // srm address source: https://etherscan.io/token/0x476c5e26a75bd202a9683ffd34359c0cc15be0ff
    // tomoe address source: https://etherscan.io/token/0x05d3606d5c81eb9b7b18530995ec9b29da05faba

}