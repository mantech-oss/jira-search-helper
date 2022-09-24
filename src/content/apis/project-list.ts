export interface GetProjectListResponse {
  self: string
  nextPage: string
  maxResults: number
  startAt: number
  total: number
  isLast: boolean
  values: ProjectValue[]
}

export interface ProjectValue {
  expand: Expand
  self: string
  id: string
  key: string
  lead: Lead
  name: string
  avatarUrls: AvatarUrls
  projectCategory?: ProjectCategory
  projectTypeKey: ProjectTypeKey
  simplified: boolean
  style: Style
  favourite: boolean
  isPrivate: boolean
  permissions: Permissions
  properties: Properties
  url?: string
  entityId?: string
  uuid?: string
}

export interface AvatarUrls {
  '48x48': string
  '24x24': string
  '16x16': string
  '32x32': string
}

export enum Expand {
  DescriptionLeadIssueTypesURLProjectKeysPermissionsInsight = 'description,lead,issueTypes,url,projectKeys,permissions,insight',
}

export interface Lead {
  self: string
  accountId: string
  accountType: AccountType
  avatarUrls: AvatarUrls
  displayName: string
  active: boolean
}

export enum AccountType {
  Atlassian = 'atlassian',
}

export interface Permissions {
  canEdit: boolean
}

export interface ProjectCategory {
  self: string
  id: string
  name: Name
  description: Description
}

export enum Description {
  Empty = '',
  독립판매제품 = '독립 판매 제품',
  회사자체로운영하는서비스 = '회사 자체로 운영하는 서비스',
}

export enum Name {
  Product = 'Product',
  Service = 'Service',
  Test = 'Test',
}

export enum ProjectTypeKey {
  Software = 'software',
}

export interface Properties {}

export enum Style {
  Classic = 'classic',
  NextGen = 'next-gen',
}

export async function getProjectList({
  abortController,
  startAt = 0,
}: {
  abortController?: AbortController
  startAt?: number
} = {}): Promise<GetProjectListResponse> {
  const searchParams = new URLSearchParams()
  searchParams.set('expand', `lead,url,favourite,permissions`)
  searchParams.set('maxResults', `50`) // max = 50, Not available even if exceeding 50
  searchParams.set('orderBy', `+NAME`)
  searchParams.set('query', ``)
  searchParams.set('startAt', `${startAt}`)
  searchParams.set('typeKey', `software`)
  const response = await fetch(
    `https://${location.host}/rest/api/2/project/search?${searchParams.toString()}`,
    {
      method: 'GET',
      body: null,
      ...(abortController ? { signal: abortController.signal } : {}),
    },
  )

  return response.json()
}
