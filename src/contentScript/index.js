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
      chrome.tabs.executeScript(null, {code:`document.querySelector( 'input[name="username"]' ).value = '${username}'`});
      chrome.tabs.executeScript(null, {code:`document.querySelector( 'input[name="email"]' ).value = '${username}'`});
      chrome.tabs.executeScript(null, {code:`document.querySelector( 'input[type="email"]' ).value = '${username}'`});
      chrome.tabs.executeScript(null, {code:`document.querySelector( 'input[name="identifier"]' ).value = '${username}'`});
      chrome.tabs.executeScript(null, {code:`document.querySelector( 'input[placeholder="Jméno"]' ).value = '${username}'`});
      chrome.tabs.executeScript(null, {code:`document.querySelector( 'input[name="LDAPlogin"]' ).value = '${username}'`});
      chrome.tabs.executeScript(null, {code:`document.querySelector( 'input[autocomplete="username"]' ).value = '${username}'`});
      chrome.tabs.executeScript(null, {code:`document.querySelector( 'input[name="pass"]' ).value = '${password}'`});
      chrome.tabs.executeScript(null, {code:`document.querySelector( 'input[name="password"]' ).value = '${password}'`});
      chrome.tabs.executeScript(null, {code:`document.querySelector( 'input[type="password"]' ).value = '${password}'`});
  });
}