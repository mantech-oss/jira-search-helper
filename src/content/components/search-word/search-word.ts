import { html, LitElement, unsafeCSS } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import tailwind from '../../../styles/tailwind.css?inline'

@customElement('jira-search-word')
export class JiraSearchWord extends LitElement {
  static styles = [unsafeCSS(tailwind)]

  @property({ type: String })
  previousWord = ''

  @property({ type: String })
  word = ''

  @property({ type: String })
  nextWord = ''

  get previousWordString(): string {
    if (this.word.length === 0) return chrome.i18n.getMessage('NO_SEARCH')
    return this.previousWord
  }

  get nextWordString(): string {
    if (this.word.length === 0) return ''
    return this.nextWord
  }

  render() {
    const { previousWordString, word, nextWordString } = this
    return html`
      ${previousWordString}
      <strong class="text-bold text-lg underline decoration-dotted">${word}</strong>
      ${nextWordString}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'jira-search-word': JiraSearchWord
  }
}
