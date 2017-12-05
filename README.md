# Generate test wallet

https://runkit.com/npm/bitcoinjs-lib

```
var bitcoin = require('bitcoinjs-lib');

const testnet = bitcoin.networks.testnet
const keypair = bitcoin.ECPair.makeRandom({ network: testnet })
const address = keypair.getAddress()
const wif = keypair.toWIF()

console.log('Public Address')
console.log(address)

console.log('WIF')
console.log(wif)
```

# TestNet Sandbox

https://testnet.manu.backend.hamburg/faucet

# Fetch transaction appended data

`https://api.blockcypher.com/v1/btc/test3/txs/$TXID?limit=50&includeHex=true`

e.g.https://api.blockcypher.com/v1/btc/test3/txs/95abf14fcd642701769afe03fe57fcd35e6eb79388bfd1f2c2d21a8b5823b53b?limit=50&includeHex=true

# Test Data

curl https://api.blockcypher.com/v1/btc/test3/txs/95abf14fcd642701769afe03fe57fcd35e6eb79388bfd1f2c2d21a8b5823b53b?limit=50&includeHex=true | jq .txs[0].outputs[0].data_hex
