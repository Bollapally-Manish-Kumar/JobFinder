/**
 * Helper utilities
 */

/**
 * Sleep for specified milliseconds
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate random string
 */
export const randomString = (length = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Format date for display
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Truncate string with ellipsis
 */
export const truncate = (str, length = 100) => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
};

/**
 * Calculate subscription expiry date
 */
export const calculateExpiry = (days = 30) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

/**
 * Check if date is expired
 */
export const isExpired = (date) => {
  if (!date) return true;
  return new Date() > new Date(date);
};
