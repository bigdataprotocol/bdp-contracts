const ethers = require('ethers')
const fs = require('fs')
const path = require('path')

var sleep = (t) => new Promise(r => setTimeout(r, t))
function encodeParameters(types, values) {
  const abi = new ethers.utils.AbiCoder();
  return abi.encode(types, values);
}

async function txParams(rpc, walletAddress, gasPrice, gasLimit) {
  var provider = new ethers.providers.JsonRpcProvider(rpc)
  var nonce = await provider.getTransactionCount(walletAddress)
  
  return {
    gasLimit: ethers.utils.hexlify(gasLimit),
    gasPrice: ethers.utils.hexlify(gasPrice),
    nonce: nonce
  }
}

async function contract(rpc, privateKey, gasPrice, gasLimit, contractAddress, contractName, ...constructorParams) {
  var provider = new ethers.providers.JsonRpcProvider(rpc)
  var wallet = new ethers.Wallet(privateKey, provider)
  var Contract = fs.readFileSync(path.join(__dirname, `../build/contracts/${contractName}.json`))
  Contract = JSON.parse(Contract)
  var factory = new ethers.ContractFactory(
    Contract.abi,
    Contract.bytecode,
    wallet
  )
  if (contractAddress) {
    return factory.attach(contractAddress)
  }
  else {
    const contract = await factory.deploy(
      ...constructorParams,
      await txParams(rpc, wallet.address, gasPrice, gasLimit))
    await contract.deployed()

    return contract
  }
}

function walletAddress(privateKey, rpc) {
  var provider = new ethers.providers.JsonRpcProvider(rpc)
  var wallet = new ethers.Wallet(privateKey, provider)

  return wallet.address
}

module.exports = {
  Contract: contract,
  txParams,
  sleep,
  encodeParameters,
  walletAddress
}