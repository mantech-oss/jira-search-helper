import { MobxLitElement } from "@adobe/lit-mobx";
import { LitElement, unsafeCSS } from "lit";
import tailwind from '../styles/tailwind.css?inline';

export class BaseComponent extends LitElement {
  static styles = [unsafeCSS(tailwind)]
}

export class BaseMobxComponent extends MobxLitElement {
  static styles = [unsafeCSS(tailwind)]
}