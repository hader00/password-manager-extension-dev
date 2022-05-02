/*global chrome*/

export async function getActiveTabURL() {
  return new Promise( (resolve, reject) => {
      chrome.tabs.query({active: true, currentWindow: true }, tabs => {
          let url = tabs[0].url;
          resolve(url)
      });
  });
}

export function openTab(url) {
    chrome.tabs.create({'url': url})
}

export function fillCredentials(url, username, password) {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        let tab = tabs[0];
        chrome.scripting.executeScript(
            {
                target: { tabId: tab.id, allFrames: true },
                func: (uname, pass) => {
                    const nameSelectors = ['name="email"', 'name="username"', 'type="email"', 'placeholder="Jméno"',
                        'name="LDAPlogin"','autocomplete="username"']
                    const passSelectors = ['name="pass"', 'name="password"', 'type="password"']
                    nameSelectors.forEach(nameSelector => {
                        let selected = document.querySelector( `input[${nameSelector}]` )
                        if (selected !== null) {
                            selected.value = uname
                        }
                    })
                    passSelectors.forEach(passSelector => {
                        let selected = document.querySelector( `input[${passSelector}]` )
                        if (selected !== null) {
                            selected.value = pass
                        }
                    })
                },
                args: [username, password]
            });
    });
}
