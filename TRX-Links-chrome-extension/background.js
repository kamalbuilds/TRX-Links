chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'getBlock') {
    fetch(`https://api.trongrid.io/wallet/getblock?num=${request.blockID}`)
      .then(response => response.json())
      .then(data => sendResponse(data))
      .catch(error => sendResponse({ error: error.message }));
    return true;  // Will respond asynchronously
  } else if (request.action === 'sendTransaction') {
    fetch('https://api.trongrid.io/wallet/broadcasttransaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request.transaction),
    })
    .then(response => response.json())
    .then(result => sendResponse({ result }))
    .catch(error => sendResponse({ error: error.message }));
    return true;  // Will respond asynchronously
  }
});
