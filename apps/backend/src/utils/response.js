/**
 * Utility functions for Core Node.js HTTP Server responses and request processing
 */

const setCORSHeaders = (res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
};

const sendJSON = (res, statusCode, data) => {
  setCORSHeaders(res);
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
};

const sendSuccess = (res, statusCode = 200, message = "Success", data = null, pagination = null) => {
  const payload = {
    success: true,
    message,
  };

  if (data !== null && data !== undefined) {
    payload.data = data;
  }

  if (pagination) {
    payload.pagination = pagination;
  }

  sendJSON(res, statusCode, payload);
};

const sendError = (res, statusCode = 500, message = "Internal Server Error", errorCode = "INTERNAL_ERROR") => {
  const payload = {
    success: false,
    message,
    error: errorCode,
  };

  sendJSON(res, statusCode, payload);
};

const parseJSONBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      if (!body) {
        return resolve({});
      }
      try {
        const parsed = JSON.parse(body);
        resolve(parsed);
      } catch (err) {
        reject(new Error("INVALID_JSON"));
      }
    });
    req.on("error", (err) => {
      reject(err);
    });
  });
};

module.exports = {
  setCORSHeaders,
  sendJSON,
  sendSuccess,
  sendError,
  parseJSONBody,
};
