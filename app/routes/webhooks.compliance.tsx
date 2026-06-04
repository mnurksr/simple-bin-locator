import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

/**
 * GDPR Compliance Webhook Handler
 *
 * Handles mandatory Shopify compliance webhooks:
 * - CUSTOMERS_DATA_REQUEST: Provide customer data upon request
 * - CUSTOMERS_REDACT: Delete/anonymize customer data
 * - SHOP_REDACT: Delete all shop data (48h after uninstall)
 *
 * These are required for Shopify App Store approval.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  console.log(`[BinLocator] Received compliance webhook: ${topic} for ${shop}`);

  switch (topic) {
    case "CUSTOMERS_DATA_REQUEST":
      // Simple Bin Locator does not store any personal customer data.
      // We only store order IDs and bin locations in ProcessedOrder.
      // Respond with acknowledgment — no customer data to export.
      console.log(
        `[BinLocator] CUSTOMERS_DATA_REQUEST for ${shop} — no customer data stored`
      );
      break;

    case "CUSTOMERS_REDACT":
      // Simple Bin Locator does not store personal customer data.
      // ProcessedOrder records contain only order IDs and bin locations.
      // No action needed, but we log the request for compliance auditing.
      console.log(
        `[BinLocator] CUSTOMERS_REDACT for ${shop} — no customer data to redact`
      );
      break;

    case "SHOP_REDACT":
      // Triggered 48 hours after app uninstall.
      // Delete ALL data associated with this shop from our database.
      console.log(
        `[BinLocator] SHOP_REDACT for ${shop} — deleting all shop data`
      );

      try {
        // Delete all processed order records for this shop
        const deletedOrders = await db.processedOrder.deleteMany({
          where: { shop },
        });
        console.log(
          `[BinLocator] Deleted ${deletedOrders.count} processed order records for ${shop}`
        );

        // Delete app settings for this shop
        await db.appSettings
          .deleteMany({
            where: { shop },
          })
          .catch(() => {
            // Settings may not exist, that's fine
          });

        console.log(
          `[BinLocator] SHOP_REDACT complete for ${shop}`
        );
      } catch (error) {
        console.error(
          `[BinLocator] Error during SHOP_REDACT for ${shop}:`,
          error
        );
        // Still return 200 — we don't want Shopify to keep retrying
      }
      break;

    default:
      console.warn(`[BinLocator] Unhandled compliance topic: ${topic}`);
      break;
  }

  return new Response("OK", { status: 200 });
};
