/**
 * Service for fetching bin location metafields from Shopify product variants.
 * Uses the bulk `nodes` GraphQL query for efficient batch lookups.
 * @module
 */

import {
  GET_VARIANT_METAFIELDS,
  type VariantMetafieldNode,
} from "~/graphql/queries/get-variant-metafields";
import { logger } from "~/utils/logger";

/** Bin location data associated with a single variant. */
export interface VariantBinInfo {
  sku: string;
  productTitle: string;
  variantTitle: string;
  binLocation: string;
}

/**
 * Fetches bin location metafields for a list of product variant IDs.
 *
 * Queries the Shopify Admin GraphQL API using the bulk `nodes` query,
 * then filters metafields for the `warehouse.bin_location` key.
 *
 * @param admin - The GraphQL client obtained from `authenticate.webhook()` (i.e. `admin.graphql`)
 * @param variantIds - Array of variant GIDs (e.g. `gid://shopify/ProductVariant/123`)
 * @returns Map of variant GID → bin location info. Only includes variants that have a bin_location metafield.
 */
export async function fetchBinLocations(
  admin: { graphql: (query: string, options?: { variables: Record<string, unknown> }) => Promise<Response> },
  variantIds: string[],
): Promise<Map<string, VariantBinInfo>> {
  const result = new Map<string, VariantBinInfo>();

  if (!variantIds || variantIds.length === 0) {
    logger.info("No variant IDs provided, skipping bin location fetch");
    return result;
  }

  try {
    logger.info(`Fetching bin locations for ${variantIds.length} variants`);

    const response = await admin.graphql(GET_VARIANT_METAFIELDS, {
      variables: { ids: variantIds },
    });

    const responseJson = await response.json();
    const nodes: Array<VariantMetafieldNode | null> =
      responseJson?.data?.nodes ?? [];

    for (const node of nodes) {
      if (!node || !node.id) {
        continue;
      }

      // Find the bin_location metafield in the warehouse namespace
      const binMetafield = node.metafields?.edges?.find(
        (edge: { node: { namespace: string; key: string; value: string } }) =>
          edge.node.namespace === "warehouse" &&
          edge.node.key === "bin_location",
      );

      if (!binMetafield || !binMetafield.node.value) {
        logger.info(`No bin_location metafield found for variant ${node.id}`);
        continue;
      }

      result.set(node.id, {
        sku: node.sku ?? "",
        productTitle: node.product?.title ?? "Bilinmeyen Ürün",
        variantTitle: node.title ?? "",
        binLocation: binMetafield.node.value,
      });
    }

    logger.info(
      `Found bin locations for ${result.size} out of ${variantIds.length} variants`,
    );
  } catch (error) {
    logger.error(
      "Failed to fetch bin locations from Shopify",
      error instanceof Error ? error.message : error,
    );
    // Return whatever we have so far rather than throwing
  }

  return result;
}
