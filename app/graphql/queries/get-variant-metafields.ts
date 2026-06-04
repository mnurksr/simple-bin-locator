/**
 * GraphQL query to fetch variant metafields in bulk using the `nodes` query.
 * Retrieves bin location metafields from the "warehouse" namespace.
 * @module
 */

/** Response shape for a single variant node returned by the bulk query. */
export interface VariantMetafieldNode {
  id: string;
  title: string;
  sku: string | null;
  displayName: string;
  product: {
    title: string;
  };
  metafields: {
    edges: Array<{
      node: {
        namespace: string;
        key: string;
        value: string;
      };
    }>;
  };
}

/** Full response shape from the nodes bulk query. */
export interface GetVariantMetafieldsResponse {
  data: {
    nodes: Array<VariantMetafieldNode | null>;
  };
}

/**
 * Bulk query to fetch multiple product variants and their warehouse metafields.
 * Uses the top-level `nodes(ids:)` query for efficient batch lookups.
 */
export const GET_VARIANT_METAFIELDS = `#graphql
  query GetVariantMetafields($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on ProductVariant {
        id
        title
        sku
        displayName
        product {
          title
        }
        metafields(first: 5, namespace: "warehouse") {
          edges {
            node {
              namespace
              key
              value
            }
          }
        }
      }
    }
  }
`;
