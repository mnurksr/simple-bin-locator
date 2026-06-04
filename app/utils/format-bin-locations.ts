/**
 * Utility for formatting bin location data into a human-readable string
 * suitable for order notes in the Shopify admin.
 * @module
 */

/** Shape of a single line item with its bin location info. */
export interface BinLocationLineItem {
  sku: string;
  productTitle: string;
  variantTitle: string;
  binLocation: string;
  quantity: number;
}

/**
 * Formats an array of bin location line items into a structured, readable string
 * for embedding in Shopify order notes.
 *
 * Items are sorted alphabetically by bin location to optimize warehouse picking routes.
 *
 * @param items - Array of line items with bin location data
 * @returns Formatted string with bin locations, or empty string if no items
 *
 * @example
 * ```
 * 📦 BIN LOCATIONS:
 * • [SKU-001] Ürün Adı (Varyant) → A-12-3 (x2)
 * • [SKU-002] Diğer Ürün (Varyant) → B-05-1 (x1)
 * ```
 */
export function formatBinLocations(items: BinLocationLineItem[]): string {
  if (!items || items.length === 0) {
    return "";
  }

  // Filter out items without a bin location
  const itemsWithBins = items.filter(
    (item) => item.binLocation && item.binLocation.trim() !== "",
  );

  if (itemsWithBins.length === 0) {
    return "";
  }

  // Sort alphabetically by bin location for efficient warehouse picking
  const sorted = [...itemsWithBins].sort((a, b) =>
    a.binLocation.localeCompare(b.binLocation),
  );

  const lines = sorted.map((item) => {
    const sku = item.sku || "SKU_YOK";
    const variant =
      item.variantTitle && item.variantTitle !== "Default Title"
        ? ` (${item.variantTitle})`
        : "";
    return `• [${sku}] ${item.productTitle}${variant} → ${item.binLocation} (x${item.quantity})`;
  });

  return `📦 BIN LOCATIONS:\n${lines.join("\n")}`;
}
