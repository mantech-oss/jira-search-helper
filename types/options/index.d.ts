import { LitElement } from 'lit';
/**
 * options
 */
export declare class Options extends LitElement {
    crx: string;
    render(): import("lit-html").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        options: Options;
    }
}
