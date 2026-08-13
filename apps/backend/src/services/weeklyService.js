const studentRepository = require("../repositories/studentRepository");
const activityRepository = require("../repositories/activityRepository");
const attendanceRepository = require("../repositories/attendanceRepository");
const pskillRepository = require("../repositories/pskillRepository");
const leaveRepository = require("../repositories/leaveRepository");

/**
 * Service for Weekly Analysis Business Logic
 * Aggregates REAL data from PostgreSQL repositories to produce structured metrics.
 */

const getWeeklyAnalysis = async (queryParams = {}) => {
  const { student_id, week_start, week_end, date } = queryParams;

  // 1. Validate date params (default to current week if omitted)
  let startDate = week_start;
  let endDate = week_end;

  if (date && (!startDate || !endDate)) {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      const error = new Error("Invalid date format. Use YYYY-MM-DD");
      error.statusCode = 400;
      error.errorCode = "VALIDATION_ERROR";
      throw error;
    }
    // Calculate Monday to Sunday of that week
    const day = d.getDay();
    const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diffToMonday));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    startDate = monday.toISOString().split("T")[0];
    endDate = sunday.toISOString().split("T")[0];
  }

  // 2. Fetch target student(s)
  let students = [];
  if (student_id) {
    const student = await studentRepository.findStudentByStudentId(student_id);
    if (!student) {
      const error = new Error("Referenced student does not exist");
      error.statusCode = 404;
      error.errorCode = "STUDENT_NOT_FOUND";
      throw error;
    }
    students = [student];
  } else {
    students = await studentRepository.findAllStudents();
  }

  // 3. Aggregate real metrics per student
  const studentAnalyses = await Promise.all(
    students.map(async (st) => {
      const sId = st.student_id;

      // Fetch Attendance records in date range
      const attendanceList = await attendanceRepository.findAttendanceRecords({
        student_id: sId,
        start_date: startDate,
        end_date: endDate,
      });

      const totalDays = attendanceList.length;
      const presentDays = attendanceList.filter((a) => a.status === "PRESENT").length;
      const absentDays = attendanceList.filter((a) => a.status === "ABSENT").length;
      const leaveDays = attendanceList.filter((a) => a.status === "LEAVE" || a.status === "ON_DUTY").length;
      const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

      // Fetch Activity progress
      const activities = await activityRepository.findActivitiesByStudentId(sId);
      const totalActivities = activities.length;
      const completedActivities = activities.filter((act) => act.progress_percentage === 100).length;
      const avgProgress =
        totalActivities > 0
          ? Math.round(
              activities.reduce((acc, curr) => acc + (curr.progress_percentage || 0), 0) / totalActivities
            )
          : 0;

      // Fetch P-Skills
      const pskills = await pskillRepository.findStudentPSkills(sId);
      const completedPSkills = pskills.filter((p) => p.status === "COMPLETED").length;

      // Fetch Leave records
      const leaves = await leaveRepository.findLeaveApplications({
        student_id: sId,
        start_date: startDate,
        end_date: endDate,
      });

      return {
        student_id: sId,
        student_name: st.name,
        roll_number: st.roll_number,
        attendance: {
          total_days: totalDays,
          present_days: presentDays,
          absent_days: absentDays,
          leave_days: leaveDays,
          attendance_percentage: attendancePercentage,
        },
        activities: {
          total_assigned: totalActivities,
          completed: completedActivities,
          average_progress_percentage: avgProgress,
        },
        pskills: {
          total_enrolled: pskills.length,
          completed: completedPSkills,
        },
        leave_applications: {
          total_applied: leaves.length,
          approved: leaves.filter((l) => l.status === "APPROVED").length,
          pending: leaves.filter((l) => l.status === "PENDING").length,
        },
      };
    })
  );

  // Overall summary aggregation
  const totalStudents = studentAnalyses.length;
  const overallAttendanceAvg =
    totalStudents > 0
      ? Math.round(
          studentAnalyses.reduce((acc, curr) => acc + curr.attendance.attendance_percentage, 0) / totalStudents
        )
      : 0;

  return {
    period: {
      week_start: startDate || null,
      week_end: endDate || null,
    },
    summary: {
      total_students: totalStudents,
      average_attendance_percentage: overallAttendanceAvg,
    },
    students: studentAnalyses,
  };
};

module.exports = {
  getWeeklyAnalysis,
};
