import * as XLSX from 'xlsx'
import { format, parseISO } from 'date-fns'

/**
 * Generates and downloads a clean, minimal Excel (.xlsx) sheet for attendance on a specific date.
 * Columns: S.No, Roll Number, Name, Forenoon, Afternoon
 * 
 * @param {Object} params
 * @param {string} params.date - 'YYYY-MM-DD'
 * @param {Array} params.students - List of student objects { id, name, registerNumber }
 * @param {Object} params.attendance - { forenoon: { records: [...] }, afternoon: { records: [...] } }
 */
export function exportAttendanceExcel({ date, students = [], attendance = {} }) {
  const dateObj = typeof date === 'string' && date.includes('-') ? parseISO(date) : new Date(date)
  const fileDateStr = isNaN(dateObj.getTime()) ? date : format(dateObj, 'yyyy-MM-dd')

  const fnMap = {}
  const anMap = {}

  if (attendance.forenoon?.records) {
    attendance.forenoon.records.forEach(r => {
      fnMap[String(r.studentId)] = r.status
    })
  }

  if (attendance.afternoon?.records) {
    attendance.afternoon.records.forEach(r => {
      anMap[String(r.studentId)] = r.status
    })
  }

  // Sort students alphabetically by name
  const sortedStudents = [...students].sort((a, b) => (a.name || '').localeCompare(b.name || ''))

  const tableRows = sortedStudents.map((s, idx) => {
    const fnStatus = fnMap[String(s.id)] === 'PRESENT' ? 'Present' : 'Absent'
    const anStatus = anMap[String(s.id)] === 'PRESENT' ? 'Present' : 'Absent'

    return {
      'S.No': idx + 1,
      'Roll Number': s.registerNumber || s.roll_number || '',
      'Name': s.name || '',
      'Forenoon': fnStatus,
      'Afternoon': anStatus
    }
  })

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(tableRows)

  // Set clean column widths
  ws['!cols'] = [
    { wch: 6 },  // S.No
    { wch: 18 }, // Roll Number
    { wch: 28 }, // Name
    { wch: 15 }, // Forenoon
    { wch: 15 }  // Afternoon
  ]

  // Create workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance')

  // Trigger download
  XLSX.writeFile(wb, `Attendance_${fileDateStr}.xlsx`)
}
