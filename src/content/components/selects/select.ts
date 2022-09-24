import { html, TemplateResult, CSSResult, unsafeCSS } from 'lit'
import { BaseComponent } from '../../../common/baseComponent'
import { customElement, eventOptions, property, query } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js'

import PrimerColors2CSS from '@primer/css/color-modes/themes/light.scss'
import PrimerCoreCSS from '@primer/css/core/index.scss'
import PrimerProductCSS from '@primer/css/product/index.scss'
// import PrimerMarketingCSS from '@primer/css/marketing/index.scss'
import Style from './select.scss'

@customElement('jira-select')
export default class JiraSelect extends BaseComponent {
  static get styles(): CSSResult[] {
    return [
      unsafeCSS(PrimerColors2CSS),
      unsafeCSS(PrimerCoreCSS),
      unsafeCSS(PrimerProductCSS),
      unsafeCSS(Style),
    ]
  }

  @property({ type: Boolean })
  loading = false

  @property()
  title = `Title`

  @property()
  searchText = ``

  @property({ type: Array })
  items = [`Item 1`, `Item 2`, `Item 3`]

  @property()
  selectedItemText = ``

  @property()
  searchPlaceHolder = `Search`

  @property({ type: Boolean })
  useSearch = false

  @property()
  position: `LEFT` | `RIGHT` = `LEFT`

  @property({ type: Boolean })
  displayHeader = true

  @property({ type: Boolean })
  displayFooter = true

  @property()
  type: `SELECT` | `NAVIGATION` = `SELECT`

  @property({ type: Boolean })
  open = false

  @property()
  toggleName = ''

  @property({ type: Boolean })
  toggle = false

  get selectProjectIndex(): number {
    return this.items.findIndex((each) => each === this.selectedItemText)
  }

  // # Query

  @query('details')
  detailElement!: HTMLDetailsElement

  // # Render

  protected render(): TemplateResult {
    const searchItems = this.items.filter((each) => {
      if (typeof each !== `string`) return false
      return each.toLowerCase().includes(this.searchText.toLowerCase())
    })

    return html`
      <details class="details-reset details-overlay" @toggle=${this.onOpenDetails}>
        <summary class="btn" aria-haspopup="true">
          <span part="title"> ${this.title} </span>
          <span part="select-value">${this.selectedItemText}</span>
        </summary>
        <div
          class="SelectMenu SelectMenu--hasFilter"
          style=${styleMap({
            right: this.position === `LEFT` ? `auto` : `1rem`,
          })}
        >
          <div class="SelectMenu-modal">
            <header
              class="SelectMenu-header"
              style=${styleMap({
                display: this.displayHeader ? `flex` : `none`,
              })}
            >
              <h3 class="SelectMenu-title">${this.title}</h3>
              <button class="SelectMenu-closeButton" type="button" @click=${this.close}>
                <!-- <%= octicon "x" %> -->
                <svg
                  class="octicon octicon-x"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  width="16"
                  height="16"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M3.72 3.72C3.86062 3.57955 4.05125 3.50066 4.25 3.50066C4.44875 3.50066 4.63937 3.57955 4.78 3.72L8 6.94L11.22 3.72C11.2887 3.64631 11.3715 3.58721 11.4635 3.54622C11.5555 3.50523 11.6548 3.48319 11.7555 3.48141C11.8562 3.47963 11.9562 3.49816 12.0496 3.53588C12.143 3.5736 12.2278 3.62974 12.299 3.70096C12.3703 3.77218 12.4264 3.85702 12.4641 3.9504C12.5018 4.04379 12.5204 4.14382 12.5186 4.24452C12.5168 4.34523 12.4948 4.44454 12.4538 4.53654C12.4128 4.62854 12.3537 4.71134 12.28 4.78L9.06 8L12.28 11.22C12.3537 11.2887 12.4128 11.3715 12.4538 11.4635C12.4948 11.5555 12.5168 11.6548 12.5186 11.7555C12.5204 11.8562 12.5018 11.9562 12.4641 12.0496C12.4264 12.143 12.3703 12.2278 12.299 12.299C12.2278 12.3703 12.143 12.4264 12.0496 12.4641C11.9562 12.5018 11.8562 12.5204 11.7555 12.5186C11.6548 12.5168 11.5555 12.4948 11.4635 12.4538C11.3715 12.4128 11.2887 12.3537 11.22 12.28L8 9.06L4.78 12.28C4.63782 12.4125 4.44977 12.4846 4.25547 12.4812C4.06117 12.4777 3.87579 12.399 3.73837 12.2616C3.60096 12.1242 3.52225 11.9388 3.51882 11.7445C3.51539 11.5502 3.58752 11.3622 3.72 11.22L6.94 8L3.72 4.78C3.57955 4.63938 3.50066 4.44875 3.50066 4.25C3.50066 4.05125 3.57955 3.86063 3.72 3.72Z"
                  ></path>
                </svg>
              </button>
            </header>
            <!--  -->
            ${this.renderToggleTemplate()}
            <!--  -->
            ${this.renderSearchTemplate()}
            <!--  -->
            ${this.renderContentTemplate(searchItems)}
            <!--  -->
            ${this.footerTemplate(searchItems)}
          </div>
        </div>
      </details>
    `
  }

  renderCheckBoxTemplate(str: string): TemplateResult {
    if (this.type !== `SELECT`) return html``
    if (str !== this.selectedItemText) return html``
    return html`
      <svg
        class="SelectMenu-icon SelectMenu-icon--check octicon octicon-check"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        width="16"
        height="16"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M13.78 4.22C13.9204 4.36062 13.9993 4.55125 13.9993 4.75C13.9993 4.94875 13.9204 5.13937 13.78 5.28L6.53 12.53C6.38937 12.6704 6.19875 12.7493 6 12.7493C5.80125 12.7493 5.61062 12.6704 5.47 12.53L2.22 9.28C2.08752 9.13782 2.0154 8.94978 2.01882 8.75547C2.02225 8.56117 2.10096 8.37579 2.23838 8.23837C2.37579 8.10096 2.56118 8.02225 2.75548 8.01882C2.94978 8.01539 3.13782 8.08752 3.28 8.22L6 10.94L12.72 4.22C12.8606 4.07955 13.0512 4.00066 13.25 4.00066C13.4487 4.00066 13.6394 4.07955 13.78 4.22Z"
        ></path>
      </svg>
    `
  }

  renderToggleTemplate(): TemplateResult {
    if (!this.toggleName) return html``
    return html`
      <div class="toggle-box">
        <div class="toggle-name">${this.toggleName}</div>
        <div class="toggle ${this.toggle ? 'on' : ''}" @click=${this.onClickToggle}>
          ${this.toggle ? 'ON' : 'OFF'}
        </div>
      </div>
    `
  }

  renderSearchTemplate(): TemplateResult {
    if (!this.useSearch) return html``
    return html`
      <form class="SelectMenu-filter">
        <input
          class="SelectMenu-input form-control"
          type="text"
          placeholder="${this.searchPlaceHolder}"
          aria-label="Search"
          @keyup=${this.onSearchText}
          @keypress=${this.preventEnter}
        />
      </form>
    `
  }

  renderContentTemplate(searchItems: string[]): TemplateResult {
    if (this.loading) {
      return html` <div part="loading">Loading...</div> `
    }
    return html`
      <div class="SelectMenu-list">
        ${searchItems.map(
          (each) => html`
            <button
              class="SelectMenu-item"
              role="menuitem"
              aria-checked="${each === this.selectedItemText}"
              @click=${this.onClickItem.bind(this, each)}
            >
              ${this.renderCheckBoxTemplate(each)} ${each}
            </button>
          `,
        )}
      </div>
    `
  }

  footerTemplate(searchItems: string[]): TemplateResult {
    const totalItemsLength = this.items.length
    const searchItemsLength = searchItems.length
    return html`
      <footer
        class="SelectMenu-footer"
        style=${styleMap({
          display: this.displayFooter ? `block` : `none`,
        })}
      >
        Total ${searchItemsLength} of ${totalItemsLength}
      </footer>
    `
  }

  // # Event Handlers

  @eventOptions({})
  preventEnter(event: KeyboardEvent): void {
    if (event.key === `Enter`) {
      event.preventDefault()
      return
    }
  }

  @eventOptions({})
  onSearchText(event: KeyboardEvent): void {
    const target = event.target as HTMLInputElement
    this.searchText = target.value
  }

  @eventOptions({})
  onClickItem(text: string): void {
    if (this.type === `SELECT`) {
      this.selectedItemText = text
    }
    this.detailElement!.open = false
    this.dispatchEvent(
      new CustomEvent(`select-item`, {
        detail: {
          text,
          index: this.selectProjectIndex,
        },
      }),
    )
  }

  @eventOptions({})
  onOpenDetails(): void {
    this.open = this.detailElement!.open
    if (this.detailElement!.open) {
      this.open = true
      this.dispatchEvent(new CustomEvent(`open`))
    }
  }

  @eventOptions({})
  onClickToggle(): void {
    this.toggle = !this.toggle
    this.dispatchEvent(
      new CustomEvent(`toggled`, {
        detail: {
          toggle: this.toggle,
        },
      }),
    )
  }

  // # Methods

  close(): void {
    this.open = false
    this.detailElement!.open = false
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'jira-select': JiraSelect
  }
}
