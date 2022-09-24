import { html, css } from 'lit'
import { customElement, eventOptions, property, state } from 'lit/decorators.js'
import { BaseComponent } from '../common/baseComponent'
import { IconCog, IconCopy } from '../content/components/icons/icons'
import { watch } from '../content/utils/watch'

@customElement('popup-main')
export class PopupMain extends BaseComponent {
  // # Properties

  @property({ type: Boolean })
  enableSearchFeature = true

  @property({ type: Boolean })
  isOnPremise = false

  @state()
  isShortcutCopyLink = false

  // # Event handlers

  // # Lifecycle methods

  connectedCallback(): void {
    chrome.storage.local.get([`enableSearchFeature`, `isOnPremise`], (result: any) => {
      const { enableSearchFeature, isOnPremise } = result
      this.enableSearchFeature = enableSearchFeature ?? true
      this.isOnPremise = isOnPremise ?? false
    })
    super.connectedCallback()
  }

  // # watch
  @watch('enableSearchFeature', { waitUntilFirstUpdate: true })
  async onWatchEnableSearchFeature(): Promise<void> {
    chrome.storage.local.set({ enableSearchFeature: this.enableSearchFeature })
  }

  @watch('isOnPremise', { waitUntilFirstUpdate: true })
  async onWatchIsOnPremise(): Promise<void> {
    chrome.storage.local.set({ isOnPremise: this.isOnPremise })
  }

  render() {
    const { enableSearchFeature, isOnPremise } = this
    return html`
      <main data-theme="fantasy" class="bg-transparent">
        <div class="navbar bg-base-100 shadow-xl rounded-box flex item-center justify-between">
          <h1 class="ml-4 normal-case text-xl">
            ${IconCog}
            <span class="ml-2">${chrome.i18n.getMessage('SETTING')}</span>
          </h1>
          <img part="logo" width="64" src="img/logo-128.png" />
        </div>

        <div class="navbar bg-base-100 shadow-xl rounded-box mt-4">
          <ul class="menu menu-compact bg-base-100 w-full p-2 rounded-box">
            <li class="menu-title w-full">
              <span>${chrome.i18n.getMessage('VIEW_REAL_TIME_DATA')}</span>
            </li>
            <li class="w-full flex">
              <div class="tooltip" data-tip="${chrome.i18n.getMessage('HELP_TEXT_COMMANDS')}">
                <label class="label cursor-pointer">
                  <span class="label-text">${chrome.i18n.getMessage('APP_NAME')}</span>
                  <input
                    ?checked=${enableSearchFeature}
                    @change=${(event: Event) => {
                      this.enableSearchFeature = (event.target as HTMLInputElement).checked
                    }}
                    type="checkbox"
                    class="toggle toggle-accent"
                  />
                </label>
              </div>
            </li>

            <li class="w-full flex">
              <div
                class="tooltip"
                data-tip="${chrome.i18n.getMessage('HELP_TEXT_JIRA_ON_PREMISE')}"
              >
                <label class="label cursor-pointer">
                  <span class="label-text">${chrome.i18n.getMessage('JIRA_ON_PREMISE')}</span>
                  <input
                    ?checked=${isOnPremise}
                    @change=${(event: Event) => {
                      this.isOnPremise = (event.target as HTMLInputElement).checked
                    }}
                    type="checkbox"
                    class="toggle toggle-accent"
                  />
                </label>
              </div>
            </li>

            <li class="w-full flex" @click=${this.onClickShortcutCopyLink}>
              <div
                class="tooltip"
                data-tip="${this.isShortcutCopyLink
                  ? chrome.i18n.getMessage('COPIED_TEXT')
                  : chrome.i18n.getMessage('HELP_TEXT_COPY_EXTENSION_SHORTCUT')}"
              >
                <label class="label cursor-pointer">
                  <span class="label-text">
                    ${chrome.i18n.getMessage('COPY_EXTENSION_SHORTCUT')}
                  </span>
                  <span class="inline-block">${IconCopy}</span>
                </label>
              </div>
            </li>
          </ul>
        </div>
      </main>
    `
  }

  @eventOptions({})
  async onClickShortcutCopyLink(event: Event): Promise<void> {
    event.preventDefault()
    await navigator.clipboard.writeText('chrome://extensions/shortcuts')
    this.isShortcutCopyLink = true
  }

  static styles = [
    ...super.styles,
    css`
      main {
        min-width: 500px;
        padding: 1rem;
      }

      .outline-none-important {
        outline: none !important;
      }

      [part='logo'] {
        border-radius: 1rem;
      }
    `,
  ]
}

declare global {
  interface HTMLElementTagNameMap {
    'popup-main': PopupMain
  }
}
