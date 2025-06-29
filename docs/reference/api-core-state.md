---
mapped_pages:
  - https://www.elastic.co/guide/en/search-ui/current/api-core-state.html
applies_to:
  stack:
  serverless:
---

# State [api-core-state]

State can be divided up into a few different types.

1. [Request State](#api-core-state-request-state) - State that is used as parameters on Search API calls.
2. [Response State](#api-core-state-response-state) - State that represents a response from a Search API call.
3. [Application State](#api-core-state-application-state) - The general state.

Request State and Response State will often have similar values. For instance, `searchTerm` and `resultSearchTerm`. `searchTerm` is the current search term in the UI, and `resultSearchTerm` is the term associated with the current `results`. This can be relevant in the UI, where you might not want the search term on the page to change until AFTER a response is received, so you’d use the `resultSearchTerm` state.

## Request State [api-core-state-request-state]

State that is used as parameters on Search API calls.

Request state can be set by:

- Using actions, like `setSearchTerm`
- The `initialState` option.
- The URL query string, if `trackUrlState` is enabled.

| option           | Description                              |
| ---------------- | ---------------------------------------- |
| `current`        | Current page number                      |
| `filters`        | Array of filters. See Filters section.   |
| `resultsPerPage` |                                          |
| `searchTerm`     | Search terms to search for               |
| `sort`           | List of fields and directions to sort on |

## Response State [api-core-state-response-state]

State that represents a response from a Search API call.

It is not directly update-able.

It is updated indirectly by invoking an action which results in a new API request.

| field                               | description                                                                                                                                                                                                                                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `autocompletedResults`              | An array of results items fetched for an autocomplete dropdown.                                                                                                                                                                                                           |
| `autocompletedResultsRequestId`     | A unique ID for the current autocompleted search results.                                                                                                                                                                                                                 |
| `autocompletedSuggestions`          | A keyed object of query suggestions. It’s keyed by type since multiple types of query suggestions can be set here.                                                                                                                                                        |
| `autocompletedSuggestionsRequestId` | A unique ID for the current autocompleted suggestion results.                                                                                                                                                                                                             |
| `facets`                            | Will be populated if `facets` configured in [Search Query Facets Configuration](/reference/api-core-configuration.md#api-core-configuration-facets).                                                                                                                      |
| `rawResponse`                       | The response object received from the API                                                                                                                                                                                                                                 |
| `requestId`                         | A unique ID for the current search results.                                                                                                                                                                                                                               |
| `results`                           | An array of result items.                                                                                                                                                                                                                                                 |
| `resultSearchTerm`                  | As opposed the the `searchTerm` state, which is tied to the current search parameter, this is tied to the searchTerm for the current results. There will be a period of time in between when a request is started and finishes where the two pieces of state will differ. |
| `totalResults`                      | Total number of results found for the current query.                                                                                                                                                                                                                      |

## Application State [api-core-state-application-state]

Application state is the general application state.

| field         | description                                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------------------ |
| `error`       | Error message, if an error was thrown.                                                                             |
| `isLoading`   | Whether or not a search is currently being performed.                                                              |
| `wasSearched` | Has any query been performed since this driver was created? Can be useful for displaying initial states in the UI. |
