export interface GetOnpremiseProject {
  expand:           Expand;
  self:             string;
  id:               string;
  key:              string;
  name:             string;
  avatarUrls:       AvatarUrls;
  projectCategory?: ProjectCategory;
  projectTypeKey:   ProjectTypeKey;
  simplified:       boolean;
  style:            Style;
  isPrivate:        boolean;
  properties:       Properties;
  entityId?:        string;
  uuid?:            string;
}

export interface AvatarUrls {
  "48x48": string;
  "24x24": string;
  "16x16": string;
  "32x32": string;
}

export enum Expand {
  DescriptionLeadIssueTypesURLProjectKeysPermissionsInsight = "description,lead,issueTypes,url,projectKeys,permissions,insight",
}

export interface ProjectCategory {
  self:        string;
  id:          string;
  name:        Name;
  description: Description;
}

export enum Description {
  Empty = "",
  MCCSResourceAgent = "MCCS Resource Agent",
  독립판매제품 = "독립 판매 제품",
  회사자체로운영하는서비스 = "회사 자체로 운영하는 서비스",
}

export enum Name {
  Product = "Product",
  ResourceAgent = "Resource Agent",
  Service = "Service",
  Test = "Test",
}

export enum ProjectTypeKey {
  Business = "business",
  ServiceDesk = "service_desk",
  Software = "software",
}

export interface Properties {
}

export enum Style {
  Classic = "classic",
  NextGen = "next-gen",
}


export async function getOnpremiseProjectList({
  abortController,
}: {
  abortController?: AbortController
} = {}): Promise<GetOnpremiseProject[]> {
  const response = await fetch(
    `https://${location.host}/rest/api/2/project`,
    {
      method: 'GET',
      body: null,
      ...(abortController ? { signal: abortController.signal } : {}),
    },
  )

  return response.json()
}
