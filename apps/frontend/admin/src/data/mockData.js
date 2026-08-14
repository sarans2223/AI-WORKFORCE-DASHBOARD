import { format, subDays, addDays } from 'date-fns'

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

// ─── Today's Attendance ────────────────────────────────────────────────────────
export let mockTodayAttendance = {
  date: todayStr,
  forenoon: {
    submitted: true,
    records: mockStudents.map((s, i) => ({
      studentId: s.id,
      status: i < 9 ? 'PRESENT' : 'ABSENT',
    })),
  },
  afternoon: {
    submitted: false,
    records: mockStudents.map(s => ({
      studentId: s.id,
      status: 'PRESENT',
    })),
  },
}

// ─── Leave Applications ────────────────────────────────────────────────────────
export const mockLeaves = [
  {
    id: 'LV-001',
    studentId: 'STU-001',
    studentName: 'Priya Ramesh',
    registerNumber: '22CS101',
    startDate: format(addDays(today, 3), 'yyyy-MM-dd'),
    endDate: format(addDays(today, 5), 'yyyy-MM-dd'),
    reason: 'Family function — sister\'s wedding ceremony',
    submittedOn: format(subDays(today, 1), 'yyyy-MM-dd'),
  },
  {
    id: 'LV-002',
    studentId: 'STU-003',
    studentName: 'Kiran Kumar',
    registerNumber: '22CS103',
    startDate: format(addDays(today, 1), 'yyyy-MM-dd'),
    endDate: format(addDays(today, 1), 'yyyy-MM-dd'),
    reason: 'Medical appointment — routine health checkup',
    submittedOn: todayStr,
  },
  {
    id: 'LV-003',
    studentId: 'STU-005',
    studentName: 'Rahul Verma',
    registerNumber: '22CS105',
    startDate: format(subDays(today, 5), 'yyyy-MM-dd'),
    endDate: format(subDays(today, 3), 'yyyy-MM-dd'),
    reason: 'Attended a national-level hackathon',
    submittedOn: format(subDays(today, 7), 'yyyy-MM-dd'),
  },
  {
    id: 'LV-004',
    studentId: 'STU-007',
    studentName: 'Amit Sharma',
    registerNumber: '22CS107',
    startDate: format(subDays(today, 10), 'yyyy-MM-dd'),
    endDate: format(subDays(today, 8), 'yyyy-MM-dd'),
    reason: 'Personal emergency — family health issue',
    submittedOn: format(subDays(today, 12), 'yyyy-MM-dd'),
  },
]

// ─── Movement Passes ───────────────────────────────────────────────────────────
export const mockPasses = [
  {
    id: 'MP-001',
    studentId: 'STU-002',
    studentName: 'Arjun Mehta',
    registerNumber: '22CS102',
    date: todayStr,
    movementType: 'Library',
    slot: 'Morning Slot (8:00 AM – 10:00 AM)',
    timing: '8:00 AM – 10:00 AM',
    reason: 'Reference book for system design project',
    status: 'ACTIVE',
  },
  {
    id: 'MP-002',
    studentId: 'STU-004',
    studentName: 'Neha Singh',
    registerNumber: '22CS104',
    date: todayStr,
    movementType: 'Medical Center',
    slot: 'Afternoon Slot (12:00 PM – 02:00 PM)',
    timing: '12:00 PM – 02:00 PM',
    reason: 'Doctor visit',
    status: 'ACTIVE',
  },
  {
    id: 'MP-003',
    studentId: 'STU-006',
    studentName: 'Sneha Patel',
    registerNumber: '22CS106',
    date: format(subDays(today, 1), 'yyyy-MM-dd'),
    movementType: 'Lab',
    slot: 'Afternoon Slot (12:00 PM – 02:00 PM)',
    timing: '12:00 PM – 02:00 PM',
    reason: 'Project review with guide',
    status: 'EXPIRED',
  },
  {
    id: 'MP-004',
    studentId: 'STU-009',
    studentName: 'Rohit Gupta',
    registerNumber: '22CS109',
    date: todayStr,
    movementType: 'Administrative Office',
    slot: 'P-Skill Slot A',
    timing: '10:00 AM – 11:00 AM',
    reason: 'Certificate submission',
    status: 'ACTIVE',
  },
]

// ─── Assigned Projects ──────────────────────────────────────────────────────────
export let mockProjects = [
  { id: 'PRJ-101', name: 'Smart Campus IoT System', description: 'Developing BLE beacon integrations, heat maps, and college occupancy charts.', members: ['STU-001', 'STU-005', 'STU-009'], assignedBy: 'Dr. Anitha Kumar' },
  { id: 'PRJ-102', name: 'AI Medical Assistant', description: 'Building NLP pipelines for drug interaction checkups and patient scheduling.', members: ['STU-002', 'STU-006', 'STU-010'], assignedBy: 'Prof. Rajesh Kumar' },
  { id: 'PRJ-103', name: 'Automated Attendance App', description: 'Designing Figma boards and building attendance flows for admin and faculty panels.', members: ['STU-003', 'STU-007', 'STU-011'], assignedBy: 'Dr. Shalini Sen' },
  { id: 'PRJ-104', name: 'College Pass Management', description: 'Designing security schemas and API verifications for real-time corridor movement.', members: ['STU-004', 'STU-008', 'STU-012'], assignedBy: 'Dr. Anitha Kumar' }
]

// ─── Assigned Tasks (Admin view) ───────────────────────────────────────────────
export let mockAdminAssignedTasks = [
  {
    id: 'ATASK-001',
    title: 'Design Dashboard UI Wireframe',
    description: 'Create a wireframe for the student dashboard using Figma or any prototyping tool.',
    assignedOn: format(subDays(today, 3), 'yyyy-MM-dd'),
    dueDate: format(addDays(today, 2), 'yyyy-MM-dd'),
    assignedBy: 'Dr. Anitha Kumar',
    studentStatuses: [
      { studentId: 'STU-001', status: 'COMPLETED' },
      { studentId: 'STU-002', status: 'COMPLETED' },
      { studentId: 'STU-003', status: 'PENDING' },
      { studentId: 'STU-004', status: 'COMPLETED' },
      { studentId: 'STU-005', status: 'PENDING' },
      { studentId: 'STU-006', status: 'PENDING' },
      { studentId: 'STU-007', status: 'COMPLETED' },
      { studentId: 'STU-008', status: 'PENDING' },
      { studentId: 'STU-009', status: 'COMPLETED' },
      { studentId: 'STU-010', status: 'PENDING' },
      { studentId: 'STU-011', status: 'PENDING' },
      { studentId: 'STU-012', status: 'COMPLETED' },
    ],
  },
  {
    id: 'ATASK-002',
    title: 'Implement Authentication Flow',
    description: 'Build a login and registration system using JWT tokens and secure password hashing.',
    assignedOn: format(subDays(today, 1), 'yyyy-MM-dd'),
    dueDate: format(addDays(today, 5), 'yyyy-MM-dd'),
    assignedBy: 'Prof. Rajesh Kumar',
    studentStatuses: [
      { studentId: 'STU-001', status: 'PENDING' },
      { studentId: 'STU-002', status: 'PENDING' },
      { studentId: 'STU-003', status: 'COMPLETED' },
      { studentId: 'STU-004', status: 'PENDING' },
      { studentId: 'STU-005', status: 'PENDING' },
      { studentId: 'STU-006', status: 'COMPLETED' },
      { studentId: 'STU-007', status: 'PENDING' },
      { studentId: 'STU-008', status: 'PENDING' },
      { studentId: 'STU-009', status: 'PENDING' },
      { studentId: 'STU-010', status: 'COMPLETED' },
      { studentId: 'STU-011', status: 'PENDING' },
      { studentId: 'STU-012', status: 'PENDING' },
    ],
  },
  {
    id: 'ATASK-003',
    title: 'Write Technical Report — System Design',
    description: 'Document your architecture, data models, and API design choices in a formal report.',
    assignedOn: format(subDays(today, 5), 'yyyy-MM-dd'),
    dueDate: format(subDays(today, 1), 'yyyy-MM-dd'),
    assignedBy: 'Dr. Shalini Sen',
    studentStatuses: [
      { studentId: 'STU-001', status: 'COMPLETED' },
      { studentId: 'STU-002', status: 'COMPLETED' },
      { studentId: 'STU-003', status: 'COMPLETED' },
      { studentId: 'STU-004', status: 'COMPLETED' },
      { studentId: 'STU-005', status: 'COMPLETED' },
      { studentId: 'STU-006', status: 'COMPLETED' },
      { studentId: 'STU-007', status: 'COMPLETED' },
      { studentId: 'STU-008', status: 'COMPLETED' },
      { studentId: 'STU-009', status: 'COMPLETED' },
      { studentId: 'STU-010', status: 'COMPLETED' },
      { studentId: 'STU-011', status: 'COMPLETED' },
      { studentId: 'STU-012', status: 'COMPLETED' },
    ],
  },
]

// ─── Project Updates (Live Feed) ────────────────────────────────────────────────
export let mockProjectUpdates = [
  {
    id: 'UPD-001',
    studentId: 'STU-010',
    studentName: 'Lakshmi Rajan',
    registerNumber: '22CS110',
    projectId: 'PRJ-102',
    projectName: 'AI Medical Assistant',
    status: 'COMPLETED',
    read: false,
    message: 'Finished NLP parsing module to inspect medicine prescriptions. Successfully matching 95% of test pharmaceutical records.',
    timestamp: '30 mins ago'
  },
  {
    id: 'UPD-002',
    studentId: 'STU-011',
    studentName: 'Suresh Babu',
    registerNumber: '22CS111',
    projectId: 'PRJ-103',
    projectName: 'Automated Attendance App',
    status: 'IN_PROGRESS',
    read: false,
    message: 'Integrating facial recognition WebSocket frame stream hook-ups. Currently debugging frame drops and socket latency on client side.',
    timestamp: '2 hrs ago'
  },
  {
    id: 'UPD-003',
    studentId: 'STU-012',
    studentName: 'Meena Krishnan',
    registerNumber: '22CS112',
    projectId: 'PRJ-104',
    projectName: 'College Pass Management',
    status: 'BLOCKED',
    read: true,
    message: 'Stuck on a CORS issue while attempting to verify encrypted JSON web tokens on our staging deployment branch.',
    timestamp: '4 hrs ago'
  },
  {
    id: 'UPD-004',
    studentId: 'STU-002',
    studentName: 'Arjun Mehta',
    registerNumber: '22CS102',
    projectId: 'PRJ-102',
    projectName: 'AI Medical Assistant',
    status: 'IN_PROGRESS',
    read: true,
    message: 'Drafting dashboard layout parameters and hooking up role-based route middleware validation.',
    timestamp: '5 hrs ago'
  },
  {
    id: 'UPD-005',
    studentId: 'STU-004',
    studentName: 'Neha Singh',
    registerNumber: '22CS104',
    projectId: 'PRJ-104',
    projectName: 'College Pass Management',
    status: 'COMPLETED',
    read: true,
    message: 'Designed and deployed custom pass-tracking historical table and export details panels.',
    timestamp: 'Yesterday'
  },
  {
    id: 'UPD-006',
    studentId: 'STU-001',
    studentName: 'Priya Ramesh',
    registerNumber: '22CS101',
    projectId: 'PRJ-101',
    projectName: 'Smart Campus IoT System',
    status: 'COMPLETED',
    read: true,
    message: 'Created room occupancy chart cards. Real-time data sync via SSE works perfectly without UI lag.',
    timestamp: 'Yesterday'
  },
  {
    id: 'UPD-007',
    studentId: 'STU-005',
    studentName: 'Rahul Verma',
    registerNumber: '22CS105',
    projectId: 'PRJ-101',
    projectName: 'Smart Campus IoT System',
    status: 'BLOCKED',
    read: true,
    message: 'BLE beacon in Room 403 is unresponsive. Suspect hardware sensor connection or batteries are dead.',
    timestamp: '2 days ago'
  }
]

// ─── Attendance History Generator ──────────────────────────────────────────────
export const generateMockAttendanceHistory = () => {
  const history = []
  for (let i = 1; i <= 30; i++) {
    const d = subDays(today, i)
    const dayOfWeek = d.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) continue

    const dateStr = format(d, 'yyyy-MM-dd')
    history.push({
      date: dateStr,
      forenoon: {
        submitted: true,
        records: mockStudents.map((s, idx) => ({
          studentId: s.id,
          status: (idx + i) % 7 === 0 ? 'ABSENT' : 'PRESENT'
        }))
      },
      afternoon: {
        submitted: true,
        records: mockStudents.map((s, idx) => ({
          studentId: s.id,
          status: (idx + i) % 9 === 0 ? 'ABSENT' : 'PRESENT'
        }))
      }
    })
  }
  return history
}

export const mockAttendanceHistory = generateMockAttendanceHistory()

// ─── Student Detail Activity Generator ────────────────────────────────────────
export const getStudentActivityData = (studentId) => {
  const pskillPool = [
    'Git Version Control', 'React Hooks Deep Dive', 'Tailwind CSS Layouts',
    'REST API Integration', 'Docker Containerization', 'GraphQL Basics',
    'Figma Prototyping', 'Jest Unit Testing', 'Node.js Express APIs'
  ]

  const weeklyGoals = [
    ['Setup repository and project config', 'Develop base UI layouts', 'API Integration tests', 'Refinement and styling', 'Sprint demo'],
    ['Brainstorm data models', 'Write migrations and setup DB', 'Create auth endpoints', 'Integrate security headers', 'Review code with HOD'],
    ['Create Figma wireframes', 'Build component library', 'Assemble dashboard pages', 'Conduct user usability tests', 'Final handoff to developers'],
    ['Review legacy architecture', 'Write unit tests for core modules', 'Optimize database indexes', 'Deploy staging branch', 'Team retro meeting']
  ]

  const dailyActivities = [
    [
      { time: '09:00 AM - 11:00 AM', activity: 'Daily standup and sprint planning' },
      { time: '11:00 AM - 01:00 PM', activity: 'Refactoring layout files and flex components' },
      { time: '02:00 PM - 04:00 PM', activity: 'Writing custom state hooks for user profiles' }
    ],
    [
      { time: '09:00 AM - 11:00 AM', activity: 'Database mapping and foreign keys setup' },
      { time: '11:00 AM - 01:00 PM', activity: 'Implementing controller routing and payload catches' },
      { time: '02:00 PM - 04:00 PM', activity: 'API endpoint validation using mock requests' }
    ],
    [
      { time: '09:00 AM - 11:00 AM', activity: 'Figma layout styling and typography mapping' },
      { time: '11:00 AM - 01:00 PM', activity: 'Building micro-interactions and hover animation states' },
      { time: '02:00 PM - 04:00 PM', activity: 'Gathering feedback on interface buttons' }
    ]
  ]

  const studentIndex = parseInt(studentId.replace('STU-', '')) || 1
  
  // Find project in dynamic mockProjects list
  const proj = mockProjects.find(p => p.members.includes(studentId)) || {
    id: 'PRJ-999',
    name: 'Individual Research Project',
    role: 'Researcher',
    description: 'Working on custom modules and self-paced curriculum assignments.'
  }

  const goals = weeklyGoals[studentIndex % weeklyGoals.length]
  const daily = dailyActivities[studentIndex % dailyActivities.length]

  // Generate P-Skills status
  const pskills = pskillPool.map((name, idx) => {
    let status = 'PENDING'
    if (idx < (studentIndex % 4) + 3) status = 'COMPLETED'
    else if (idx === (studentIndex % 4) + 3) status = 'IN_PROGRESS'
    return { name, status }
  })

  // Generate Assigned Tasks based on mockAdminAssignedTasks
  const tasks = mockAdminAssignedTasks
    .filter(t => t.studentStatuses.some(s => s.studentId === studentId))
    .map(t => {
      const match = t.studentStatuses.find(s => s.studentId === studentId)
      return {
        title: t.title,
        status: match ? match.status : 'PENDING',
        due: t.dueDate
      }
    })

  return {
    project: {
      name: proj.name,
      role: proj.role || 'Member',
      description: proj.description
    },
    weeklyPlan: [
      { day: 'Monday', goal: goals[0] },
      { day: 'Tuesday', goal: goals[1] },
      { day: 'Wednesday', goal: goals[2] },
      { day: 'Thursday', goal: goals[3] },
      { day: 'Friday', goal: goals[4] }
    ],
    dailyPlan: daily,
    pskills,
    tasks
  }
}
