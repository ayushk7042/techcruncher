const { escapeHtml } = require("./escapeHtml");

const isSectionTitle = (line) =>
  line.length <= 80 && /[A-Z]/.test(line) && !/[a-z]/.test(line) && !/[.!?]$/.test(line);

const toTitleCase = (line) => line.toLowerCase().replace(/(^|\s)\S/g, (char) => char.toUpperCase());

/**
 * Converts AI output — plain paragraphs with CAPITALISED section titles, or
 * light markdown (## / ###) — into the article HTML the editor and site render.
 * A first line that repeats the article title is dropped.
 */
const articleTextToHtml = (text = "", title = "") => {
  const lines = String(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines[0] && lines[0].replace(/^#+\s*/, "").toLowerCase() === String(title).trim().toLowerCase()) {
    lines.shift();
  }

  return lines
    .map((line) => {
      if (line.startsWith("### ")) return `<h3>${escapeHtml(line.slice(4))}</h3>`;
      if (line.startsWith("## ")) return `<h2>${escapeHtml(line.slice(3))}</h2>`;
      if (isSectionTitle(line)) return `<h2>${escapeHtml(toTitleCase(line))}</h2>`;
      return `<p>${escapeHtml(line.replace(/^[-*]\s+/, ""))}</p>`;
    })
    .join("\n");
};

module.exports = { articleTextToHtml };
