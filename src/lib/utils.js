/**
 * Utility functions shared across services.
 * Centralized formatting, generation helpers.
 */

/**
 * Format a price with currency
 * @param {number} amount
 * @param {string} currency
 */
export function formatPrice(amount, currency = "EGP") {
  if (amount === 0 || amount === "0") return `Free`;
  const num = Number(amount);
  if (isNaN(num)) return `— ${currency}`;
  return `${num.toLocaleString("en-EG")} ${currency}`;
}

/**
 * Format a date string to a human-readable format
 * @param {string|Date} value
 * @param {string} locale
 */
export function formatDate(value, locale = "en-EG") {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(value);
  }
}

/**
 * Format a datetime string
 */
export function formatDateTime(value, locale = "en-EG") {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(value);
  }
}

/**
 * Generate a license key in format: EXL-YYYY-XXXX-XXXX
 */
export function generateLicenseKey() {
  const year = new Date().getFullYear();
  const rand = () => Math.random().toString(36).toUpperCase().slice(2, 6);
  return `EXL-${year}-${rand()}-${rand()}`;
}

/**
 * Generate an order number in format: ORD-YYYYMMDD-NNNN
 * @param {number|string} id
 */
export function generateOrderNumber(id) {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const seq = String(id || "0").padStart(4, "0");
  return `ORD-${date}-${seq}`;
}

/**
 * Generate a slug from a string
 */
export function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Parse a comma-separated string into an array
 */
export function parseTags(value) {
  return String(value || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * Truncate text to a max length
 */
export function truncate(text, max = 120) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

/**
 * Get discount percentage
 */
export function getDiscountPercent(price, oldPrice) {
  if (!oldPrice || !price || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}
