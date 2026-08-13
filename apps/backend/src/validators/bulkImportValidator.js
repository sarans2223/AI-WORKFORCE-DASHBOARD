/**
 * Validator for Bulk Student Import payloads
 */

const validateStudentRow = (row, rowIndex) => {
  const errors = [];

  const student_id = row.student_id ? String(row.student_id).trim() : "";
  const name = row.name ? String(row.name).trim() : "";
  const roll_number = row.roll_number ? String(row.roll_number).trim() : "";
  const email = row.email ? String(row.email).trim().toLowerCase() : "";
  const phone = row.phone ? String(row.phone).trim() : null;
  const github_url = row.github_url ? String(row.github_url).trim() : null;

  // 1. student_id is strictly required
  if (!student_id) {
    errors.push("student_id is required");
  }

  // 2. name is required
  if (!name) {
    errors.push("name is required");
  }

  // 3. roll_number is required
  if (!roll_number) {
    errors.push("roll_number is required");
  }

  // 4. email is required and must be valid
  if (!email) {
    errors.push("email is required");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push("invalid email format");
    }
  }

  return {
    isValid: errors.length === 0,
    rowIndex,
    record: {
      student_id,
      name,
      roll_number,
      email,
      phone,
      github_url,
    },
    errors,
  };
};

module.exports = {
  validateStudentRow,
};
