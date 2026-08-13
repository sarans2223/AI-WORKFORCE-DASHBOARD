const bulkImportController = require("../controllers/bulkImportController");

/**
 * Route handler for Bulk Student Import endpoints
 *
 * Routes:
 *   POST /api/students/bulk-import  - Import multiple students from CSV or JSON
 *   POST /api/students/import       - Alias for bulk import
 */
const handleBulkImportRoutes = async (req, res, pathName, method) => {
  if (
    method === "POST" &&
    (pathName === "/api/students/bulk-import" ||
      pathName === "/api/students/bulk-import/" ||
      pathName === "/api/students/import" ||
      pathName === "/api/students/import/")
  ) {
    await bulkImportController.importStudents(req, res);
    return true;
  }

  return false;
};

module.exports = handleBulkImportRoutes;
