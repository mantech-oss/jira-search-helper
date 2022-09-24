import { html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { BaseComponent } from '../../../common/baseComponent'


@customElement('jira-search-word')
export class JiraSearchWord extends BaseComponent {
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
