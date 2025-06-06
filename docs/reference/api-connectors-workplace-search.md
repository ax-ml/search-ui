---
mapped_pages:
  - https://www.elastic.co/guide/en/search-ui/current/api-connectors-workplace-search.html
applies_to:
  stack:
---

# Workplace Search Connector [api-connectors-workplace-search]

::::{admonition} Deprecation Notice
:class: important

Workplace Search connector for Search UI is deprecated and will no longer be supported. Please migrate to [Elasticsearch Connector](/reference/api-connectors-elasticsearch.md) for continued support.

::::

This Connector is used to connect Search UI to Elastic’s [Workplace Search](https://www.elastic.co/workplace-search/) API.

## Usage [api-connectors-workplace-search-usage]

```shell
npm install --save @elastic/search-ui-workplace-search-connector
```

```js
import WorkplaceSearchAPIConnector from "@elastic/search-ui-workplace-search-connector";

const connector = new WorkplaceSearchAPIConnector({
  kibanaBase: "https://search-ui-sandbox.kb.us-central1.gcp.cloud.es.io:9243",
  enterpriseSearchBase:
    "https://search-ui-sandbox.ent.us-central1.gcp.cloud.es.io",
  redirectUri: "http://localhost:3000",
  clientId: "8e495e40fc4e6acf515e557e634de39d4f727f7f60a3afed24a99ce316607c1e"
});
```

See the [usage example](https://github.com/elastic/search-ui/blob/main/examples/sandbox/src/pages/workplace-search/index.js) in our sandbox app. The example uses a private Elastic Cloud deployment. Make sure to update the configuration values to use with your own [Elastic Cloud](https://www.elastic.co/cloud/) deployment.

## Authentication [api-connectors-workplace-search-authentication]

The Workplace Search API requires authentication. This connector uses OAuth authentication. You can read more about that [here](https://www.elastic.co/guide/en/workplace-search/current/building-custom-search-workplace-search.html) and [here](https://www.elastic.co/guide/en/workplace-search/current/workplace-search-search-oauth.html).

Using this connector will populate two additional pieces of Application State:

`isLoggedIn` (boolean) - This can be used to determine whether or not a user is authenticated. Requests using this connector will only work if a user is authenticatied. If this is false, consider showing a "Login" link using the `authorizeUrl` state.

`authorizeUrl` (string) - This can be used to create a "Login" link for users to initiate OAuth authentication.

`logout` - (function) - This action can be used to log out user out of the search experience. Under the hood it 1) deletes the saved token from LocalStorage and 2) logs user out of Enterprise Search and Kibana to prevent the ability to get a new access token.

## Options [api-connectors-workplace-search-options]

| Param                         | Description                                                                                                                                                                                                    |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| enterpriseSearchBase          | Required. String. The publicly accessible url of the Enterprise Search.                                                                                                                                        |
| kibanaBase                    | Required. String. The publicly accessible url for the Kibana deployment associated with the Enterprise Search deployment. Used for OAuth authentication.                                                       |
| redirectUri                   | Required. String. The publicly accessible url of this Search UI deployment, which Kibana will redirect back to after successful OAuth authentication. Must match a URI as configured in the OAuth Application. |
| clientId                      | Required. String. Client ID as generated when setting up the OAuth Application.                                                                                                                                |
| beforeSearchCall              | Optional. A hook to amend query options before the request is sent to the API in a query on an "onSearch" event.                                                                                               |
| beforeAutocompleteResultsCall | Optional. A hook to amend query options before the request is sent to the API in a "results" query on an "onAutocomplete" event.                                                                               |
