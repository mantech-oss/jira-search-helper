import { css, html, TemplateResult, unsafeCSS } from 'lit'
import { customElement, eventOptions, property, query } from 'lit/decorators.js'
import { MobxLitElement } from '@adobe/lit-mobx'

import tailwind from '../../styles/tailwind.css?inline'

import { jiraSearchModalStore, SearchResult } from './store'

import '../components/search-word/search-word.ts'
import { debounce } from '../utils/debounce'
import { parseCookie } from '../utils/parseCookie'
import { stripHTMLTags } from '../utils/stripHTMLTags'

@customElement('jira-search-modal')
export class JiraSearchModal extends MobxLitElement {
  static styles = [
    unsafeCSS(tailwind),
    css`
      .grid-cols-48px-auto {
        grid-template-columns: 48px auto;
      }
    `,
  ]

  store = jiraSearchModalStore

  private controller = new AbortController()

  @property({ type: Boolean })
  loading = false

  @query('.input-search') input!: HTMLInputElement

  render() {
    const { visible } = this.store

    this.updateComplete.then(() => {
      if (visible) {
        this.input.focus()
      }
    })

    if (visible === false) return html``
    return html`
      <input
        type="checkbox"
        id="searchModal"
        class="modal-toggle"
        ?checked=${visible}
        @change=${this.onChangeModalOpened}
      />
      <label data-theme="fantasy" for="searchModal" class="modal cursor-pointer">
        <label class="modal-box w-11/12 max-w-5xl">
          <label for="searchModal" class="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
          <h3 class="text-lg font-bold">${chrome.i18n.getMessage('APP_NAME')}</h3>
          <div part="search-box" class="py-4">
            <input
              type="text"
              part="search"
              placeholder="Search..."
              class="input-search input input-bordered w-full"
              @input=${debounce(this.onInputSearch, 250)}
              @keypress=${this.onInputPreventKeyEvent}
              @keydown=${this.onInputPreventKeyEvent}
              @keyup=${this.onInputPreventKeyEvent}
            />
          </div>
          <div part="search-result" class="overflow-x-auto">
            ${this.renderSearchResultTemplate()}
          </div>
        </label>
      </label>
    `
  }

  renderSearchResultTemplate(): TemplateResult {
    if (this.loading) return html`<progress class="progress w-full"></progress>`
    return html`
      <table class="table table-compact w-full table-fixed">
        <tbody>
          <!-- row 1 -->
          ${this.store.searchResult.map((item) => this.renderTableRowTemplate(item))}
        </tbody>
      </table>
    `
  }

  renderTableRowTemplate({
    key,
    title,
    issueIconUrl,
    searchText,
    href,
    previousWord,
    nextWord,
  }: SearchResult): TemplateResult {
    return html`
      <tr class="hover hover:cursor-pointer" @click=${() => location.replace(href)}>
        <td>
          <div class="grid items-center space-x-3 overflow-hidden grid-cols-48px-auto">
            <span class="avatar">
              <div class="mask mask-squircle w-12 h-12">
                <img src="${issueIconUrl}" alt="Avatar Tailwind CSS Component" />
              </div>
            </span>
            <span class="overflow-hidden">
              <div class="font-bold overflow-hidden text-ellipsis">
                <span>${key}</span>
                <span>${title}</span>
              </div>
              <div class="text-sm opacity-50 overflow-hidden text-ellipsis">
                <jira-search-word
                  .previousWord=${previousWord}
                  .word=${searchText}
                  .nextWord=${nextWord}
                ></jira-search-word>
              </div>
            </span>
          </div>
        </td>
      </tr>
    `
  }

  // Event Handlers

  @eventOptions({})
  onChangeModalOpened(event: Event): void {
    const input = event.target as HTMLInputElement

    if (input.checked === false) {
      this.store.close()
    }
  }

  @eventOptions({})
  async onInputSearch(event: Event): Promise<void> {
    event.preventDefault()
    event.stopImmediatePropagation()

    const input = this.input
    const searchText = input.value

    // 0글자 이하면 검색하지 않음
    if (searchText?.length <= 0) {
      this.store.clearSearchResult()
      return
    }

    await this.fetchSearchApi(searchText)
  }

  async fetchSearchApi(searchText: string): Promise<void> {
    try {
      document.body.appendChild(document.createElement('jira-loading'))
      const cookies = parseCookie(document.cookie)
      const atlToken = cookies['atlassian.xsrf.token']

      if (!atlToken) return

      this.controller.abort()
      this.controller = new AbortController()

      this.loading = true

      const response = await fetch(
        `https://${location.host}/sr/jira.issueviews:searchrequest-xml/temp/SearchRequest.xml?jqlQuery=(text+%7E+%22${searchText}%22+OR+comment+%7E+%22${searchText}%22)+AND++project+IN+%2812210%29&atl_token=${atlToken}&tempMax=20`,
        {
          method: 'GET',
          body: null,
          signal: this.controller.signal,
        },
      )
      const str = await response.text()
      const xml = new DOMParser().parseFromString(str, 'text/xml')
      const searchTextArray = searchText.split(/\s+/)
      searchText = searchTextArray[searchTextArray.length - 1]
      const searchResult: SearchResult[] = []

      xml.querySelectorAll('item').forEach((item) => {
        const description = stripHTMLTags(
          item.querySelector('description')?.textContent ?? '',
        ).replace(/\s\n/g, '')
        const comments = stripHTMLTags(item.querySelector('comments')?.textContent ?? '').replace(
          /\s\n/g,
          '',
        )
        const searchTextLength = searchText.length

        let previousWord = ''
        let nextWord = ''
        let commentsIndex = -1
        let WORD_GRP = 30
        const descriptionIndex = description.toLowerCase().indexOf(searchText.toLowerCase())

        if (descriptionIndex === -1) {
          commentsIndex = comments.toLowerCase().indexOf(searchText.toLowerCase())

          if (commentsIndex !== -1) {
            previousWord = comments.substring(commentsIndex - WORD_GRP, commentsIndex)
            nextWord = comments.substring(
              commentsIndex + searchTextLength,
              commentsIndex + searchTextLength + WORD_GRP,
            )
          }
        } else {
          previousWord = description.substring(descriptionIndex - WORD_GRP, descriptionIndex)
          nextWord = description.substring(
            descriptionIndex + searchTextLength,
            descriptionIndex + searchTextLength + WORD_GRP,
          )
        }

        searchResult.push({
          title: item.querySelector('summary')?.textContent ?? '',
          href: item.querySelector('link')?.textContent ?? '',
          key: item.querySelector('key')?.textContent ?? '',
          issueIconUrl: item.querySelector('type')?.getAttribute('iconUrl') ?? '',
          previousWord,
          searchText: descriptionIndex !== -1 || commentsIndex !== -1 ? searchText : '',
          nextWord,
        })
      })
      this.store.setSearchResult(searchResult)
      this.loading = false
    } catch (error) {
      this.loading = false
      console.error(error)
    }
  }

  // Prevent Jira Hotkey
  @eventOptions({})
  onInputPreventKeyEvent(event: KeyboardEvent): void {
    event.stopImmediatePropagation()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'jira-search-modal': JiraSearchModal
  }
}
