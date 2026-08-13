/**
 * CSV and JSON string parser utilities for Bulk Student Import
 */

const parseCSV = (csvText) => {
  if (!csvText || typeof csvText !== "string") return [];

  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) return [];

  // Helper to split CSV row respecting quotes
  const splitRow = (rowStr) => {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < rowStr.length; i++) {
      const char = rowStr[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = splitRow(lines[0]).map((h) => h.toLowerCase().replace(/^"|"$/g, ""));
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const rowValues = splitRow(lines[i]).map((v) => v.replace(/^"|"$/g, ""));
    const rowObj = {};
    headers.forEach((header, idx) => {
      rowObj[header] = rowValues[idx] !== undefined ? rowValues[idx] : "";
    });
    records.push(rowObj);
  }

  return records;
};

module.exports = {
  parseCSV,
};
