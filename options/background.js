chrome.runtime.onInstalled.addListener((details) => {
  chrome.storage.sync.set({'customprimary': 'default'});
  chrome.storage.sync.set({'customsecondary': 'default'});
  chrome.storage.sync.set({'customsidebar': 'default'});

  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({
      url: chrome.runtime.getURL("options/options.html")
    });
  }
});