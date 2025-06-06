import type {
  Filter as SearchUIFilter,
  QueryConfig,
  RequestState,
  FacetConfiguration
} from "@elastic/search-ui";
import { BaseQueryBuilder } from "./BaseQueryBuilder";
import {
  transformFacet,
  transformFacetToAggs,
  transformFilter
} from "../transformer/filterTransformer";
import { RequestModifiers, SearchRequest } from "../types";
import { deepMergeObjects, getQueryFields } from "../utils";

export class SearchQueryBuilder extends BaseQueryBuilder {
  constructor(
    state: RequestState,
    private readonly queryConfig: QueryConfig,
    private readonly getQueryFn?: RequestModifiers["getQueryFn"]
  ) {
    super(state);
  }

  build() {
    this.setPagination(this.state.current, this.state.resultsPerPage);
    this.setSourceFields(Object.keys(this.queryConfig.result_fields || {}));
    this.setSort(this.buildSort());
    this.setHighlight(this.buildHighlight());
    this.setAggregations(this.buildAggregations());
    this.setPostFilter(this.buildPostFilter());
    this.setQuery(this.buildQuery());

    return this.query;
  }

  private buildSort(): SearchRequest["sort"] {
    if (this.state.sortList?.length) {
      return this.state.sortList
        .filter((s) => s.direction)
        .map(({ field, direction }) => ({
          [field]: direction || "desc"
        }));
    }

    if (this.state.sortField && this.state.sortDirection) {
      return { [this.state.sortField]: this.state.sortDirection };
    }

    return "_score";
  }

  private buildHighlight(): SearchRequest["highlight"] | null {
    const highlightFields = Object.entries(
      this.queryConfig.result_fields || {}
    ).reduce<Record<string, object>>((acc, [fieldKey, fieldConfiguration]) => {
      if (fieldConfiguration.snippet) {
        acc[fieldKey] = {};
      }
      return acc;
    }, {});

    return Object.keys(highlightFields).length > 0
      ? { fields: highlightFields }
      : null;
  }

  private buildAggregations(): SearchRequest["aggs"] | null {
    if (
      !this.queryConfig.facets ||
      !Object.keys(this.queryConfig.facets).length
    ) {
      return null;
    }

    const hasSelectedFilters = this.state.filters?.some(
      (selectedFilter) =>
        !this.queryConfig.filters?.find(
          (baseFilter) => baseFilter.field === selectedFilter.field
        )
    );

    return Object.entries(this.queryConfig.facets).reduce(
      (acc, [facetKey, facetConfiguration]) => {
        const facetField = facetConfiguration.field || facetKey;
        const isDisjunctive =
          this.queryConfig.disjunctiveFacets?.includes(facetKey);
        if (isDisjunctive && hasSelectedFilters) {
          // @ts-expect-error - key is dynamically generated
          acc[`facet_bucket_${facetKey}`] = {
            aggs: {
              [facetKey]: transformFacetToAggs(facetKey, facetConfiguration)
            },
            filter: {
              bool: {
                must: this.getFacetFilters()
                  .filter((filter) => filter.field !== facetField)
                  .map((filter) =>
                    transformFacet(filter, this.getFacet(filter))
                  )
              }
            }
          };
        } else {
          acc.facet_bucket_all.aggs = {
            ...acc.facet_bucket_all.aggs,
            [facetKey]: transformFacetToAggs(facetKey, facetConfiguration)
          };
        }
        return acc;
      },
      {
        facet_bucket_all: {
          aggs: {},
          filter: this.buildPostFilter() || { bool: { must: [] } }
        }
      }
    );
  }

  private buildPostFilter(): SearchRequest["post_filter"] | null {
    const postFilter = this.getFacetFilters()
      .map((filter) => transformFacet(filter, this.getFacet(filter)))
      .filter((filter) => !!filter);

    return postFilter?.length ? { bool: { must: postFilter } } : null;
  }

  private buildQuery(): SearchRequest["query"] | null {
    const filtersDsl = this.buildQueryDslFilters();
    const searchDsl = this.buildSearchDslQuery();

    return deepMergeObjects(searchDsl as Record<string, unknown>, filtersDsl);
  }

  private buildSearchDslQuery() {
    const searchQuery = this.state.searchTerm;

    if (!searchQuery) {
      return null;
    }

    if (this.getQueryFn) {
      return this.getQueryFn(this.state, this.queryConfig);
    }

    const fields = getQueryFields(this.queryConfig.search_fields);

    return {
      bool: {
        must: [
          {
            bool: {
              minimum_should_match: 1,
              should: [
                {
                  multi_match: {
                    query: searchQuery,
                    fields: fields,
                    type: "best_fields",
                    operator: "and",
                    fuzziness: this.queryConfig.fuzziness ? "AUTO" : undefined
                  }
                },
                {
                  multi_match: {
                    query: searchQuery,
                    fields: fields,
                    type: "cross_fields"
                  }
                },
                {
                  multi_match: {
                    query: searchQuery,
                    fields: fields,
                    type: "phrase"
                  }
                },
                {
                  multi_match: {
                    query: searchQuery,
                    fields: fields,
                    type: "phrase_prefix"
                  }
                }
              ]
            }
          }
        ]
      }
    };
  }

  private buildQueryDslFilters() {
    const filters = this.getQueryFilters().map(transformFilter);

    if (!filters.length) {
      return null;
    }

    return {
      bool: { filter: filters }
    };
  }

  private getFacetFilters(): SearchUIFilter[] {
    return (this.state.filters || []).filter((filter) => this.getFacet(filter));
  }

  private getQueryFilters(): SearchUIFilter[] {
    // Exclude facet filters from query filters for aggs, but always include base filters (even if they are facets).
    return (this.state.filters || [])
      .filter((filter) => !this.getFacet(filter))
      .concat(this.queryConfig.filters || []);
  }

  private getFacet(filter: SearchUIFilter): FacetConfiguration | undefined {
    return (
      this.queryConfig.facets?.[filter.field] ||
      Object.values(this.queryConfig.facets || {}).find(
        (facet) => facet.field === filter.field
      )
    );
  }
}
