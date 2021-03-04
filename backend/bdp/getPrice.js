const axios = require('axios')

const PRICE = {};

async function getPrice(token) {
  try {
    var tokenAddress = token ? token.toLowerCase() : token;

    let price = 0;
    if (PRICE[token] && (new Date().getTime() - PRICE[token].updatedAt < 10 * 60 * 1000)) {
      return PRICE[token].value || 0;
    }
  
    if (token === 'USDC' || token === 'USDCT' || tokenAddress === '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' || tokenAddress === '0xdac17f958d2ee523a2206206994597c13d831ec7') {
      return 1
    }
  
    if (token === 'LUA' || tokenAddress === '0xb1f66997a5760428d3a87d68b90bfe0ae64121cc') {
      var { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=lua-token&vs_currencies=usd')
      price = parseFloat(data['lua-token'].usd) || 0
    }
    else if (token === 'ETH' || tokenAddress === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
      var { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
      price = parseFloat(data['ethereum'].usd) || 0
    }
    else if (token === 'SUSHI' || tokenAddress === '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2') {
      var { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=sushi&vs_currencies=usd')
      price = parseFloat(data['sushi'].usd) || 0
    }
    else if (token === 'TOMO' || token === 'TOMOE' || tokenAddress === '0x05d3606d5c81eb9b7b18530995ec9b29da05faba') {
      var { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=tomochain&vs_currencies=usd')
      price = parseFloat(data['tomochain'].usd) || 0
    }
    else if (token === 'SRM' || tokenAddress === '0x476c5e26a75bd202a9683ffd34359c0cc15be0ff') {
      var { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=serum&vs_currencies=usd')
      price = parseFloat(data['serum'].usd) || 0
    }
    else if (token === 'FTT' || tokenAddress === '0x50d1c9771902476076ecfc8b2a83ad6b9355a4c9') {
      var { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ftx-token&vs_currencies=usd')
      price = parseFloat(data['ftx-token'].usd) || 0
    }
    else if (token === 'KAI' || tokenAddress === '0xd9ec3ff1f8be459bb9369b4e79e9ebcf7141c093') {
      var { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=kardiachain&vs_currencies=usd')
      price = parseFloat(data['kardiachain'].usd) || 0
    }
    else if (token === 'OM' || tokenAddress === '0x2baecdf43734f22fd5c152db08e3c27233f0c7d2') {
      var { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=mantra-dao&vs_currencies=usd')
      price = parseFloat(data['mantra-dao'].usd) || 0
    }
    else if (token === 'FRONT' || tokenAddress === '0xf8c3527cc04340b208c854e985240c02f7b7793f') {
      var { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=frontier-token&vs_currencies=usd')
      price = parseFloat(data['frontier-token'].usd) || 0
    }
    else if (token === 'BTC' || token === 'WBTC' || tokenAddress === '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599') {
      var { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
      price = parseFloat(data['bitcoin'].usd) || 0
    }
    else {
      price = 0
    }
  
    PRICE[token] = {
      updatedAt: new Date().getTime(),
      value: price
    };
  
    return price
  }
  catch (ex) {
    console.error('get price error', token, ex.toString());
    return (PRICE[token] || {}).value || 0
  }
}

module.exports = getPrice