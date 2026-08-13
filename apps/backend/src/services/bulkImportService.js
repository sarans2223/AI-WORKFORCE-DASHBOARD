const bulkImportRepository = require("../repositories/bulkImportRepository");
const { validateStudentRow } = require("../validators/bulkImportValidator");
const { parseCSV } = require("../utils/csvParser");

/**
 * Service for Bulk Student Import Business Logic
 */

const processBulkImport = async (rawInput, isCSV = false) => {
  let records = [];

  // 1. Parse payload into records array
  if (isCSV) {
    records = parseCSV(rawInput);
  } else if (Array.isArray(rawInput)) {
    records = rawInput;
  } else if (rawInput && Array.isArray(rawInput.students)) {
    records = rawInput.students;
  } else {
    const error = new Error("Invalid request body. Expected an array of students or CSV string.");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  if (records.length === 0) {
    const error = new Error("No student records found in import payload.");
    error.statusCode = 400;
    error.errorCode = "VALIDATION_ERROR";
    throw error;
  }

  const validRecords = [];
  const failedRows = [];
  const seenStudentIds = new Set();
  const seenRollNumbers = new Set();
  const seenEmails = new Set();

  // 2. Row-by-row validation & in-file duplicate detection
  records.forEach((row, idx) => {
    const rowNum = idx + 1;
    const validation = validateStudentRow(row, rowNum);

    if (!validation.isValid) {
      failedRows.push({
        row: rowNum,
        student_id: validation.record.student_id || null,
        message: validation.errors.join(", "),
      });
      return;
    }

    const { student_id, roll_number, email } = validation.record;

    // Check duplicate within uploaded file
    if (seenStudentIds.has(student_id)) {
      failedRows.push({
        row: rowNum,
        student_id,
        message: `Duplicate student_id '${student_id}' in import payload`,
      });
      return;
    }
    if (seenRollNumbers.has(roll_number)) {
      failedRows.push({
        row: rowNum,
        student_id,
        message: `Duplicate roll_number '${roll_number}' in import payload`,
      });
      return;
    }
    if (seenEmails.has(email)) {
      failedRows.push({
        row: rowNum,
        student_id,
        message: `Duplicate email '${email}' in import payload`,
      });
      return;
    }

    seenStudentIds.add(student_id);
    seenRollNumbers.add(roll_number);
    seenEmails.add(email);
    validRecords.push(validation.record);
  });

  // 3. Database duplicate check against PostgreSQL
  if (validRecords.length > 0) {
    const studentIdsArr = validRecords.map((r) => r.student_id);
    const rollNumsArr = validRecords.map((r) => r.roll_number);
    const emailsArr = validRecords.map((r) => r.email);

    const dbExisting = await bulkImportRepository.findExistingStudentIdentifiers(
      studentIdsArr,
      rollNumsArr,
      emailsArr
    );

    if (dbExisting && dbExisting.length > 0) {
      const dbStudentIds = new Set(dbExisting.map((e) => e.student_id));
      const dbRollNums = new Set(dbExisting.map((e) => e.roll_number));
      const dbEmails = new Set(dbExisting.map((e) => e.email.toLowerCase()));

      for (let i = validRecords.length - 1; i >= 0; i--) {
        const rec = validRecords[i];
        if (
          dbStudentIds.has(rec.student_id) ||
          dbRollNums.has(rec.roll_number) ||
          dbEmails.has(rec.email)
        ) {
          failedRows.push({
            row: rec.rowIndex || "DB",
            student_id: rec.student_id,
            message: `Student with matching student_id/roll_number/email already exists in database`,
          });
          validRecords.splice(i, 1);
        }
      }
    }
  }

  // 4. Perform batch insertion for valid records
  let insertedRecords = [];
  if (validRecords.length > 0) {
    insertedRecords = await bulkImportRepository.bulkInsertStudents(validRecords);
  }

  return {
    total: records.length,
    successful: insertedRecords.length,
    failed: failedRows.length,
    records: insertedRecords,
    errors: failedRows,
  };
};

module.exports = {
  processBulkImport,
};
