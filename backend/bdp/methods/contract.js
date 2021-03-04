const Web3 = require('web3')
const BigNumber = require('bignumber.js')
const config = require('./config')
const web3 = new Web3(config.RPC)
const ABI = require('./abi')

const GAS_LIMIT = config.GAS_LIMIT
const GAS_PRICE = config.GAS_PRICE

async function send(contract, method, params, amount, privateKey) {
  var account = web3.eth.accounts.privateKeyToAccount(privateKey);
  const [nonce, balance] = await Promise.all([
    web3.eth.getTransactionCount(account.address),
    web3.eth.getBalance(account.address)
  ])

  amount = new BigNumber(amount).multipliedBy(10 ** 18).toString()

  if (BigNumber(GAS_PRICE)
    .multipliedBy(GAS_LIMIT)
    .plus(amount)
    .isGreaterThan(balance))
  {
    throw Error("Not enough balance")
  }

  let tx_builder = contract.methods[method](...params);
  let encoded_tx = tx_builder.encodeABI();
  
  var signedTx = await web3.eth.accounts.signTransaction({
    from: account.address,
    to: contract.options.address,
    nonce: nonce,
    value: amount,
    gas: GAS_LIMIT,
    data: encoded_tx,
    gasPrice: GAS_PRICE,
    chainId: config.NETWORK_ID
  }, privateKey)

  var transactionHash = web3.utils.sha3(signedTx.rawTransaction, { encoding: "hex" })
  await web3.eth.sendSignedTransaction(signedTx.rawTransaction)

  return transactionHash
}

function parseParams(abiMethod, params) {
  let result = []
  if (params.length === 1 && typeof params[0] === 'object') {
    if (abiMethod.inputs && Array.isArray(abiMethod.inputs)) {
      abiMethod.inputs.forEach(e => {
        result.push(params[0][e.name])
      })
    }
    else {
      params = Object.keys(params[0]).map(e => parmas[0][e])
    }
  } 
  else {
    result = params
  }
  return result
}

function praseMethodAbi(abi, abiMethodOrName) {
  var abiMethod = null;
  if (typeof abiMethodOrName === 'string') {
    if (abi && Array.isArray(abi)) {
      abiMethod = abi.filter(e => e.name === abiMethodOrName)[0]
    }
    else if (abiMethodOrName.includes('(') && abiMethodOrName.includes(')')) {
      abiMethod = ABI.parse(abiMethodOrName)
    }
  }
  else if (typeof abiMethodOrName === 'object') {
    abiMethod = abiMethodOrName
  }
  return abiMethod
}


module.exports = (contractAddress, abi) => ({
  methods: (abiMethodOrName) => {
    let methodAbi = praseMethodAbi(abi, abiMethodOrName);
    return {
      params: (...params) => {
        let _params = parseParams(methodAbi, params)
        return {
          amount: (amount = 0) => {
            let contract = new web3.eth.Contract([ABI.payable(methodAbi)], contractAddress)
            let method = contract.methods[methodAbi.name]
            return {
              send: (privateKey) => send(contract, methodAbi.name, _params, amount, privateKey),
              estimateGas: (from) => method(..._params)
                .estimateGas({ 
                  from, 
                  value: new BigNumber(amount).multipliedBy(10 ** 18).toString()
                })
            }
          },
          send: (privateKey) => {
            let contract = new web3.eth.Contract([ABI.write(methodAbi)], contractAddress)
            return send(contract, methodAbi.name, _params, 0, privateKey)
          },
          estimateGas: (from) => {
            let contract = new web3.eth.Contract([ABI.write(methodAbi)], contractAddress)
            let method = contract.methods[methodAbi.name]
            return method(..._params).estimateGas({ from })
          },
          call: (from) => {
            let contract = new web3.eth.Contract([ABI.view(methodAbi)], contractAddress)
            let method = contract.methods[methodAbi.name]
            return method(..._params).call({ from })
          },
          data: () => {
            let contract = new web3.eth.Contract([ABI.write(methodAbi)], contractAddress)
            let tx_builder = contract.methods[methodAbi.name](..._params);
            return tx_builder.encodeABI(); 
          }
        }
      }
    }
  }
})
