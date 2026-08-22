const { query } = require("../db/connection");

/**
 * Repository for PostgreSQL leave_applications table.
 *
 * Table columns:
 *   id
 *   student_id
 *   start_date
 *   end_date
 *   start_time
 *   end_time
 *   reason
 *   created_at
 */

const findLeaveById = async (id) => {
  const sql = `
    SELECT
      id,
      student_id,
      start_date::text AS start_date,
      end_date::text AS end_date,
      start_time::text AS start_time,
      end_time::text AS end_time,
      reason,
      created_at
    FROM leave_applications
    WHERE id = $1
    LIMIT 1;
  `;

  const result = await query(sql, [id]);
  return result.rows[0] || null;
};


const findLeaveApplications = async (filters = {}) => {
  let sql = `
    SELECT
      id,
      student_id,
      start_date::text AS start_date,
      end_date::text AS end_date,
      start_time::text AS start_time,
      end_time::text AS end_time,
      reason,
      created_at
    FROM leave_applications
  `;

  const conditions = [];
  const values = [];

  if (filters.student_id) {
    values.push(filters.student_id);
    conditions.push(`student_id = $${values.length}`);
  }

  if (filters.start_date) {
    values.push(filters.start_date);
    conditions.push(`start_date >= $${values.length}`);
  }

  if (filters.end_date) {
    values.push(filters.end_date);
    conditions.push(`end_date <= $${values.length}`);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ` + conditions.join(" AND ");
  }

  sql += ` ORDER BY created_at DESC;`;

  const result = await query(sql, values);
  return result.rows;
};


/**
 * Check whether a student already has an overlapping leave
 * for the same date/time period.
 */
const findOverlappingLeave = async (
  studentId,
  startDate,
  endDate,
  startTime,
  endTime
) => {
  const sql = `
    SELECT
      id,
      student_id,
      start_date::text AS start_date,
      end_date::text AS end_date,
      start_time::text AS start_time,
      end_time::text AS end_time,
      reason
    FROM leave_applications
    WHERE student_id = $1

      AND start_date <= $3
      AND end_date >= $2

      AND (
        start_time IS NULL
        OR end_time IS NULL
        OR $4::time < end_time
        AND $5::time > start_time
      )

    LIMIT 1;
  `;

  const result = await query(sql, [
    studentId,
    startDate,
    endDate,
    startTime,
    endTime,
  ]);

  return result.rows[0] || null;
};


const createLeaveApplication = async ({
  student_id,
  start_date,
  end_date,
  start_time,
  end_time,
  reason,
}) => {
  const sql = `
    INSERT INTO leave_applications
      (
        student_id,
        start_date,
        end_date,
        start_time,
        end_time,
        reason,
        created_at
      )
    VALUES
      ($1, $2, $3, $4, $5, $6, NOW())

    RETURNING
      id,
      student_id,
      start_date::text AS start_date,
      end_date::text AS end_date,
      start_time::text AS start_time,
      end_time::text AS end_time,
      reason,
      created_at;
  `;

  const values = [
    student_id,
    start_date,
    end_date,
    start_time,
    end_time,
    reason,
  ];

  const result = await query(sql, values);
  return result.rows[0];
};


const updateLeaveApplication = async (id, fields) => {
  const sql = `
    UPDATE leave_applications
    SET
      reason = COALESCE($1, reason),
      start_date = COALESCE($2, start_date),
      end_date = COALESCE($3, end_date),
      start_time = COALESCE($4, start_time),
      end_time = COALESCE($5, end_time)

    WHERE id = $6

    RETURNING
      id,
      student_id,
      start_date::text AS start_date,
      end_date::text AS end_date,
      start_time::text AS start_time,
      end_time::text AS end_time,
      reason,
      created_at;
  `;

  const values = [
    fields.reason || null,
    fields.start_date || null,
    fields.end_date || null,
    fields.start_time || null,
    fields.end_time || null,
    id,
  ];

  const result = await query(sql, values);
  return result.rows[0];
};


const deleteLeaveApplication = async (id) => {
  const sql = `
    DELETE FROM leave_applications
    WHERE id = $1

    RETURNING
      id,
      student_id,
      start_date::text AS start_date,
      end_date::text AS end_date,
      start_time::text AS start_time,
      end_time::text AS end_time,
      reason,
      created_at;
  `;

  const result = await query(sql, [id]);
  return result.rows[0];
};


module.exports = {
  findLeaveById,
  findLeaveApplications,
  findOverlappingLeave,
  createLeaveApplication,
  updateLeaveApplication,
  deleteLeaveApplication,
};