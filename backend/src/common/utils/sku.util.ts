/**
 * Generates a unique, human-readable SKU.
 *
 * Format: <PREFIX>-<YYYYMMDD>-<RAND5>
 * Example: BOTTL-20260411-A3F2C
 *
 * @param productName - Used to derive a short, readable prefix
 */
export function generateSku(productName: string): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    const prefix = productName
        .trim()
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 6)
        .toUpperCase();
    return `${prefix || 'SKU'}-${date}-${rand}`;
}
