/**
 * Refund request protocol — human-friendly, unique per purchase, referenced across
 * customer emails, receipts, /reembolso success screen, and admin panel.
 * Format: REE-{purchaseId}-{YYYY} (e.g. REE-42-2026)
 */
export function formatRefundProtocol(purchaseId: number, createdAt: Date | string): string {
  const year = new Date(createdAt).getFullYear();
  return `REE-${purchaseId}-${year}`;
}
