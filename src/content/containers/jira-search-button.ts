import { html, unsafeCSS } from 'lit'
import { customElement, eventOptions } from 'lit/decorators.js'
import { MobxLitElement } from '@adobe/lit-mobx'

import tailwind from '../../styles/tailwind.css?inline'

import { IconSearch } from '../components/icons/icons'
import { jiraSearchModalStore } from './store'

@customElement('jira-search-button')
export class JiraSearchButton extends MobxLitElement {
  static styles = [unsafeCSS(tailwind)]

  store = jiraSearchModalStore

  render() {
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
