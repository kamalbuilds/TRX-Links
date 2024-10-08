// Function to inject a script into the page context
function injectScript(code) {
  const script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.textContent = `
    ${code}
    
    // Add this to your injected script
    window.addEventListener('message', function(event) {
      if (event.source != window) return;
      if (event.data.type && event.data.type == 'FROM_PAGE') {
        chrome.runtime.sendMessage(event.data, function(response) {
          window.postMessage({ type: 'FROM_EXTENSION', data: response }, '*');
        });
      }
    }, false);

    // Helper function to convert TRX to SUN
    function toSun(trxAmount) {
      return (trxAmount * 1e6).toString();
    }


    // ... rest of your existing code ...
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