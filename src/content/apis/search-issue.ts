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
  const searchParams = new URLSearchParams()
  const issueKey = searchText.match(/[A-Z|a-z|0-9]{2,}-\d+/)?.[0]

  searchParams.set(
    'jqlQuery',
    `(text ~ "${searchText}" OR comment ~ "${searchText}"${
      issueKey ? ` OR issuekey = "${issueKey}"` : ``
    }) AND  project IN (${projectId})`,
  )
  searchParams.set('atl_token', atlToken)
  searchParams.set('tempMax', `${searchResultCount}`)
  const response = await fetch(
    `https://${
      location.host
    }/sr/jira.issueviews:searchrequest-xml/temp/SearchRequest.xml?${searchParams.toString()}`,
    {
      method: 'GET',
      body: null,
      ...(abortController ? { signal: abortController.signal } : {}),
    },
  )

  return response.text()
}
