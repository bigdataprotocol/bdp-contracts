const Web3 = require('web3')
const BigNumber = require('bignumber.js')
const contract = require('./contract')
const config = require('./config')
const web3 = new Web3(config.RPC)
const abi = require('./abi')

module.exports = async function (address, tokenAddress, isRaw = true) {
  if (isRaw) {
    if (tokenAddress) {
      var balance = await contract(tokenAddress, abi.TRC20)
          .methods('balanceOf')
          .params(address)
          .call()
  
      return BigNumber(balance)
    }
    else {
      var v = await web3.eth.getBalance(address)
      return BigNumber(v)
    }
  }
  else {
    if (tokenAddress) {
      var [balance, decimals] = await Promise.all([
        contract(tokenAddress, abi.TRC20)
          .methods('balanceOf')
          .params(address)
          .call(), 
        contract(tokenAddress, abi.TRC20)
          .methods('decimals')
          .params()
          .call(), 
        ])
  
      return BigNumber(balance).dividedBy(10 ** decimals).toNumber() 
    }
    else {
      var v = await web3.eth.getBalance(address)
      return BigNumber(v).dividedBy(10 ** 18).toNumber()
    }
  }
}