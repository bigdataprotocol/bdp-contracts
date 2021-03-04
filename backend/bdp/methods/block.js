const Web3 = require('web3')
const config = require('./config')
const web3 = new Web3(config.RPC)


module.exports = function(blockNumber, numberOnly) {
  if (blockNumber == -1) {
    if (numberOnly) {
      return web3.eth.getBlockNumber()
    }
    else {
      return web3.eth.getBlock('latest')
    }
  }
  else {
    return web3.eth.getBlock(blockNumber)
  }
}