import { addDays, subDays, format, startOfWeek } from 'date-fns'

const today = new Date()
const todayStr = format(today, 'yyyy-MM-dd')
const weekStart = startOfWeek(today, { weekStartsOn: 1 })

// ─── Student Profile ───────────────────────────────────────────────────────────
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
export const mockActivities = [
  {
    id: 'act-1',
    name: 'System Design Study',
    description: 'Study distributed system design patterns and microservices architecture',
    date: todayStr,
    startTime: '09:00',
    endTime: '10:30',
    progress: 75,
    status: 'IN_PROGRESS',
    extendedEndTime: null,
    extensionReason: null,
  },
  {
    id: 'act-2',
    name: 'DSA Practice — Trees',
    description: 'Solve 5 LeetCode problems on Binary Trees and BSTs',
    date: todayStr,
    startTime: '11:00',
    endTime: '12:30',
    progress: 100,
    status: 'COMPLETED',
    extendedEndTime: null,
    extensionReason: null,
  },
  {
    id: 'act-3',
    name: 'Mini Project Meeting',
    description: 'Team sync for the web application mini-project',
    date: todayStr,
    startTime: '14:00',
    endTime: '15:00',
    progress: 0,
    status: 'PLANNED',
    extendedEndTime: null,
    extensionReason: null,
  },
  {
    id: 'act-4',
    name: 'Technical Report Writing',
    description: 'Write the technical report for the system design assignment',
    date: todayStr,
    startTime: '15:30',
    endTime: '17:00',
    progress: 40,
    status: 'IN_PROGRESS',
    extendedEndTime: '18:00',
    extensionReason: 'Need extra time to complete the architecture diagrams',
  },
  // Past week activities
  {
    id: 'act-5',
    name: 'Database Design',
    description: 'Design ER diagram for the project database',
    date: format(subDays(today, 1), 'yyyy-MM-dd'),
    startTime: '10:00',
    endTime: '11:30',
    progress: 100,
    status: 'COMPLETED',
    extendedEndTime: null,
    extensionReason: null,
  },
  {
    id: 'act-6',
    name: 'React Component Building',
    description: 'Build reusable UI components for the student portal',
    date: format(subDays(today, 1), 'yyyy-MM-dd'),
    startTime: '14:00',
    endTime: '16:00',
    progress: 100,
    status: 'COMPLETED',
    extendedEndTime: '17:00',
    extensionReason: 'Needed time to add unit tests',
  },
  {
    id: 'act-7',
    name: 'API Integration Study',
    description: 'Study REST API integration patterns with Axios',
    date: format(subDays(today, 2), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '10:30',
    progress: 60,
    status: 'INCOMPLETE',
    extendedEndTime: null,
    extensionReason: null,
  },
  {
    id: 'act-8',
    name: 'Git & Version Control',
    description: 'Practice advanced Git workflows and branching strategies',
    date: format(subDays(today, 2), 'yyyy-MM-dd'),
    startTime: '11:00',
    endTime: '12:00',
    progress: 100,
    status: 'COMPLETED',
    extendedEndTime: null,
    extensionReason: null,
  },
  {
    id: 'act-9',
    name: 'Cloud Computing Module',
    description: 'Complete AWS fundamentals certification module',
    date: format(subDays(today, 3), 'yyyy-MM-dd'),
    startTime: '09:30',
    endTime: '11:00',
    progress: 100,
    status: 'COMPLETED',
    extendedEndTime: null,
    extensionReason: null,
  },
  {
    id: 'act-10',
    name: 'Peer Code Review',
    description: 'Review and provide feedback on team members\' code',
    date: format(addDays(today, 1), 'yyyy-MM-dd'),
    startTime: '10:00',
    endTime: '11:00',
    progress: 0,
    status: 'PLANNED',
    extendedEndTime: null,
    extensionReason: null,
  },
]

// ─── P-Skills ──────────────────────────────────────────────────────────────────
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
const generateAttendance = () => {
  const records = []
  const statuses = ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'ABSENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT']
  for (let i = 60; i >= 1; i--) {
    const date = subDays(today, i)
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) continue // skip weekends
    const dateStr = format(date, 'yyyy-MM-dd')
    
    // Forenoon record
    records.push({
      id: `att-${i}-fn`,
      date: dateStr,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      session: 'Forenoon',
    })
    
    // Afternoon record
    records.push({
      id: `att-${i}-an`,
      date: dateStr,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      session: 'Afternoon',
    })
  }
  
  // Guarantee an absence yesterday so the demo is immediately visible
  if (records.length >= 2) {
    records[records.length - 1].status = 'ABSENT'
    records[records.length - 2].status = 'PRESENT' // Half-day absent demo
  }
  if (records.length >= 4) {
    records[records.length - 3].status = 'ABSENT'
    records[records.length - 4].status = 'ABSENT' // Full-day absent demo
  }
  
  return records
}

export const mockAttendance = generateAttendance()

// ─── Leave History ─────────────────────────────────────────────────────────────
export const mockLeaves = [
  {
    id: 'lv-1',
    startDate: format(subDays(today, 20), 'yyyy-MM-dd'),
    endDate: format(subDays(today, 18), 'yyyy-MM-dd'),
    reason: 'Family function — sister\'s wedding ceremony',
    submittedOn: format(subDays(today, 25), 'yyyy-MM-dd'),
  },
  {
    id: 'lv-2',
    startDate: format(subDays(today, 10), 'yyyy-MM-dd'),
    endDate: format(subDays(today, 10), 'yyyy-MM-dd'),
    reason: 'Medical appointment — routine health checkup',
    submittedOn: format(subDays(today, 12), 'yyyy-MM-dd'),
  },
]

// ─── Movement Passes ──────────────────────────────────────────────────────────
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

export const mockMovementPasses = [
  {
    id: 'mp-active',
    date: todayStr,
    movementType: 'Lab',
    slot: 'Afternoon Slot (12:00 PM – 02:00 PM)',
    timing: '12:00 PM – 02:00 PM',
    reason: 'Project review with guide',
    status: 'ACTIVE'
  },
  {
    id: 'mp-1',
    date: format(subDays(today, 5), 'yyyy-MM-dd'),
    movementType: 'Library',
    slot: 'Morning Slot (8:00 AM – 10:00 AM)',
    timing: '8:00 AM – 10:00 AM',
    reason: 'Reference book collection for system design project',
  },
  {
    id: 'mp-2',
    date: format(subDays(today, 2), 'yyyy-MM-dd'),
    movementType: 'P-Skill Activity',
    slot: 'P-Skill Slot A',
    timing: '10:00 AM – 11:00 AM',
    reason: 'Attending communication skills workshop',
  },
  {
    id: 'mp-3',
    date: format(subDays(today, 1), 'yyyy-MM-dd'),
    movementType: 'Medical Center',
    slot: 'Afternoon Slot (12:00 PM – 02:00 PM)',
    timing: '12:00 PM – 02:00 PM',
    reason: 'Doctor visit for health checkup',
  },
]

// ─── Notifications ─────────────────────────────────────────────────────────────
export const mockNotifications = [
  {
    id: 'notif-1',
    type: 'activity',
    title: 'Activity Reminder',
    message: 'Your "Mini Project Meeting" starts in 30 minutes.',
    time: '13:30',
    read: false,
  },
  {
    id: 'notif-2',
    type: 'system',
    title: 'Attendance Updated',
    message: 'Your attendance for today has been marked.',
    time: '09:00',
    read: false,
  },
  {
    id: 'notif-3',
    type: 'pskill',
    title: 'P-Skill Progress',
    message: 'Great work! Your Communication Skills level has been updated.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 'notif-4',
    type: 'schedule',
    title: 'Schedule Update',
    message: 'New P-Skill Slot A session scheduled for this week.',
    time: '2 days ago',
    read: true,
  },
]

// ─── Assigned Tasks ─────────────────────────────────────────────────────────────
export const mockAssignedTasks = [
  {
    id: 'task-1',
    title: 'Design Dashboard UI',
    assignedBy: 'Dr. Smith',
    dueDate: format(addDays(today, 2), 'yyyy-MM-dd'),
    status: 'PENDING'
  },
  {
    id: 'task-2',
    title: 'Implement Auth Flow',
    assignedBy: 'Prof. John',
    dueDate: format(addDays(today, 5), 'yyyy-MM-dd'),
    status: 'COMPLETED'
  },
]

// ─── Project Info ───────────────────────────────────────────────────────────────
export const mockProject = {
  id: 'PRJ-101',
  title: 'AI-Workforce Student Portal',
  description: 'A comprehensive frontend application to manage student activities, attendance, P-Skills, and leave management.',
  teamId: 'TEAM-FA-2024',
  lead: 'Rahul Verma',
  members: ['Priya Ramesh', 'Kiran Kumar', 'Neha Singh'],
}

