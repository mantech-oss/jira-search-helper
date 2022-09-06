import { action, makeObservable, observable } from 'mobx'

export class JiraSearchModalStore {
  public constructor() {
    makeObservable(this)
  }

  @observable
  public visible = false

  @action
  public toggle(): void {
    this.visible = !this.visible
  }

  @action
  public open(): void {
    this.visible = true
  }

  @action
  public close(): void {
    this.visible = false
  }

  // ===

  @observable
  public searchResult: SearchResult[] = []

  @action
  public setSearchResult(searchResult: SearchResult[]): void {
    this.searchResult = searchResult
  }

  @action
  public clearSearchResult(): void {
    this.searchResult = []
  }
}

export interface SearchResult {
  key: string
  href: string
  issueIconUrl: string
  title: string
  searchText: string
  previousWord: string
  nextWord: string
}

export var jiraSearchModalStore = new JiraSearchModalStore()
