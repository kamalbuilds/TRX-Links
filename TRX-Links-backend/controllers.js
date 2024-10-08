const pinataSdk = require('@pinata/sdk') // pinata for storing 
require('dotenv').config({ path: __dirname + '/.env' })

const pinata = new pinataSdk(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY)

async function test(req, res, next) {
  console.log(process.env.PINATA_API_KEY)
  console.log(await pinata.testAuthentication())
  res.send('Lets gooo and Build TRX-Links')
  next()
}

async function publishToIPFS(iframe) {
  try {
    const ipfsFile = await pinata.pinJSONToIPFS({ iframe })
    console.log(ipfsFile.IpfsHash)
    return ipfsFile.IpfsHash
  } catch (error) {
    console.log(error)
  }
}

const makeid = () => {
  return Math.floor(Math.random() * 100000000)
}

async function storeToIpfsviapinata(req, res, next) {
  const iframe = req.body
  try {
    const ipfsFile = await pinata.pinJSONToIPFS(iframe)
    console.log(ipfsFile.IpfsHash)
    res.send(ipfsFile.IpfsHash)
  } catch (error) {
    console.log(error)
    res.send('Error')
  }
  next()
}

async function generateTRONTransferlink(req, res, next) {
  const id = makeid();
  const iframe = {
    html: `
    <h1>Send TRX</h1>
    <p>Send 1 TRX to the following address:</p>
    <input placeholder="Type the address..." value="TSJYQL5vd1kGQu3Aedtkfug2UzCdAqN5mt" type="text" id="input${id}">
    <button id="dugme${id}">Send TRX</button>`,
    js: `
      async function showAlert() {
          const recipient = document.getElementById("input${id}").value;
          if (typeof window.tronLink !== 'undefined') {
              try {
                  await tronLink.request({ method: 'tron_requestAccounts' });
                  const publicKey = window.tronWeb.defaultAddress.base58;

                  // Specify the amount of TRX to send (in SUN)
                  const amount = tronWeb.toSun(1); // Convert TRX to SUN (1 TRX = 1e6 SUN)

                  // Build the transaction
                  const transaction = await tronWeb.transactionBuilder.sendTrx(recipient, amount, publicKey);

                  // Sign the transaction
                  const signedTransaction = await tronWeb.trx.sign(transaction);

                  // Broadcast the transaction
                  const result = await tronWeb.trx.sendRawTransaction(signedTransaction);

                  if (result.result) {
                      alert(\`Transaction Sent! Hash: \${result.txid}\`);
                      
                      // Check the transaction status
                      const checkTransactionStatus = async (hash) => {
                          const receipt = await tronWeb.trx.getTransactionInfo(hash);
                          if (receipt && receipt.blockNumber) {
                              alert('Transaction Completed!');
                          } else {
                              setTimeout(() => checkTransactionStatus(hash), 1000);
                          }
                      };
                      checkTransactionStatus(result.txid);
                  } else {
                      throw new Error('Transaction failed');
                  }
              } catch (error) {
                  alert(\`Error: \${error.message}\`);
              }
          } else {
              alert('TronLink is not installed');
          }
      }
      document.getElementById('dugme${id}').addEventListener('click', showAlert);
      `,
  };

  // 2) Store the HTML on IPFS
  let cid;
  try {
    cid = await publishToIPFS(iframe);
    console.log(`Transfer Tron-Link published to IPFS with CID: ${cid}`);
  } catch (error) {
    console.log(error);
  }

  // 3) Send the IPFS link to the user
  const ipfsLink = `https://gateway.ipfs.io/ipfs/${cid}`;
  res.send('Transfer Tron-Link generated. Check it out at: ' + ipfsLink);

  next();
}


async function generateTRX20Transferlink(req, res, next) {
  // 1) Generate HTML for Transfer Tron-Link of TRX-20
  const iframe = {
    html: `
      <style>
      #naslovce {
          color: #FF0000;
      }
      </style>
      <h1 id="naslovce">Send TRX-20 Token</h1><p>Send tokens to the following address:</p>
      <input placeholder="Type the address..." value="0xdFB4fbbaf602C76E5B30d0E97F01654D71F23e54" type="text" id="inputAddress">
      <input placeholder="Type the token amount..." type="number" id="inputAmount">
      <button id="dugme">Send Token</button>`,
    js: `
        console.log('TRX-20 Token Transfer');
        async function showAlert() {
          const recipient = document.getElementById("inputAddress").value;
          const amount = document.getElementById("inputAmount").value;
          const tokenAddress = ""; // should be TRX-20 Address
          const decimals = 18;
          if (typeof window.ethereum !== 'undefined'  ) {
              try {
                  const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
                  const publicKey = accounts[0];
                  const amountToSend = (amount * Math.pow(10, decimals)).toString(16);
                  console.log(amountToSend);
                  const data = "0xa9059cbb" + recipient.substring(2).padStart(64, '0') + amountToSend.padStart(64, '0');
                  const transactionParameters = {
                      to: tokenAddress,
                      from: publicKey,
                      data: data,
                  };
                  console.log(transactionParameters);
                  const txHash = await ethereum.request({
                      method: 'eth_sendTransaction',
                      params: [transactionParameters],
                  });
                  alert(\`Transaction Sent! Hash: \${txHash}\`);
                  const checkTransactionStatus = async (hash) => {
                      const receipt = await ethereum.request({
                          method: 'eth_getTransactionReceipt',
                          params: [hash],
                      });
                      if (receipt && receipt.blockNumber) {
                          alert('Transaction Completed!');
                      } else {
                          setTimeout(() => checkTransactionStatus(hash), 1000);
                      }
                  };
                  checkTransactionStatus(txHash);
              } catch (error) {
                  alert(\`Error: \${error.message}\`);
              }
          } else {
              alert('MetaMask is not installed');
          }
        }
        document.getElementById('dugme').addEventListener('click', showAlert);
`,
  }

  // 2) Store the HTML on IPFS 
  let cid
  try {
    cid = await publishToIPFS(iframe)
    console.log(`TRX 20 Transfer Tron-Link published to IPFS with CID: ${cid}`)
  } catch (error) {
    console.log(error)
  }
}


module.exports = { test, generateTRONTransferlink, generateTRX20Transferlink, storeToIpfsviapinata }
