import { LitElement } from 'lit';
/**
 * popup
 */
export declare class Popup extends LitElement {
    crx: string;
    render(): import("lit-html").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        popup: Popup;
    }
}
