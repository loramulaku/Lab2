/**
 * Convert a string into a URL-safe slug.
 * e.g. "Senior Node.js Developer" → "senior-nodejs-developer"
 *
 * @param {string} text
 * @returns {string}
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')   // strip non-alphanumeric (except spaces & hyphens)
    .replace(/\s+/g, '-')           // spaces → hyphens
    .replace(/-+/g, '-');           // collapse multiple hyphens
}

module.exports = { slugify };
