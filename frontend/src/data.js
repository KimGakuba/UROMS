export const stats = {
  totalRooms: 48,
  totalLabs: 12,
  activeBookings: 127,
  pendingApprovals: 23,
  totalLecturers: 84,
  totalStudents: 3420,
  equipmentItems: 215,
  upcomingEvents: 9,
  utilizationRate: 73,
  hecCompliant: 91,
};

export const bookingTrends = [
  { month: "Sep", bookings: 145, approved: 132, rejected: 13 },
  { month: "Oct", bookings: 189, approved: 171, rejected: 18 },
  { month: "Nov", bookings: 203, approved: 185, rejected: 18 },
  { month: "Dec", bookings: 98, approved: 90, rejected: 8 },
  { month: "Jan", bookings: 167, approved: 152, rejected: 15 },
  { month: "Feb", bookings: 221, approved: 198, rejected: 23 },
  { month: "Mar", bookings: 245, approved: 220, rejected: 25 },
  { month: "Apr", bookings: 127, approved: 115, rejected: 12 },
];

export const resourceDistribution = [
  { name: "Classrooms", value: 48, color: "#EA5E50" },
  { name: "Labs", value: 12, color: "#FAA9A1" },
  { name: "Equipment", value: 215, color: "#FAA9A1" },
  { name: "Event Halls", value: 6, color: "#10b981" },
];

export const utilizationData = [
  { day: "Mon", classrooms: 85, labs: 72, equipment: 60 },
  { day: "Tue", classrooms: 92, labs: 88, equipment: 74 },
  { day: "Wed", classrooms: 78, labs: 65, equipment: 55 },
  { day: "Thu", classrooms: 95, labs: 91, equipment: 82 },
  { day: "Fri", classrooms: 70, labs: 58, equipment: 48 },
  { day: "Sat", classrooms: 30, labs: 22, equipment: 18 },
];

export const rooms = [
  { id: 1, name: "Lecture Hall A", code: "LH-101", type: "Classroom", capacity: 120, building: "Block A", floor: 1, campus: "Main", features: ["Projector", "AC", "Whiteboard"], status: "Available", utilization: 85 },
  { id: 2, name: "Seminar Room B", code: "SR-102", type: "Classroom", capacity: 40, building: "Block A", floor: 1, campus: "Main", features: ["Projector", "AC"], status: "Occupied", utilization: 92 },
  { id: 3, name: "CS Lab 1", code: "LAB-CS1", type: "Lab", capacity: 30, building: "Block B", floor: 2, campus: "Main", features: ["30 PCs", "AC", "Projector"], status: "Available", utilization: 68 },
  { id: 4, name: "Electronics Lab", code: "LAB-EE1", type: "Lab", capacity: 25, building: "Block C", floor: 1, campus: "Main", features: ["Oscilloscopes", "AC"], status: "Maintenance", utilization: 0 },
  { id: 5, name: "Tutorial Room C", code: "TR-103", type: "Classroom", capacity: 20, building: "Block A", floor: 2, campus: "Main", features: ["Whiteboard"], status: "Available", utilization: 45 },
  { id: 6, name: "Physics Lab", code: "LAB-PH1", type: "Lab", capacity: 28, building: "Block D", floor: 1, campus: "Main", features: ["Equipment", "AC"], status: "Occupied", utilization: 78 },
  { id: 7, name: "Lecture Hall B", code: "LH-201", type: "Classroom", capacity: 100, building: "Block B", floor: 1, campus: "North", features: ["Projector", "AC", "Smart Board"], status: "Available", utilization: 62 },
  { id: 8, name: "Network Lab", code: "LAB-NET1", type: "Lab", capacity: 24, building: "Block E", floor: 3, campus: "Main", features: ["24 PCs", "Cisco Equipment"], status: "Available", utilization: 55 },
];

export const bookings = [
  { id: 1, title: "CS301 Lecture", room: "LH-101", type: "Classroom", date: "2024-04-22", start: "08:00", end: "10:00", requestedBy: "Dr. Fatima Ali", status: "Approved", department: "Computer Science" },
  { id: 2, title: "Database Lab Session", room: "LAB-CS1", type: "Lab", date: "2024-04-22", start: "10:00", end: "12:00", requestedBy: "Prof. Usman Malik", status: "Approved", department: "Computer Science" },
  { id: 3, title: "EE301 Tutorial", room: "TR-103", type: "Classroom", date: "2024-04-22", start: "14:00", end: "15:00", requestedBy: "Dr. Sara Ahmed", status: "Pending", department: "Electrical Engineering" },
  { id: 4, title: "Research Seminar", room: "SR-102", type: "Classroom", date: "2024-04-23", start: "11:00", end: "13:00", requestedBy: "Dr. Ahmed Khan", status: "Pending", department: "Computer Science" },
  { id: 5, title: "Physics Experiment", room: "LAB-PH1", type: "Lab", date: "2024-04-23", start: "09:00", end: "11:00", requestedBy: "Prof. Bilal Hassan", status: "Approved", department: "Physics" },
  { id: 6, title: "Network Security Lab", room: "LAB-NET1", type: "Lab", date: "2024-04-24", start: "13:00", end: "15:00", requestedBy: "Dr. Fatima Ali", status: "Rejected", department: "Computer Science" },
  { id: 7, title: "MBA Workshop", room: "LH-201", type: "Classroom", date: "2024-04-24", start: "10:00", end: "12:00", requestedBy: "Prof. Zara Malik", status: "Approved", department: "Business" },
];

export const lecturers = [
  { id: 1, name: "Dr. Fatima Ali", staffId: "STF001", department: "Computer Science", campus: "Main", courses: ["CS301", "CS401", "CS501"], assignedHours: 27, completedHours: 18, hecLimit: 40, status: "Active" },
  { id: 2, name: "Prof. Usman Malik", staffId: "STF002", department: "Electrical Engineering", campus: "Main", courses: ["EE301", "EE401"], assignedHours: 18, completedHours: 12, hecLimit: 40, status: "Active" },
  { id: 3, name: "Dr. Ahmed Khan", staffId: "STF003", department: "Computer Science", campus: "Main", courses: ["CS601", "CS701"], assignedHours: 36, completedHours: 24, hecLimit: 40, status: "Near Limit" },
  { id: 4, name: "Dr. Sara Ahmed", staffId: "STF004", department: "Electrical Engineering", campus: "North", courses: ["EE201", "EE501", "EE601"], assignedHours: 38, completedHours: 28, hecLimit: 40, status: "Near Limit" },
  { id: 5, name: "Prof. Bilal Hassan", staffId: "STF005", department: "Physics", campus: "Main", courses: ["PH301", "PH401"], assignedHours: 18, completedHours: 10, hecLimit: 40, status: "Active" },
  { id: 6, name: "Dr. Zara Malik", staffId: "STF006", department: "Business", campus: "Main", courses: ["BUS301", "BUS401", "BUS501", "BUS601"], assignedHours: 42, completedHours: 30, hecLimit: 40, status: "Over Limit" },
];

export const equipment = [
  { id: 1, name: "Portable Projector", code: "EQ-PROJ-01", category: "AV Equipment", total: 8, available: 5, campus: "Main", status: "Good", lastMaintenance: "2024-03-15" },
  { id: 2, name: "Laptop (Dell)", code: "EQ-LAP-01", category: "Computing", total: 20, available: 13, campus: "Main", status: "Good", lastMaintenance: "2024-02-20" },
  { id: 3, name: "Video Camera", code: "EQ-CAM-01", category: "AV Equipment", total: 4, available: 4, campus: "Main", status: "Good", lastMaintenance: "2024-01-10" },
  { id: 4, name: "Wireless Microphone", code: "EQ-MIC-01", category: "Audio", total: 10, available: 7, campus: "Main", status: "Good", lastMaintenance: "2024-03-01" },
  { id: 5, name: "Oscilloscope", code: "EQ-OSC-01", category: "Lab Equipment", total: 12, available: 8, campus: "Main", status: "Maintenance", lastMaintenance: "2024-04-01" },
  { id: 6, name: "3D Printer", code: "EQ-3DP-01", category: "Fabrication", total: 3, available: 2, campus: "Main", status: "Good", lastMaintenance: "2024-03-20" },
  { id: 7, name: "Smart Board", code: "EQ-SB-01", category: "AV Equipment", total: 6, available: 6, campus: "North", status: "Good", lastMaintenance: "2024-02-15" },
];

export const events = [
  { id: 1, title: "Annual Tech Symposium 2024", type: "Academic", date: "2024-05-15", endDate: "2024-05-16", venue: "Main Auditorium", campus: "Main", organizer: "CS Department", capacity: 500, registered: 342, status: "Upcoming" },
  { id: 2, title: "HEC Accreditation Visit", type: "Accreditation", date: "2024-05-20", endDate: "2024-05-22", venue: "Admin Block", campus: "Main", organizer: "Administration", capacity: 100, registered: 87, status: "Upcoming" },
  { id: 3, title: "Freshmen Orientation", type: "Student", date: "2024-04-25", endDate: "2024-04-25", venue: "Lecture Hall A", campus: "Main", organizer: "Registry", capacity: 300, registered: 289, status: "Upcoming" },
  { id: 4, title: "Research Paper Presentation", type: "Academic", date: "2024-04-18", endDate: "2024-04-18", venue: "Seminar Room B", campus: "Main", organizer: "Research Dept", capacity: 60, registered: 54, status: "Completed" },
  { id: 5, title: "Industry Connect Day", type: "Career", date: "2024-06-05", endDate: "2024-06-05", venue: "Sports Complex", campus: "North", organizer: "Career Services", capacity: 800, registered: 210, status: "Upcoming" },
];

export const users = [
  { id: 1, name: "Admin User", email: "admin@university.edu", role: "Admin", department: "Administration", campus: "Main", status: "Active", lastLogin: "2024-04-22" },
  { id: 2, name: "Sarah Registry", email: "registry@university.edu", role: "Registry", department: "Registry", campus: "Main", status: "Active", lastLogin: "2024-04-22" },
  { id: 3, name: "Dr. Ahmed Khan", email: "hod.cs@university.edu", role: "HoD", department: "Computer Science", campus: "Main", status: "Active", lastLogin: "2024-04-21" },
  { id: 4, name: "Dr. Fatima Ali", email: "fatima@university.edu", role: "Lecturer", department: "Computer Science", campus: "Main", status: "Active", lastLogin: "2024-04-22" },
  { id: 5, name: "Ali Hassan", email: "ali@student.edu", role: "Student", department: "Computer Science", campus: "Main", status: "Active", lastLogin: "2024-04-20" },
  { id: 6, name: "Prof. Usman Malik", email: "usman@university.edu", role: "Lecturer", department: "Electrical Engineering", campus: "Main", status: "Active", lastLogin: "2024-04-19" },
  { id: 7, name: "Dr. Sara Ahmed", email: "sara@university.edu", role: "Lecturer", department: "Electrical Engineering", campus: "North", status: "Active", lastLogin: "2024-04-18" },
  { id: 8, name: "Zara Student", email: "zara@student.edu", role: "Student", department: "Business", campus: "Main", status: "Inactive", lastLogin: "2024-03-15" },
];

export const accreditationReports = [
  { id: 1, title: "HEC Annual Compliance Report", type: "HEC", period: "2023-24", status: "Submitted", score: 94, deadline: "2024-03-31", submittedOn: "2024-03-28", auditor: "HEC Pakistan" },
  { id: 2, title: "AAA Program Accreditation", type: "AAA", period: "2023-24", status: "In Review", score: 88, deadline: "2024-05-15", submittedOn: "2024-04-10", auditor: "AAA Board" },
  { id: 3, title: "Faculty Workload Report Q1", type: "HEC", period: "Q1 2024", status: "Draft", score: null, deadline: "2024-04-30", submittedOn: null, auditor: "HEC Pakistan" },
  { id: 4, title: "Lab Utilization Report", type: "Internal", period: "2023-24", status: "Approved", score: 91, deadline: "2024-02-28", submittedOn: "2024-02-25", auditor: "Internal Audit" },
  { id: 5, title: "Student-Faculty Ratio Report", type: "HEC", period: "2023-24", status: "Submitted", score: 96, deadline: "2024-03-15", submittedOn: "2024-03-12", auditor: "HEC Pakistan" },
];

export const scheduleData = [
  { id: 1, course: "CS301 - OOP", room: "LH-101", day: "Monday", start: "08:00", end: "10:00", lecturer: "Dr. Fatima Ali", semester: "Fall 2024" },
  { id: 2, course: "CS401 - Database", room: "LAB-CS1", day: "Monday", start: "10:00", end: "12:00", lecturer: "Dr. Fatima Ali", semester: "Fall 2024" },
  { id: 3, course: "EE301 - Circuits", room: "TR-103", day: "Tuesday", start: "09:00", end: "11:00", lecturer: "Prof. Usman Malik", semester: "Fall 2024" },
  { id: 4, course: "CS501 - Algorithms", room: "SR-102", day: "Wednesday", start: "11:00", end: "13:00", lecturer: "Dr. Ahmed Khan", semester: "Fall 2024" },
  { id: 5, course: "PH301 - Physics", room: "LAB-PH1", day: "Thursday", start: "09:00", end: "11:00", lecturer: "Prof. Bilal Hassan", semester: "Fall 2024" },
  { id: 6, course: "BUS301 - Management", room: "LH-201", day: "Friday", start: "10:00", end: "12:00", lecturer: "Dr. Zara Malik", semester: "Fall 2024" },
];

export const recentActivity = [
  { id: 1, action: "Booking Approved", detail: "LH-101 for CS301 Lecture", user: "Sarah Registry", time: "2 min ago", type: "success" },
  { id: 2, action: "New Booking Request", detail: "SR-102 for Research Seminar", user: "Dr. Ahmed Khan", time: "15 min ago", type: "info" },
  { id: 3, action: "Workload Alert", detail: "Dr. Zara Malik exceeded HEC limit", user: "System", time: "1 hr ago", type: "warning" },
  { id: 4, action: "Equipment Returned", detail: "3x Projectors returned to inventory", user: "Lab Staff", time: "2 hrs ago", type: "success" },
  { id: 5, action: "Event Created", detail: "Annual Tech Symposium 2024", user: "CS Department", time: "3 hrs ago", type: "info" },
  { id: 6, action: "Booking Rejected", detail: "LAB-NET1 conflict detected", user: "System", time: "4 hrs ago", type: "error" },
];
