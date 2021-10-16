/*global chrome*/

export async function getActiveTabURL() {
  return new Promise((resolve, reject) => {
    chrome.tabs.getSelected(null, function(tab) {
          resolve(tab.url)
        });
  });
}

export function fillCredentials(url, username, password) {
  chrome.tabs.getSelected(null, function(tab) {
    if (url === tab.url) {
      chrome.tabs.executeScript(null, {code:`document.querySelector( 'input[name="username"]' ).value = '${username}'`});
      chrome.tabs.executeScript(null, {code:`document.querySelector( 'input[name="password"]' ).value = '${password}'`});
    }
    chrome.tabs.executeScript(null, {code:`document.querySelector( 'input[name="username"]' ).value = '${username}'`});
    chrome.tabs.executeScript(null, {code:`document.querySelector( 'input[name="email"]' ).value = '${username}'`});
    chrome.tabs.executeScript(null, {code:`document.querySelector( 'input[name="pass"]' ).value = '${password}'`});
    chrome.tabs.executeScript(null, {code:`document.querySelector( 'input[name="password"]' ).value = '${password}'`});
  });
}

export function inject() {
  chrome.tabs.getSelected(null, function(tab) {
    let tabUrl = tab.url;
    chrome.tabs.executeScript(null,{code:"document.querySelector( 'input[name=\"username\"]' ).value = 'testUser'"});

  });
}