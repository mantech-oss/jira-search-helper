import { action, computed, makeObservable, observable } from 'mobx'
import { getProjectList, ProjectValue } from '../apis/project-list'
import { getOnpremiseProjectList } from '../apis/project-list-onpremise'
import { getSearchIssues } from '../apis/search-issue'
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
  projects: Project[] = []

  @computed
  get projectDisplayName(): string[] {
    return this.projects.map((project) => {
      return `${project.name} (${project.key})`
    })
  }

  @observable
  selectedProject: Project | null = null

  @computed
  get selectedProjectDisplayName(): string {
    const selectedProject = this.projects.find((project) => {
      return project.id === this.selectedProjectId
    })

    if (!selectedProject) return 'No Project'

    return `${selectedProject.name} (${selectedProject.key})`
  }

  @computed
  get selectedProjectId(): string {
    const { selectedProject } = this
    const projectId = selectedProject?.id ?? this.projects?.[0]?.id
    return projectId
  }

  @action
  selectProject(project: Project): void {
    this.selectedProject = project
    chrome.storage.local.set({ selectedProject: project })
  }

  @action
  setProjects(projects: Project[]): void {
    this.projects = projects
    chrome.storage.local.set({ projects: projects })
  }

  async getProjectList(): Promise<void> {
    const { isOnPremise } = await chrome.storage.local.get(['isOnPremise'])
    let projects: Project[] = []
    if (isOnPremise) {
      const projectJson = await getOnpremiseProjectList({ abortController: this.controller })
      projects = projectJson.map((each) => {
        return {
          id: each.id,
          name: each.name,
          key: each.key,
        }
      })
    } else {
      let isLast = false
      let startAt = 0
      while (isLast === false) {
        try {
          const projectJson = await getProjectList({
            abortController: this.controller,
            startAt: startAt,
          })
          isLast = projectJson.isLast
          if (projectJson.isLast === false) {
            startAt += 50
          }
          projects = [
            ...projects,
            ...projectJson.values.map((each: ProjectValue) => {
              return {
                id: each.id,
                name: each.name,
                key: each.key,
              }
            }),
          ]
        } catch (error) {
          console.error(error)
          isLast = true
        }
      }
    }

    this.setProjects(projects)
  }

  async getSelectedProject(): Promise<void> {
    const { selectedProject } = await chrome.storage.local.get(['selectedProject'])
    this.selectProject(selectedProject)
  }

  async fetchSearchApi(searchText: string): Promise<void> {
    if (searchText === '') return

    try {
      document.body.appendChild(document.createElement('jira-loading'))
      const cookies = parseCookie(document.cookie)
      const atlToken = cookies['atlassian.xsrf.token']

      if (!atlToken) return

      this.controller.abort()
      this.controller = new AbortController()

      this.loading = true

      await this.getProjectList()
      const projectId = this.selectedProjectId
      const searchResultCount = this.searchResultCount

      const searchXMLTextResponse = await getSearchIssues({
        atlToken,
        projectId,
        searchResultCount,
        searchText,
        abortController: this.controller,
      })
      const xml = new DOMParser().parseFromString(searchXMLTextResponse, 'text/xml')
      const searchTextArray = searchText.split(/\s+/)
      searchText = searchTextArray[searchTextArray.length - 1]
      const searchResult: SearchResult[] = []

      xml.querySelectorAll('item').forEach((item) => {
        const title = stripHTMLTags(item.querySelector('title')?.textContent ?? '').replace(
          /\s\n/g,
          '',
        )
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
        let descriptionIndex = -1
        let WORD_GRP = 30
        const titleIndex = title.toLowerCase().indexOf(searchText.toLowerCase())

        // search in title
        if (titleIndex !== -1) {
          previousWord = title.substring(titleIndex - WORD_GRP, titleIndex)
          nextWord = title.substring(
            titleIndex + searchTextLength,
            titleIndex + searchTextLength + WORD_GRP,
          )
        } else {
          descriptionIndex = description.toLowerCase().indexOf(searchText.toLowerCase())

          // search in description
          if (descriptionIndex !== -1) {
            previousWord = description.substring(descriptionIndex - WORD_GRP, descriptionIndex)
            nextWord = description.substring(
              descriptionIndex + searchTextLength,
              descriptionIndex + searchTextLength + WORD_GRP,
            )
          } else {
            commentsIndex = comments.toLowerCase().indexOf(searchText.toLowerCase())

            // search in comments
            if (commentsIndex !== -1) {
              previousWord = comments.substring(commentsIndex - WORD_GRP, commentsIndex)
              nextWord = comments.substring(
                commentsIndex + searchTextLength,
                commentsIndex + searchTextLength + WORD_GRP,
              )
            }
          }
        }

        searchResult.push({
          title: item.querySelector('summary')?.textContent ?? '',
          href: item.querySelector('link')?.textContent ?? '',
          key: item.querySelector('key')?.textContent ?? '',
          issueIconUrl: item.querySelector('type')?.getAttribute('iconUrl') ?? '',
          previousWord,
          searchText:
            titleIndex !== -1 || descriptionIndex !== -1 || commentsIndex !== -1 ? searchText : '',
          nextWord,
        })
      })
      this.setSearchResult(searchResult)
    } catch (err) {
      const error = err as Error
      this.loading = false
      if (error.name === `AbortError`) return
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
    this.setSearchResultCount(searchResultCount || 20)
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
  name: string
  key: string
}

export const jiraSearchModalStore = new Store()
