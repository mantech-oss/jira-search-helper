import { action, makeObservable, observable } from 'mobx'
import { getProjectList, ProjectValue } from '../components/apis/project-list'
import { parseCookie } from '../utils/parseCookie'
import { stripHTMLTags } from '../utils/stripHTMLTags'

export class Store {
  public constructor() {
    makeObservable(this)

    this.getSelectedProject()
    this.getSearchResultCount()
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

  // ===

  private controller = new AbortController()

  @observable
  loading = false

  @observable
  projectes: Project[] = []

  @observable
  selectedProject: Project | null = null

  selectedProjectId(): string {
    const { selectedProject } = this
    const projectId = selectedProject?.id ?? this.projectes?.[0].id
    return projectId
  }

  @action
  selectProject(project: Project): void {
    this.selectedProject = project
    chrome.storage.local.set({ selectedProject: project })
  }

  @action
  setProjects(projects: Project[]): void {
    this.projectes = projects
    chrome.storage.local.set({ projects: projects })
  }

  async getProjectList(): Promise<void> {
    const projectJson = await getProjectList({
      abortController: this.controller,
    })
    const projects = projectJson.values.map((each: ProjectValue) => {
      return {
        id: each.id,
        key: each.key,
      }
    })
    this.setProjects(projects)
  }

  async getSelectedProject(): Promise<void> {
    const { selectedProject } = await chrome.storage.local.get(['selectedProject'])
    this.selectProject(selectedProject)
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

      await this.getProjectList()
      const projectId = await this.selectedProjectId()
      const searchResultCount = this.searchResultCount

      // FIXME: split api model
      // FIXME: use urlsearchparams
      const searchResponse = await fetch(
        `https://${location.host}/sr/jira.issueviews:searchrequest-xml/temp/SearchRequest.xml?jqlQuery=(text+%7E+%22${searchText}%22+OR+comment+%7E+%22${searchText}%22)+AND++project+IN+%28${projectId}%29&atl_token=${atlToken}&tempMax=${searchResultCount}`,
        {
          method: 'GET',
          body: null,
          signal: this.controller.signal,
        },
      )
      const str = await searchResponse.text()
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
      this.setSearchResult(searchResult)
      this.loading = false
    } catch (error) {
      this.loading = false
      console.error(error)
    }
  }

  // ===

  @observable
  searchResultCount = 20

  @action
  async setSearchResultCount(count: number): Promise<void> {
    this.searchResultCount = count
    await chrome.storage.local.set({ searchResultCount: count })
  }

  async getSearchResultCount(): Promise<void> {
    const { searchResultCount } = await chrome.storage.local.get(['searchResultCount'])
    this.setSearchResultCount(searchResultCount)
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

export interface Project {
  id: string
  key: string
}

export const jiraSearchModalStore = new Store()
