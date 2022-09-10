init()

function init(): void {
  addCommandListener()
}

function addCommandListener(): void {
  chrome.commands.onCommand.addListener((command: string) => {
    chrome.tabs.update({}, function (tab: any) {
      if (command === 'search-jira-issues') {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: contentScriptFunc,
          args: ['action'],
        })
      }
    })
  })
}

async function contentScriptFunc(): Promise<void> {
  const { enableSearchFeature } = await chrome.storage.local.get([`enableSearchFeature`])
  if (!enableSearchFeature) return
  document.querySelector('jira-search-modal')?.store.toggle()
}

export {}
