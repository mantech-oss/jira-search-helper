import { css, html, TemplateResult, unsafeCSS } from 'lit'
import { customElement, eventOptions, query } from 'lit/decorators.js'
import { MobxLitElement } from '@adobe/lit-mobx'

import tailwind from '../../styles/tailwind.css?inline'

import { jiraSearchModalStore, SearchResult } from './store'

import '../components/search-word/search-word.ts'
import '../components/selects/select'
import { debounce } from '../utils/debounce'

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

  @query('.input-search') input!: HTMLInputElement

  private searchText = ''

  render() {
    const { visible, projectDisplayName, searchResultCount, selectedProjectDisplayName } =
      this.store

    this.focusSearchInput(visible)

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
        <label class="modal-box w-11/12 max-w-5xl overflow-visible">
          <label for="searchModal" class="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
          <div class="modal-title flex flex-row items-center">
            <h3 class="text-lg font-bold mr-4">${chrome.i18n.getMessage('APP_NAME')}</h3>

            <jira-select
              class="w-48 mr-auto max-w-xs"
              .title=${chrome.i18n.getMessage('PROJECT_LABEL')}
              .useSearch=${true}
              .items=${projectDisplayName}
              .selectedItemText=${selectedProjectDisplayName}
              @select-item=${this.onInputProject}
              @keypress=${this.onInputPreventKeyEvent}
              @keydown=${this.onInputPreventKeyEvent}
              @keyup=${this.onInputPreventKeyEvent}
            ></jira-select>

            <label class="label ml-auto">
              <span class="label-text">${chrome.i18n.getMessage('TOTAL')}</span>
            </label>
            <select
              class="select select-ghost select-sm w-32 focus:outline-none"
              @input=${this.onInputSearchResultCount}
            >
              <option value="10" ?selected=${searchResultCount === 10}>10 (fast)</option>
              <option value="20" ?selected=${searchResultCount === 20}>20 (default)</option>
              <option value="50" ?selected=${searchResultCount === 50}>50</option>
              <option value="100" ?selected=${searchResultCount === 100}>100</option>
              <option value="500" ?selected=${searchResultCount === 500}>500 (slow)</option>
            </select>
          </div>
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
          <div part="search-result" class="overflow-x-auto overflow-y-scroll max-h-[70vh]">
            ${this.renderSearchResultTemplate()}
          </div>
        </label>
      </label>
    `
  }

  private focusSearchInput(visible: boolean) {
    this.updateComplete.then(() => {
      if (visible) {
        this.input.focus()
      }
    })
  }

  renderSearchResultTemplate(): TemplateResult {
    if (this.store.loading) return html`<progress class="progress w-full"></progress>`
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

  // Lifecycle

  connectedCallback(): void {
    this.store.getProjectList()
    super.connectedCallback()
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
    if (!input) return
    const searchText = input.value
    this.searchText = searchText

    // If the letter is less than 0, no search
    if (searchText?.length <= 0) {
      this.store.clearSearchResult()
      return
    }

    await this.store.fetchSearchApi(searchText)
  }

  // Prevent Jira Hotkey
  @eventOptions({})
  onInputPreventKeyEvent(event: KeyboardEvent): void {
    event.stopImmediatePropagation()

    if (event.key === 'Escape') {
      this.store.close()
      return
    }
  }

  @eventOptions({})
  onInputProject(event: CustomEvent): void {
    const detail = event.detail

    this.store.selectProject(this.store.projects[detail.index])
    this.store.fetchSearchApi(this.searchText)
  }

  @eventOptions({})
  async onInputSearchResultCount(event: Event): Promise<void> {
    const input = event.target as HTMLSelectElement
    const value = parseInt(input.value)

    await this.store.setSearchResultCount(value)
    this.store.fetchSearchApi(this.searchText)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'jira-search-modal': JiraSearchModal
  }
}
