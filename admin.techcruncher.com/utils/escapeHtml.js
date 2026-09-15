const ENTITIES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/** Escapes text for safe interpolation into HTML (emails, generated content). */
const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ENTITIES[char]);

/** Escapes text for literal use inside a RegExp. */
const escapeRegex = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = { escapeHtml, escapeRegex };
