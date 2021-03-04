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

const OWNER_ADDRESS = walletAddress(PRIVATE_KEY, RPC)

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

  console.log('----- wait 20s ----')
  console.log('you can stop by press CTRL + C');
  console.log()
  await sleep(20000)

  console.log("Transfer owner of BDP_TOKEN to: ", address)
  await sleep(10000)
  await BDP_TOKEN.transferOwnership(address, await txParams(
    RPC,
    OWNER_ADDRESS,
    GAS_PRICE_TX,
    GAS_LIMIT
  ))
  await sleep(BLOCK_TIME * 2)
  
  console.log("Transfer owner of BALPHA_TOKEN to: ", address)
  await sleep(10000)
  await BALPHA_TOKEN.transferOwnership(address, await txParams(
    RPC,
    OWNER_ADDRESS,
    GAS_PRICE_TX,
    GAS_LIMIT
  ))
  await sleep(BLOCK_TIME * 2)

  console.log("Transfer owner of BDP_MASTER to: ", address)
  await sleep(10000)
  await BDP_MASTER.transferOwnership(address, await txParams(
    RPC,
    OWNER_ADDRESS,
    GAS_PRICE_TX,
    GAS_LIMIT
  ))
  await sleep(BLOCK_TIME * 2)

  console.log("Transfer owner of BALPHA_MASTER to: ", address)
  await sleep(10000)
  await BALPHA_MASTER.transferOwnership(address, await txParams(
    RPC,
    OWNER_ADDRESS,
    GAS_PRICE_TX,
    GAS_LIMIT
  ))
  await sleep(BLOCK_TIME * 2)


  console.log('--------- NEW OWNER -------')
  console.log('Owner of BDP_TOKEN:    ', await BDP_TOKEN.owner())
  console.log('Owner of BALPHA_TOKEN: ', await BALPHA_TOKEN.owner())
  console.log('Owner of BDP_MASTER:   ', await BDP_MASTER.owner())
  console.log('Owner of BALPHA_MASTER:', await BALPHA_MASTER.owner())

}

function enterString(prompt, callback) {
  var BACKSPACE = String.fromCharCode(127);
  if (prompt) {
    process.stdout.write(prompt);
  }

  var stdin = process.stdin;
  stdin.resume();
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding('utf8');

  var password = '';
  stdin.on('data', function (ch) {
    ch = ch.toString('utf8');

    switch (ch) {
      case "\n":
      case "\r":
      case "\u0004":
        // They've finished typing their password
        process.stdout.write('\n');
        stdin.setRawMode(false);
        stdin.pause();
        callback(false, password);
        break;
      case "\u0003":
        // Ctrl-C
        callback(true);
        break;
      case BACKSPACE:
        password = password.slice(0, password.length - 1);
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(prompt);
        break;
      default:
        // More passsword characters
        process.stdout.write(ch);
        password += ch;
        break;
    }
  });
}

enterString("Enter ADDRESS of NEW OWNER: ", async (err, address) => {
  address = address.trim()
  console.log('Set owner to              :', address)
  console.log('Please check it again');
  console.log('We will start set new owner in 60s')
  console.log('If you want to stop, press CTRL + C')

  for (var i = 0; i < 60; i++) {
    await sleep(1000)
    if (i >= 50) {
      console.log(i)
    }
  }
  console.log('Start set new owner to: ', address)
  await sleep(10000)
  main(address)
})

