const Web3 = require('web3')
const config = require('./config')
const web3 = new Web3(config.RPC)

module.exports = async function(txHash) {
  var [tx, receipt] = await Promise.all([
    web3.eth.getTransaction(txHash),
    web3.eth.getTransactionReceipt(txHash)
  ])

  if (tx) {
    return {
      ...tx,
      status: receipt.status,
      logs: receipt.logs,
      gasUsed: receipt.gasUsed,
    }
  }
  else {
    return null
  }
}