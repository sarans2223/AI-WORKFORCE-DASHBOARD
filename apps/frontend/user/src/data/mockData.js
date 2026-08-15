import { addDays, subDays, format, startOfWeek } from 'date-fns'

const today = new Date()
const todayStr = format(today, 'yyyy-MM-dd')

// ─── Student Profile ───────────────────────────────────────────────────────────
// Keeping basic student metadata profile structure so application does not crash
export const mockProfile = {
  id: 'STU-2024-001',
  name: 'Priya Ramesh',
  registerNumber: '22CS101',
  email: 'priya.ramesh@college.edu',
  phone: '+91 98765 43210',
  github: 'https://github.com/priya-ramesh',
  department: 'Computer Science',
  year: '3rd Year',
  section: 'A',
}

// ─── Activities ────────────────────────────────────────────────────────────────
export const mockActivities = []

// ─── P-Skills ──────────────────────────────────────────────────────────────────
// Retaining P-Skills catalog names with clean completion states as requested
export const mockPSkills = [
  { id: 'ps-1', name: 'Algebra', description: 'Mathematical concepts and algebraic structures.', category: 'Math', completedLevels: [], availableLevels: ['Level 1', 'Level 2', 'Level 3'] },
  { id: 'ps-2', name: 'Aptitude', description: 'Quantitative and qualitative aptitude concepts.', category: 'General', completedLevels: [], availableLevels: [
    '1A - Ratio',
    '1B - Mixtures',
    '1C - Percentage',
    '1D - Time & Work',
    '1E - Averages',
    '1F - Speed & Dist',
    '1G - Probability',
    '1H - Ages',
    '1I - Clocks',
    '1J - LCM & HCF',
    '1K - Fractions',
    '1L - Roots',
    '1M - Stocks',
    '1N - Area & Vol'
  ] },
  { id: 'ps-3', name: 'C - Programming', description: 'System-level programming with C.', category: 'Programming', completedLevels: [], availableLevels: ['Level 1', 'Level 2', 'Level 3A', 'Level 3B', 'Level 4', 'Level 5', 'Level 6'] },
  { id: 'ps-4', name: 'Cloud Infrastructure', description: 'Cloud computing and resource management.', category: 'Infrastructure', completedLevels: [], availableLevels: ['Completed'] },
  { id: 'ps-5', name: 'Computer Networking', description: 'Network layers, protocols, and architecture.', category: 'Networking', completedLevels: [], availableLevels: ['Completed'] },
  { id: 'ps-6', name: 'Cybersecurity', description: 'Security principles and vulnerability management.', category: 'Security', completedLevels: [], availableLevels: ['Level 1'] },
  { id: 'ps-7', name: 'Data Structure (Core Concepts)', description: 'Fundamental data structure concepts.', category: 'Computer Science', completedLevels: [], availableLevels: ['Level 1', 'Level 2', 'Level 3'] },
  { id: 'ps-8', name: 'Data Structure', description: 'Advanced data structures and implementations.', category: 'Computer Science', completedLevels: [], availableLevels: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6', 'Level 7', 'Level 8', 'Level 9', 'Level 10', 'Level 11'] },
  { id: 'ps-9', name: 'Database Programming', description: 'SQL and programmatic database access.', category: 'Database', completedLevels: [], availableLevels: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6'] },
  { id: 'ps-10', name: 'DBMS', description: 'Database management system architecture.', category: 'Database', completedLevels: [], availableLevels: ['Level 1', 'Level 2', 'Level 3'] },
  { id: 'ps-11', name: 'HTML / CSS', description: 'Frontend web structuring and styling.', category: 'Web Development', completedLevels: [], availableLevels: ['Completed'] },
  { id: 'ps-12', name: 'JavaScript', description: 'Dynamic web scripting language.', category: 'Web Development', completedLevels: [], availableLevels: ['Level 1'] },
  { id: 'ps-13', name: 'Linux', description: 'Linux operating system concepts and CLI.', category: 'OS', completedLevels: [], availableLevels: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'] },
  { id: 'ps-14', name: 'Node JS', description: 'Backend JavaScript runtime environment.', category: 'Web Development', completedLevels: [], availableLevels: ['Level 1'] },
  { id: 'ps-15', name: 'C++', description: 'Object-oriented programming with C++.', category: 'Programming', completedLevels: [], availableLevels: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6', 'Level 7', 'Level 8', 'Level 9', 'Level 10'] },
  { id: 'ps-16', name: 'Python', description: 'High-level programming with Python.', category: 'Programming', completedLevels: [], availableLevels: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'] },
  { id: 'ps-17', name: 'Git', description: 'Version control system workflows.', category: 'Tools', completedLevels: [], availableLevels: ['Completed'] },
  { id: 'ps-18', name: 'React', description: 'Frontend UI library for web development.', category: 'Web Development', completedLevels: [], availableLevels: ['Completed'] },
  { id: 'ps-19', name: 'System Administration', description: 'Managing IT systems and servers.', category: 'Administration', completedLevels: [], availableLevels: ['Level 1', 'Level 2', 'Level 3', 'Level 4'] },
  { id: 'ps-20', name: 'UI/UX', description: 'User interface and experience design.', category: 'Design', completedLevels: [], availableLevels: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'] }
].map(s => ({ ...s, completion: 0 }))

// ─── Attendance ────────────────────────────────────────────────────────────────
export const mockAttendance = []

// ─── Leave History ─────────────────────────────────────────────────────────────
export const mockLeaves = []

// ─── Movement Passes Config & Mock ─────────────────────────────────────────────
export const PSKILL_SLOTS = {
  'P-Skill Slot A': { label: 'P-Skill Slot A', timing: '10:00 AM – 11:00 AM' },
  'P-Skill Slot B': { label: 'P-Skill Slot B', timing: '11:00 AM – 12:00 PM' },
  'P-Skill Slot C': { label: 'P-Skill Slot C', timing: '02:00 PM – 03:00 PM' },
}

export const MOVEMENT_TYPES = [
  'Library',
  'Medical Center',
  'Administrative Office',
  'Lab',
  'P-Skill Activity',
  'Other',
]

export const SLOTS = [
  'Morning Slot (8:00 AM – 10:00 AM)',
  'P-Skill Slot A',
  'P-Skill Slot B',
  'Afternoon Slot (12:00 PM – 02:00 PM)',
  'P-Skill Slot C',
  'Evening Slot (04:00 PM – 06:00 PM)',
]

export const mockMovementPasses = []

// ─── Notifications ─────────────────────────────────────────────────────────────
export const mockNotifications = []

// ─── Assigned Tasks ─────────────────────────────────────────────────────────────
export const mockAssignedTasks = []

// ─── Project Info ───────────────────────────────────────────────────────────────
export const mockProject = null
