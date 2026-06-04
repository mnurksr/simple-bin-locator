/**
 * Orchestration service for processing orders/create webhooks.
 * Coordinates bin location fetching, formatting, and order note updates
 * with idempotency guarantees via the ProcessedOrder table.
 * @module
 */

import db from "~/db.server";
import { logger } from "~/utils/logger";
import { fetchBinLocations } from "~/services/bin-location.service";
import { updateOrderNote } from "~/services/order-notes.service";
import {
  formatBinLocations,
  type BinLocationLineItem,
} from "~/utils/format-bin-locations";

/** Shape of a line item from the orders/create webhook payload. */
interface WebhookLineItem {
  variant_id: number | null;
  quantity: number;
  title: string;
  variant_title: string | null;
  sku: string | null;
}

/** Shape of the orders/create webhook payload (relevant fields only). */
interface OrderWebhookPayload {
  id: number;
  admin_graphql_api_id: string;
  line_items: WebhookLineItem[];
  [key: string]: unknown;
}

/** Arguments for the processOrderBinLocations function. */
export interface ProcessOrderArgs {
  admin: (query: string, options?: { variables: Record<string, unknown> }) => Promise<Response>;
  shop: string;
  payload: OrderWebhookPayload;
  webhookId: string;
}

/**
 * Orchestrates the full bin-location-to-order-note flow for a new order.
 *
 * Steps:
 * 1. Check idempotency via the ProcessedOrder table
 * 2. Extract line items and build variant GIDs
 * 3. Fetch bin location metafields from Shopify
 * 4. Format bin locations into a readable string
 * 5. Append the formatted string to the order note
 * 6. Record the result in the ProcessedOrder table
 *
 * @param args - The webhook context including admin client, shop, payload, and webhook ID
 */
export async function processOrderBinLocations(
  args: ProcessOrderArgs,
): Promise<void> {
  const { admin, shop, payload, webhookId } = args;
  const orderId = payload.admin_graphql_api_id || `gid://shopify/Order/${payload.id}`;

  try {
    // Step 1: Idempotency check — skip if this webhook was already processed
    const existing = await db.processedOrder.findUnique({
      where: { webhookId },
    });

    if (existing) {
      logger.info(
        `Webhook ${webhookId} already processed for order ${orderId}, skipping`,
      );
      return;
    }

    logger.info(
      `Processing order ${orderId} for shop ${shop} (webhook: ${webhookId})`,
    );

    // Step 2: Extract line items and build variant GIDs
    const lineItems = payload.line_items ?? [];
    if (lineItems.length === 0) {
      logger.warn(`Order ${orderId} has no line items, skipping`);
      await saveProcessedOrder(webhookId, orderId, shop, "skipped", "No line items");
      return;
    }

    const variantIds: string[] = [];
    const quantityMap = new Map<string, WebhookLineItem>();

    for (const item of lineItems) {
      if (!item.variant_id) {
        logger.warn(`Line item "${item.title}" has no variant_id, skipping`);
        continue;
      }

      const variantGid = `gid://shopify/ProductVariant/${item.variant_id}`;
      variantIds.push(variantGid);
      quantityMap.set(variantGid, item);
    }

    if (variantIds.length === 0) {
      logger.warn(`Order ${orderId} has no valid variant IDs, skipping`);
      await saveProcessedOrder(webhookId, orderId, shop, "skipped", "No valid variant IDs");
      return;
    }

    // Step 3: Fetch bin location metafields from Shopify
    const binLocations = await fetchBinLocations({ graphql: admin }, variantIds);

    // Step 4: Build the formatted bin location items
    const binLocationItems: BinLocationLineItem[] = [];

    for (const [variantGid, binInfo] of binLocations) {
      const lineItem = quantityMap.get(variantGid);
      if (!lineItem) continue;

      binLocationItems.push({
        sku: binInfo.sku,
        productTitle: binInfo.productTitle,
        variantTitle: binInfo.variantTitle,
        binLocation: binInfo.binLocation,
        quantity: lineItem.quantity,
      });
    }

    const formattedText = formatBinLocations(binLocationItems);

    if (!formattedText) {
      logger.info(`No bin locations found for order ${orderId}`);
      await saveProcessedOrder(
        webhookId,
        orderId,
        shop,
        "skipped",
        "No bin locations found",
      );
      return;
    }

    // Step 5: Update the order note with bin location info
    const updateResult = await updateOrderNote({ graphql: admin }, orderId, formattedText);

    if (!updateResult.success) {
      logger.error(
        `Failed to update order note for ${orderId}: ${updateResult.error}`,
      );
      await saveProcessedOrder(
        webhookId,
        orderId,
        shop,
        "failed",
        updateResult.error ?? "Unknown error",
      );
      return;
    }

    // Step 6: Record successful processing
    logger.info(`Successfully processed order ${orderId} with ${binLocationItems.length} bin locations`);
    await saveProcessedOrder(
      webhookId,
      orderId,
      shop,
      "success",
      `Updated with ${binLocationItems.length} bin locations`,
      formattedText,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown processing error";
    logger.error(`Error processing order ${orderId}: ${message}`);

    // Save error to DB for observability
    try {
      await saveProcessedOrder(webhookId, orderId, shop, "failed", message);
    } catch (dbError) {
      logger.error(
        "Failed to save error to ProcessedOrder table",
        dbError instanceof Error ? dbError.message : dbError,
      );
    }
  }
}

/**
 * Saves a processed order record to the database for idempotency and auditing.
 *
 * @param webhookId - The Shopify webhook ID
 * @param orderId - The order GID
 * @param shop - The shop domain
 * @param status - Processing status
 * @param message - Optional status message or error description
 * @param binLocations - Optional formatted bin location string
 */
async function saveProcessedOrder(
  webhookId: string,
  orderId: string,
  shop: string,
  status: string,
  message: string,
  binLocations: string = "",
): Promise<void> {
  await db.processedOrder.create({
    data: {
      webhookId,
      orderId,
      shop,
      status,
      errorMessage: status === "error" ? message : null,
      binLocations,
    },
  });
}

