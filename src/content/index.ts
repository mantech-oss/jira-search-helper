import './components/loading/loading'
import './containers/jira-search-button'
import './containers/jira-search-modal'

init()

function init(): void {
  addSearchButtonAndModal()
}

function addSearchButtonAndModal(): void {
  const searchButton = document.createElement('jira-search-button')
  const searchModal = document.createElement('jira-search-modal')

  document.body.appendChild(searchButton)
  document.body.appendChild(searchModal)
}

export {}
