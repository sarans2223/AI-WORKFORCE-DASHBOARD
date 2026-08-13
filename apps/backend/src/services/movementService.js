const movementRepository = require("../repositories/movementRepository");
const studentRepository = require("../repositories/studentRepository");
const { validateCreateMovementPass, validateUpdateMovementPass } = require("../validators/movementValidator");

/**
 * Service for Movement Pass Business Logic
 */

const createMovementPass = async (passData) => {
  // 1. Validate payload
  const validated = validateCreateMovementPass(passData);

  // 2. Verify student exists
  const student = await studentRepository.findStudentByStudentId(validated.student_id);
  if (!student) {
    const error = new Error("Referenced student does not exist");
    error.statusCode = 404;
    error.errorCode = "STUDENT_NOT_FOUND";
    throw error;
  }

  // 3. Check for overlapping pass (excluding CANCELLED and REJECTED)
  const overlap = await movementRepository.findOverlappingMovementPass(
    validated.student_id,
    validated.out_time,
    validated.in_time
  );
  if (overlap) {
    const error = new Error(
      `A movement pass already exists for the selected time range (conflicts with pass ID ${overlap.id})`
    );
    error.statusCode = 409;
    error.errorCode = "MOVEMENT_PASS_CONFLICT";
    throw error;
  }

  // 4. Create pass in PostgreSQL
  const created = await movementRepository.createMovementPass(validated);
  return created;
};

const getMovementPasses = async (filters = {}) => {
  const passes = await movementRepository.findMovementPasses(filters);
  return passes || [];
};

const getMovementPassById = async (id) => {
  if (!id) {
    const error = new Error("Movement pass ID is required");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  const pass = await movementRepository.findMovementPassById(id);
  if (!pass) {
    const error = new Error("Movement pass not found");
    error.statusCode = 404;
    error.errorCode = "MOVEMENT_PASS_NOT_FOUND";
    throw error;
  }

  return pass;
};

const updateMovementPass = async (id, updateData) => {
  if (!id) {
    const error = new Error("Movement pass ID is required");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  // 1. Verify existence
  const existing = await movementRepository.findMovementPassById(id);
  if (!existing) {
    const error = new Error("Movement pass not found");
    error.statusCode = 404;
    error.errorCode = "MOVEMENT_PASS_NOT_FOUND";
    throw error;
  }

  // 2. Only PENDING passes can be edited
  if (existing.status !== "PENDING") {
    const error = new Error(
      `Cannot update a movement pass with status '${existing.status}'. Only PENDING passes can be edited.`
    );
    error.statusCode = 409;
    error.errorCode = "MOVEMENT_PASS_STATUS_CONFLICT";
    throw error;
  }

  // 3. Validate updates
  const validated = validateUpdateMovementPass(updateData);

  // 4. Check overlap if times are updated
  const effectiveOut = validated.out_time || existing.out_time;
  const effectiveIn  = validated.in_time  || existing.in_time;
  if (validated.out_time || validated.in_time) {
    const overlap = await movementRepository.findOverlappingMovementPass(
      existing.student_id,
      effectiveOut,
      effectiveIn
    );
    if (overlap && String(overlap.id) !== String(id)) {
      const error = new Error(
        `A movement pass already exists for the selected time range (conflicts with pass ID ${overlap.id})`
      );
      error.statusCode = 409;
      error.errorCode = "MOVEMENT_PASS_CONFLICT";
      throw error;
    }
  }

  // 5. Update in DB
  const updated = await movementRepository.updateMovementPass(id, validated);
  return updated;
};

const cancelMovementPass = async (id) => {
  if (!id) {
    const error = new Error("Movement pass ID is required");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  const existing = await movementRepository.findMovementPassById(id);
  if (!existing) {
    const error = new Error("Movement pass not found");
    error.statusCode = 404;
    error.errorCode = "MOVEMENT_PASS_NOT_FOUND";
    throw error;
  }

  if (existing.status === "CANCELLED") {
    const error = new Error("Movement pass is already cancelled");
    error.statusCode = 409;
    error.errorCode = "MOVEMENT_PASS_ALREADY_CANCELLED";
    throw error;
  }

  const cancelled = await movementRepository.updateMovementPassStatus(id, "CANCELLED");
  return cancelled;
};

const approveMovementPass = async (id) => {
  if (!id) {
    const error = new Error("Movement pass ID is required");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  const existing = await movementRepository.findMovementPassById(id);
  if (!existing) {
    const error = new Error("Movement pass not found");
    error.statusCode = 404;
    error.errorCode = "MOVEMENT_PASS_NOT_FOUND";
    throw error;
  }

  const approved = await movementRepository.updateMovementPassStatus(id, "APPROVED");
  return approved;
};

const rejectMovementPass = async (id) => {
  if (!id) {
    const error = new Error("Movement pass ID is required");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  const existing = await movementRepository.findMovementPassById(id);
  if (!existing) {
    const error = new Error("Movement pass not found");
    error.statusCode = 404;
    error.errorCode = "MOVEMENT_PASS_NOT_FOUND";
    throw error;
  }

  const rejected = await movementRepository.updateMovementPassStatus(id, "REJECTED");
  return rejected;
};

module.exports = {
  createMovementPass,
  getMovementPasses,
  getMovementPassById,
  updateMovementPass,
  cancelMovementPass,
  approveMovementPass,
  rejectMovementPass,
};
