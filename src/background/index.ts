init()

function init(): void {
  addCommandListener()
}

function addCommandListener(): void {
  chrome.commands.onCommand.addListener((command: string) => {
    chrome.tabs.update({}, function(tab: any) {
      if (command !== 'search-jira-issues') return
      
      // chrome.tabs.update({pinned: !tab.pinned})
      chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: contentScriptFunc,
        args: ['action'],
      });
    })
  })
}

function contentScriptFunc(): void {
  document.querySelector('jira-search-modal')?.store.toggle()
}

export {}
