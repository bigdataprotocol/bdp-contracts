require('dotenv').config()

const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser')
const Web3 = require('web3')
const web3 = new Web3('https://rpc.tomochain.com')
const fs = require('fs')

const app = express();
const http = require('http').createServer(app);

app.use(bodyParser.json())
app.use(compression());

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, PATCH, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type, Accept')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

app.use(require('./bdp'))

http.listen(process.env.PORT || 8020, async (err) => {
  if (err) {
    console.log(err)
  }
  console.log('server started', process.env.PORT || 8020)
});