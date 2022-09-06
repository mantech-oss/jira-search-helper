import { html, LitElement, unsafeCSS } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import tailwind from '../../../styles/tailwind.css?inline'

@customElement('bit-tag')
export class BitTag extends LitElement {
  static styles = [unsafeCSS(tailwind)]

  @property({ type: Number })
  ddayNumber = 0

  get ddayString(): string {
    if (this.ddayNumber === 0) return 'New'
    return `D-${this.ddayNumber}`
  }

  render() {
    const { ddayString, ddayColors } = this
    return html` <span class="badge ${ddayColors} text-white" part="base">${ddayString}</span> `
  }

  get ddayColors(): string {
    const { ddayNumber } = this

    switch (true) {
      case ddayNumber === 0:
        return 'badge-info'
      case ddayNumber < 3:
        return 'badge-success'
      case ddayNumber <= 5:
        return 'badge-warning'
      default:
        return 'badge-error'
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'bit-tag': BitTag
  }
}
