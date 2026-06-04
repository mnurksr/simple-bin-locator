/**
 * Webhook handler route for the `orders/create` topic.
 * Receives new order webhooks from Shopify and triggers bin location processing.
 *
 * This route always returns HTTP 200 to prevent Shopify from retrying
 * on application-level errors (only infrastructure failures should cause retries).
 * @module
 */

import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { processOrderBinLocations } from "../services/webhook-processor.service";
import { logger } from "../utils/logger";

/**
 * Handles incoming orders/create webhook POST requests.
 *
 * Flow:
 * 1. Authenticate the webhook request via Shopify HMAC verification
 * 2. Verify the admin API client is available (not available if app was uninstalled)
 * 3. Extract the webhook ID header for idempotency
 * 4. Delegate processing to the webhook processor service
 * 5. Always return 200 to acknowledge receipt
 */
export async function action({ request }: ActionFunctionArgs) {
  try {
    const { shop, topic, payload, admin } = await authenticate.webhook(request);

    logger.info(`Received ${topic} webhook from ${shop}`);

    // Admin may not exist if the app was uninstalled but webhooks are still firing
    if (!admin) {
      logger.warn(
        `No admin API client available for ${shop} — app may have been uninstalled`,
      );
      return new Response("OK", { status: 200 });
    }

    // Extract the webhook ID for idempotency
    const webhookId = request.headers.get("X-Shopify-Webhook-Id") ?? "";
    if (!webhookId) {
      logger.warn("Missing X-Shopify-Webhook-Id header, processing anyway");
    }

    // Process the order bin locations asynchronously
    await processOrderBinLocations({
      admin: admin.graphql,
      shop,
      payload: payload as Parameters<typeof processOrderBinLocations>[0]["payload"],
      webhookId,
    });

    return new Response("OK", { status: 200 });
  } catch (error) {
    // Always return 200 to prevent Shopify from retrying on app-level errors.
    // Infrastructure-level failures (e.g. HMAC mismatch) will throw before we
    // reach this point and will naturally return non-200.
    logger.error(
      "Unhandled error in orders/create webhook handler",
      error instanceof Error ? error.message : error,
    );
    return new Response("OK", { status: 200 });
  }
}
