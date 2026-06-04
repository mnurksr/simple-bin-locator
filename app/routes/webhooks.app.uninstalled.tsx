import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Webhook requests can trigger multiple times and after an app has already been uninstalled.
  // If this webhook already ran, the session may have been deleted previously.
  if (session) {
    await db.session.deleteMany({ where: { shop } });
  }

  // Also delete the shop's AppSettings and ProcessedOrders so that if they reinstall, they start fresh.
  try {
    await db.appSettings.deleteMany({ where: { shop } });
    await db.processedOrder.deleteMany({ where: { shop } });
    console.log(`Successfully cleared data for uninstalled shop: ${shop}`);
  } catch (error) {
    console.error(`Error clearing data for uninstalled shop ${shop}:`, error);
  }

  return new Response();
};
