/**
 * Indian Rupee Currency Formatting Utility
 * Formats amounts using Indian numbering system (lakhs, crores)
 */

/**
 * Format a number as Indian Rupees with proper Indian numbering
 * Examples:
 *   formatINR(1) → "₹1.00"
 *   formatINR(299) → "₹299.00"
 *   formatINR(2500) → "₹2,500"
 *   formatINR(50000) → "₹50,000"
 *   formatINR(100000) → "₹1,00,000"
 *   formatINR(2500000) → "₹25,00,000"
 */
export function formatINR(amount: number, showDecimals: boolean = false): string {
  if (amount === 0) return "₹0";

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  if (showDecimals || absAmount < 100) {
    // Use Intl for small amounts with decimals
    const formatted = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(absAmount);
    return isNegative ? `-${formatted}` : formatted;
  }

  // Indian numbering format without decimals
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absAmount);
  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Format amount for display without currency symbol
 * Uses Indian numbering system
 */
export function formatIndianNumber(amount: number): string {
  return new Intl.NumberFormat("en-IN").format(amount);
}
