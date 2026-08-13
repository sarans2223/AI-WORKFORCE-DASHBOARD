const bulkImportService = require("../services/bulkImportService");
const { sendSuccess } = require("../utils/response");
const { handleError } = require("../middleware/errorMiddleware");

/**
 * Helper to read raw request body as string for CSV parsing
 */
const readRawBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      resolve(body);
    });
    req.on("error", (err) => {
      reject(err);
    });
  });
};

/**
 * Controller for Bulk Student Import APIs
 */
const importStudents = async (req, res) => {
  try {
    const headers = req.headers || {};
    const contentType = headers["content-type"] || "";
    let isCSV = false;
    let payload = null;

    if (contentType.includes("text/csv") || contentType.includes("application/csv")) {
      isCSV = true;
      payload = await readRawBody(req);
    } else {
      const rawText = await readRawBody(req);
      try {
        payload = JSON.parse(rawText);
      } catch (err) {
        // If content-type wasn't explicit CSV but body looks like CSV
        if (rawText.includes(",")) {
          isCSV = true;
          payload = rawText;
        } else {
          const error = new Error("Invalid JSON or CSV request body format");
          error.statusCode = 400;
          error.errorCode = "VALIDATION_ERROR";
          throw error;
        }
      }
    }

    const result = await bulkImportService.processBulkImport(payload, isCSV);
    return sendSuccess(res, 200, "Bulk student import processed successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

module.exports = {
  importStudents,
};
