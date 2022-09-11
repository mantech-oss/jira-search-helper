// TODO: How to define xml type?
export type XMLResponse = any

export async function getSearchIssues({
  abortController,
  searchText,
  projectId,
  atlToken,
  searchResultCount,
}: {
  abortController?: AbortController
  searchText: string
  projectId: string
  atlToken: string
  searchResultCount: number
}): Promise<XMLResponse> {
  // FIXME: use urlsearchparams
  const response = await fetch(
    `https://${location.host}/sr/jira.issueviews:searchrequest-xml/temp/SearchRequest.xml?jqlQuery=(text+%7E+%22${searchText}%22+OR+comment+%7E+%22${searchText}%22)+AND++project+IN+%28${projectId}%29&atl_token=${atlToken}&tempMax=${searchResultCount}`,
    {
      method: 'GET',
      body: null,
      ...(abortController ? { signal: abortController.signal } : {}),
    },
  )

  return response.text()
}
