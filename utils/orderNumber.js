/**
 * Generates a unique order number.
 * This is a placeholder. In a real application, this should be a robust
 * system to ensure uniqueness, e.g., combining timestamp and a random sequence.
 * @returns {Promise<string>} A unique order number.
 */
export const generateOrderNumber = async () => {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${timestamp}-${randomPart}`;
};
