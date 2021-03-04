
## Development

### Install Dependencies

```bash
yarn
```

### Truffle config
```bash
    module.exports = {
    networks: {
        dev: {
        host: "localhost",
        port: 7545,
        network_id: "*", // Match any network id
        gas: 8000000
        }
    },
    compilers: {
        solc: {
        version: "0.6.12",
        settings: {
            optimizer: {
            enabled: true,
            runs: 200
            }
        }
        }
    }
    };
```
### Compile Contracts

```bash
truffle compile
```

### Run Tests

```bash
truffle test ./test/bAlphaMaster.test.js --network dev
```
### Deployment

```bash
bAlphaToken:
    Call setMaster function to set Master address after deployed bAlphaMaster contract
```

```bash
bAlphaMaster:
    _bAlpha: bAlphaToken address
    _rewardPerBlock: 15122370739158480 (18000 token in total / 12 weeks. REWARD_MULTIPLIER = [688, 413, 310, 232, 209, 188, 169, 152, 137, 123, 111, 100])
    _startBlock: 
    _halvingAfterBlock: 42000 (block per week)
```

```bash
BDPToken:
    _startAtBlock:
    _numberBlockPerDay: 6000
    Call setMaster function to set Master address after deployed BDPMaster contract
```

```bash
BDPMaster:
    _BDP: BDPToken address
    _rewardPerBlock: 666e18 (4mil token/day, 6000 block/day. (24mil / 6days) / 6000)
    _startBlock: 
```