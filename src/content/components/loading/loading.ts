import { html, LitElement, unsafeCSS } from 'lit'
import { customElement } from 'lit/decorators.js'

import tailwind from '../../../styles/tailwind.css?inline'

import PrimerColorsCSS from '../styles/primer-colors.scss'
import PrimerCSS from '@primer/css/index.scss'

@customElement('jira-loading')
export class Loading extends LitElement {
  static styles = [unsafeCSS(PrimerColorsCSS), unsafeCSS(PrimerCSS), unsafeCSS(tailwind)]

  render() {
    return html`
      <span class="Label mt-3">
        <span>Loading</span>
        <span class="AnimatedEllipsis"></span>
      </span>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'jira-loading': Loading
  }
}
