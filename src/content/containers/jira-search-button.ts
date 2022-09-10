import { html, unsafeCSS } from 'lit'
import { customElement, eventOptions, property } from 'lit/decorators.js'
import { MobxLitElement } from '@adobe/lit-mobx'

import tailwind from '../../styles/tailwind.css?inline'

import { IconSearch } from '../components/icons/icons'
import { jiraSearchModalStore } from './store'

@customElement('jira-search-button')
export class JiraSearchButton extends MobxLitElement {
  static styles = [unsafeCSS(tailwind)]

  store = jiraSearchModalStore

  @property({ type: Boolean })
  visible = true

  connectedCallback(): void {
    this.getStorage()
    chrome.storage.onChanged.addListener(this.setEnableSearchFeature.bind(this))
    super.connectedCallback()
  }

  disconnectedCallback(): void {
    chrome.storage.onChanged.removeListener(this.setEnableSearchFeature.bind(this))
    super.disconnectedCallback()
  }

  async getStorage(): Promise<void> {
    const enableSearchFeature = (await chrome.storage.local.get(['enableSearchFeature'])) ?? false
    this.visible = !!enableSearchFeature
  }

  async setEnableSearchFeature(changes: any, area: 'local' | 'sync') {
    if (area !== 'local') return
    if (!('enableSearchFeature' in changes)) return

    this.visible = changes.enableSearchFeature.newValue
  }

  render() {
    if (!this.visible) return html``
    return html`
      <button
        title="Jira Search"
        class="btn btn-primary btn-circle fixed bottom-4 right-4 z-[1000]"
        @click=${this.onClickSearchButton}
      >
        ${IconSearch}
      </button>
    `
  }

  @eventOptions({})
  onClickSearchButton(): void {
    this.store.toggle()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'jira-search-button': JiraSearchButton
  }
}
