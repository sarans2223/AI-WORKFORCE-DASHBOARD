const weeklyService = require("../services/weeklyService");
const { sendSuccess } = require("../utils/response");
const { handleError } = require("../middleware/errorMiddleware");

/**
 * Controller for Weekly Analysis APIs
 */

const getWeeklyAnalysis = async (req, res, queryParams = {}) => {
  try {
    const result = await weeklyService.getWeeklyAnalysis(queryParams);
    return sendSuccess(res, 200, "Weekly analysis generated successfully", result);
  } catch (err) {
    handleError(err, req, res);
  }
};

module.exports = {
  getWeeklyAnalysis,
};
