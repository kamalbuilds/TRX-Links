// Function to inject a script into the page context
function injectScript(code) {
  const script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.textContent = `
    // Simplified TronLink adapter
    class TronLinkAdapter {
      constructor() {
        this.address = null;
        this.tronWeb = null;
      }

      async connect() {
        try {
          // Wait for tronWeb to be ready
          // await this.waitForTronWeb();
          
          // Request account access
          if (window.tronLink) {
            await window.tronLink.request({ method: 'tron_requestAccounts' });
          } else {
            throw new Error('TronLink not found. Please install TronLink extension.');
          }
          
          if (!window.tronWeb) {
            throw new Error('TronWeb not found after TronLink connection.');
          }

          this.tronWeb = window.tronWeb;

          return this.address;
        } catch (error) {
          console.error('Connection error:', error);
          throw error;
        }
      }


      async signTransaction(transaction) {
        if (!this.tronWeb) {
          throw new Error('TronWeb is not available');
        }
        return await this.tronWeb.trx.sign(transaction);
      }
    }

    const adapter = new TronLinkAdapter();

    async function connectWallet() {
      try {
        const address = await adapter.connect();
        console.log('Connected successfully: ', address);
        return address;
      } catch (error) {
        console.error('Connection error:', error);
        throw error;
      }
    }

    async function signAndSendTransaction(toAddress, amount) {
      if (!adapter.address) {
        await connectWallet();
      }

      console.log(adapter.address,"address",adapter);
      
      const tronWeb = adapter.tronWeb;
      if (!tronWeb) {
        throw new Error('TronWeb is not available');
      }

      console.log(tronWeb.transactionBuilder,"transactionBuilder");
      const transaction = await tronWeb.transactionBuilder.sendTrx(toAddress, tronWeb.toSun(amount), adapter.address);
      const signedTransaction = await adapter.signTransaction(transaction);
      const res = await tronWeb.trx.sendRawTransaction(signedTransaction);
      console.log('Transaction sent successfully:', res);
      return res;
    }

    // Helper function to convert TRX to SUN
    function toSun(trxAmount) {
      if (!adapter.tronWeb) {
        throw new Error('TronWeb is not available');
      }
      return adapter.tronWeb.toSun(trxAmount);
    }

    ${code}

    async function sendDonation(amount) {
      const recipient = 'TSJYQL5vd1kGQu3Aedtkfug2UzCdAqN5mt'; // Replace with actual recipient address
      try {
        const result = await signAndSendTransaction(recipient, amount);
        if (result.result) {
          console.log('Donation successful:', result.txid);
          showSuccess();
        } else {
          throw new Error('Transaction failed');
        }
      } catch (error) {
        console.error('Donation error:', error);
        alert('Donation failed: ' + error.message);
      }
    }

    function showSuccess() {
      alert('Donation successful!');
    }

    // Use MutationObserver to watch for the donate button
    const observer = new MutationObserver((mutations, obs) => {
      const donateButton = document.getElementById('donateButton');
      if (donateButton) {
        donateButton.addEventListener('click', async () => {
          const amountInput = document.getElementById('donationAmount');
          if (!amountInput) {
            console.error('Donation amount input not found');
            return;
          }
          const amount = amountInput.value;
          if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid donation amount.');
            return;
          }
          await sendDonation(amount);
        });
        obs.disconnect(); // Stop observing once we've added the event listener
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  `;
  (document.head || document.documentElement).appendChild(script);
  script.onload = function () {
    script.remove();
  };
}

const makeid = () => {
  return Math.floor(Math.random() * 100000000)
}

function updateIds(htmlString, number) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;

  const elementsWithId = tempDiv.querySelectorAll('[id]');
  elementsWithId.forEach(element => {
    element.id += number;
  });

  const styleTags = tempDiv.querySelectorAll('style');
  styleTags.forEach(styleTag => {
    styleTag.innerHTML = styleTag.innerHTML.replace(/#(\w+)\s*\{/g, (match, id) => {
      return `#${id}${number}{`;
    });
  });

  return tempDiv.innerHTML;
}

function updateIdsInJsCode(jsCode, number) {
  return jsCode.replace(/getElementById\s*\(\s*(['"`])(\w+)\1\s*\)/g, (match, quote, id) => {
    return `getElementById(${quote}${id}${number}${quote})`;
  });
}

async function replacetronlinkTags() {
  // Find all span elements containing <tronlink ... tronlink> or &lt;tronlink ... tronlink&gt;
  const spans = document.querySelectorAll('span');

  const fetchPromises = [];
  spans.forEach(span => {
    const tronlinkRegex = /(&lt;|<)tronlink\s*(.*?)\s*tronlink(&gt;|>)/g;
    let match;
    while ((match = tronlinkRegex.exec(span.innerHTML)) !== null) {
      let url = null;
      const match2 = match;
      const url1 = match[2].trim();

      if (url1.startsWith("http"))
        url = url1;
      else if (url1.startsWith("ipfs://")) {
        url = `https://violet-neighbouring-dolphin-205.mypinata.cloud/ipfs/${url1.substring("ipfs://".length)}?pinataGatewayToken=ztPLlTU-2XHlGq-MJX-o0DNbovxKXA1cefaOuzTdLKt9gbb7PHqdIxJ1k_FzjGKD`;
      }

      console.log(`Fetching URL: ${url}`);  // Debugging information
      if (!url)
        continue;

      fetchPromises.push(
        fetch(url)
          .then(response => {
            if (response.ok) {
              return response.json().then(result => {
                const { html, js } = result.iframe;
                return { span, match: match2, htmlText: html, jsCode: js };
              });
            } else {
              console.error(`Failed to fetch ${url}: ${response.statusText}`);
              return null;
            }
          })
          .catch(error => {
            console.error(`Error fetching ${url}:`, error);
            return null;
          })
      );
    }
  });

  const results = await Promise.all(fetchPromises);

  results.forEach(result => {
    if (result) {
      const randomNumber = makeid();
      const newHtml = updateIds(result.htmlText, randomNumber);

      // Replace only the matched content within the span
      const spanHtml = result.span.innerHTML;
      console.log(spanHtml);
      console.log(result);
      console.log(result.match);
      console.log(spanHtml.replace(result.match[0], newHtml))
      result.span.innerHTML = spanHtml.replace(result.match[0], newHtml);

      setTimeout(() => {
        const newJS = updateIdsInJsCode(result.jsCode, randomNumber);
        injectScript(newJS);
      }, 500);
    }
  });
}

// Modify this part
(function () {
  const script = document.createElement('script');
  script.textContent = `
    // Replace direct API calls with postMessage
    window.tronWeb = {
      trx: {
        getBlock: function(blockID) {
          return new Promise((resolve, reject) => {
            window.postMessage({ type: 'FROM_PAGE', action: 'getBlock', blockID: blockID }, '*');
            window.addEventListener('message', function listener(event) {
              if (event.source != window) return;
              if (event.data.type && event.data.type == 'FROM_EXTENSION') {
                window.removeEventListener('message', listener);
                resolve(event.data.data);
              }
            });
          });
        }
      }
    };
  `;
  document.head.appendChild(script);
})();

// Run the function every 1 second
setInterval(replacetronlinkTags, 1000);