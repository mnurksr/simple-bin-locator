/**
 * Service for reading and updating Shopify order notes.
 * Preserves existing note content and appends bin location information.
 * @module
 */

import {
  UPDATE_ORDER_NOTE,
  type OrderUpdateResponse,
} from "~/graphql/mutations/update-order-note";
import { logger } from "~/utils/logger";

/** Inline query to fetch the current note of an order. */
const GET_ORDER_NOTE = `#graphql
  query GetOrderNote($id: ID!) {
    order(id: $id) {
      id
      note
    }
  }
`;

/** Response shape for the inline order note query. */
interface GetOrderNoteResponse {
  data: {
    order: {
      id: string;
      note: string | null;
    } | null;
  };
}

/** Result shape returned by updateOrderNote. */
export interface UpdateOrderNoteResult {
  success: boolean;
  error?: string;
}

/**
 * Updates an order's note by appending bin location text.
 *
 * If the order already has a note, the bin location text is appended
 * below a separator (`\n\n---\n`). If no existing note, the bin location
 * text becomes the entire note.
 *
 * @param admin - The GraphQL client (i.e. `admin.graphql`)
 * @param orderId - The order GID (e.g. `gid://shopify/Order/123`)
 * @param binLocationText - Formatted bin location string to append
 * @returns Object with `success` boolean and optional `error` message
 */
export async function updateOrderNote(
  admin: { graphql: (query: string, options?: { variables: Record<string, unknown> }) => Promise<Response> },
  orderId: string,
  binLocationText: string,
): Promise<UpdateOrderNoteResult> {
  try {
    logger.info(`Updating order note for ${orderId}`);

    // Step 1: Fetch the existing order note
    const existingResponse = await admin.graphql(GET_ORDER_NOTE, {
      variables: { id: orderId },
    });
    const existingJson: GetOrderNoteResponse = await existingResponse.json();
    const existingNote = existingJson?.data?.order?.note ?? "";

    // Step 2: Build combined note — preserve existing content
    let combinedNote: string;
    if (existingNote && existingNote.trim() !== "") {
      combinedNote = `${existingNote}\n\n---\n${binLocationText}`;
    } else {
      combinedNote = binLocationText;
    }

    // Step 3: Update the order with the combined note
    const updateResponse = await admin.graphql(UPDATE_ORDER_NOTE, {
      variables: {
        input: {
          id: orderId,
          note: combinedNote,
        },
      },
    });

    const updateJson: OrderUpdateResponse = await updateResponse.json();
    const userErrors = updateJson?.data?.orderUpdate?.userErrors ?? [];

    if (userErrors.length > 0) {
      const errorMessages = userErrors
        .map((e: { field?: string[]; message: string }) => `${e.field?.join(".")}: ${e.message}`)
        .join("; ");
      logger.error(`Order update user errors: ${errorMessages}`);
      return { success: false, error: errorMessages };
    }

    logger.info(`Successfully updated note for order ${orderId}`);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error updating order note";
    logger.error(`Failed to update order note for ${orderId}: ${message}`);
    return { success: false, error: message };
  }
}
