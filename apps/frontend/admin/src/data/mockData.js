import { format } from 'date-fns'

const today = new Date()
const todayStr = format(today, 'yyyy-MM-dd')

// ─── Admin Profile ─────────────────────────────────────────────────────────────
export const mockAdmin = {
  id: 'ADM-001',
  name: 'Dr. Anitha Kumar',
  role: 'Faculty Coordinator',
  email: 'anitha.kumar@college.edu',
  department: 'Computer Science',
}

// ─── Students ──────────────────────────────────────────────────────────────────
// Retaining student list as requested
export const mockStudents = [
  { id: 'STU-001', name: 'Priya Ramesh',    registerNumber: '22CS101', email: 'priya.ramesh@college.edu', phone: '+91 98765 43210', github: 'https://github.com/priyaramesh' },
  { id: 'STU-002', name: 'Arjun Mehta',     registerNumber: '22CS102', email: 'arjun.mehta@college.edu', phone: '+91 98765 43211', github: 'https://github.com/arjunmehta' },
  { id: 'STU-003', name: 'Kiran Kumar',     registerNumber: '22CS103', email: 'kiran.kumar@college.edu', phone: '+91 98765 43212', github: 'https://github.com/kirankumar' },
  { id: 'STU-004', name: 'Neha Singh',      registerNumber: '22CS104', email: 'neha.singh@college.edu', phone: '+91 98765 43213', github: '' },
  { id: 'STU-005', name: 'Rahul Verma',     registerNumber: '22CS105', email: 'rahul.verma@college.edu', phone: '+91 98765 43214', github: 'https://github.com/rahulverma' },
  { id: 'STU-006', name: 'Sneha Patel',     registerNumber: '22CS106', email: 'sneha.patel@college.edu', phone: '+91 98765 43215', github: '' },
  { id: 'STU-007', name: 'Amit Sharma',     registerNumber: '22CS107', email: 'amit.sharma@college.edu', phone: '+91 98765 43216', github: 'https://github.com/amitsharma' },
  { id: 'STU-008', name: 'Divya Nair',      registerNumber: '22CS108', email: 'divya.nair@college.edu', phone: '+91 98765 43217', github: '' },
  { id: 'STU-009', name: 'Rohit Gupta',     registerNumber: '22CS109', email: 'rohit.gupta@college.edu', phone: '+91 98765 43218', github: 'https://github.com/rohitgupta' },
  { id: 'STU-010', name: 'Lakshmi Rajan',   registerNumber: '22CS110', email: 'lakshmi.rajan@college.edu', phone: '+91 98765 43219', github: '' },
  { id: 'STU-011', name: 'Suresh Babu',     registerNumber: '22CS111', email: 'suresh.babu@college.edu', phone: '+91 98765 43220', github: 'https://github.com/sureshbabu' },
  { id: 'STU-012', name: 'Meena Krishnan',  registerNumber: '22CS112', email: 'meena.krishnan@college.edu', phone: '+91 98765 43221', github: '' },
]

// ─── Today's Attendance (Roster populated but submitted: false) ────────────────
export let mockTodayAttendance = {
  date: todayStr,
  forenoon: {
    submitted: false,
    records: mockStudents.map(s => ({ studentId: s.id, status: 'PRESENT' })),
  },
  afternoon: {
    submitted: false,
    records: mockStudents.map(s => ({ studentId: s.id, status: 'PRESENT' })),
  },
}

// ─── Leave Applications ────────────────────────────────────────────────────────
export const mockLeaves = []

// ─── Movement Passes ───────────────────────────────────────────────────────────
export const mockPasses = []

// ─── Assigned Projects ──────────────────────────────────────────────────────────
export let mockProjects = []

// ─── Assigned Tasks (Admin view) ───────────────────────────────────────────────
export let mockAdminAssignedTasks = []

// ─── Project Updates (Live Feed) ────────────────────────────────────────────────
export let mockProjectUpdates = []

// ─── Attendance History ────────────────────────────────────────────────────────
export const mockAttendanceHistory = []

// ─── Student Detail Activity Generator ────────────────────────────────────────
export const getStudentActivityData = (studentId) => {
  const pskillPool = [
    'Git Version Control', 'React Hooks Deep Dive', 'Tailwind CSS Layouts',
    'REST API Integration', 'Docker Containerization', 'GraphQL Basics',
    'Figma Prototyping', 'Jest Unit Testing', 'Node.js Express APIs'
  ]

  // Find project in dynamic mockProjects list
  const proj = mockProjects.find(p => p.members.includes(studentId)) || {
    id: 'PRJ-999',
    name: 'No Project',
    role: 'Member',
    description: 'Not assigned to any project.'
  }

  // Generate P-Skills status (all PENDING as no history is needed)
  const pskills = pskillPool.map((name) => ({ name, status: 'PENDING' }))

  return {
    project: {
      name: proj.name,
      role: proj.role || 'Member',
      description: proj.description
    },
    weeklyPlan: [
      { day: 'Monday', goal: 'No goal set' },
      { day: 'Tuesday', goal: 'No goal set' },
      { day: 'Wednesday', goal: 'No goal set' },
      { day: 'Thursday', goal: 'No goal set' },
      { day: 'Friday', goal: 'No goal set' }
    ],
    dailyPlan: [],
    pskills,
    tasks: []
  }
}
