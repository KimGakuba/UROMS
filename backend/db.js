const Database = require('better-sqlite3')
const bcrypt = require('bcryptjs')
const path = require('path')

const db = new Database(path.join(__dirname, 'uroms.db'))

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// ── Schema ──────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Faculty',
    department TEXT,
    campus TEXT DEFAULT 'Main',
    status TEXT DEFAULT 'Active',
    last_login TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    building TEXT,
    floor INTEGER DEFAULT 1,
    campus TEXT DEFAULT 'Main',
    features TEXT DEFAULT '[]',
    status TEXT DEFAULT 'Available',
    utilization INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    room_id INTEGER REFERENCES rooms(id),
    room_code TEXT,
    type TEXT,
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    requested_by TEXT,
    user_id INTEGER REFERENCES users(id),
    department TEXT,
    status TEXT DEFAULT 'Pending',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS lecturers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    staff_id TEXT UNIQUE NOT NULL,
    department TEXT,
    campus TEXT DEFAULT 'Main',
    courses TEXT DEFAULT '[]',
    assigned_hours INTEGER DEFAULT 0,
    completed_hours INTEGER DEFAULT 0,
    hec_limit INTEGER DEFAULT 40,
    status TEXT DEFAULT 'Active',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    category TEXT,
    total INTEGER DEFAULT 0,
    available INTEGER DEFAULT 0,
    campus TEXT DEFAULT 'Main',
    status TEXT DEFAULT 'Good',
    last_maintenance TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS equipment_bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipment_id INTEGER REFERENCES equipment(id),
    item_name TEXT,
    quantity INTEGER DEFAULT 1,
    borrower TEXT,
    purpose TEXT,
    borrow_date TEXT,
    return_date TEXT,
    status TEXT DEFAULT 'Active',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    type TEXT,
    date TEXT NOT NULL,
    end_date TEXT,
    venue TEXT,
    campus TEXT DEFAULT 'Main',
    organizer TEXT,
    capacity INTEGER DEFAULT 100,
    registered INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Upcoming',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS accreditation_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    type TEXT,
    period TEXT,
    status TEXT DEFAULT 'Draft',
    score INTEGER,
    deadline TEXT,
    submitted_on TEXT,
    auditor TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS lab_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lab TEXT NOT NULL,
    course TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT,
    students INTEGER DEFAULT 0,
    instructor TEXT,
    status TEXT DEFAULT 'Scheduled',
    created_at TEXT DEFAULT (datetime('now'))
  );
`)

// ── Seed ────────────────────────────────────────────────────────────────────

const seed = db.transaction(() => {
  // Users
  if (!db.prepare('SELECT id FROM users LIMIT 1').get()) {
    const hash = pw => bcrypt.hashSync(pw, 10)
    const ins = db.prepare('INSERT INTO users (name,email,password,role,department,campus) VALUES (?,?,?,?,?,?)')
    ins.run('Admin User', 'admin@uroms.ac', hash('admin123'), 'Administrator', 'Administration', 'Main')
    ins.run('Dr. Sarah Kamanzi', 'sarah@uroms.ac', hash('pass123'), 'Faculty', 'Computer Science', 'Main')
    ins.run('Sarah Registry', 'registry@uroms.ac', hash('pass123'), 'Registry', 'Registry', 'Main')
    ins.run('Dr. Ahmed Khan', 'hod@uroms.ac', hash('pass123'), 'HoD', 'Computer Science', 'Main')
    ins.run('Dr. Fatima Ali', 'fatima@uroms.ac', hash('pass123'), 'Lecturer', 'Computer Science', 'Main')
    ins.run('Ali Hassan', 'ali@student.uroms.ac', hash('pass123'), 'Student', 'Computer Science', 'Main')
  }

  // Rooms
  if (!db.prepare('SELECT id FROM rooms LIMIT 1').get()) {
    const ins = db.prepare('INSERT INTO rooms (name,code,type,capacity,building,floor,campus,features,status,utilization) VALUES (?,?,?,?,?,?,?,?,?,?)')
    ins.run('Lecture Hall A','LH-101','Classroom',120,'Block A',1,'Main','["Projector","AC","Whiteboard"]','Available',85)
    ins.run('Seminar Room B','SR-102','Classroom',40,'Block A',1,'Main','["Projector","AC"]','Occupied',92)
    ins.run('CS Lab 1','LAB-CS1','Lab',30,'Block B',2,'Main','["30 PCs","AC","Projector"]','Available',68)
    ins.run('Electronics Lab','LAB-EE1','Lab',25,'Block C',1,'Main','["Oscilloscopes","AC"]','Maintenance',0)
    ins.run('Tutorial Room C','TR-103','Classroom',20,'Block A',2,'Main','["Whiteboard"]','Available',45)
    ins.run('Physics Lab','LAB-PH1','Lab',28,'Block D',1,'Main','["Equipment","AC"]','Occupied',78)
    ins.run('Lecture Hall B','LH-201','Classroom',100,'Block B',1,'North','["Projector","AC","Smart Board"]','Available',62)
    ins.run('Network Lab','LAB-NET1','Lab',24,'Block E',3,'Main','["24 PCs","Cisco Equipment"]','Available',55)
  }

  // Lecturers
  if (!db.prepare('SELECT id FROM lecturers LIMIT 1').get()) {
    const ins = db.prepare('INSERT INTO lecturers (name,staff_id,department,campus,courses,assigned_hours,completed_hours,hec_limit,status) VALUES (?,?,?,?,?,?,?,?,?)')
    ins.run('Dr. Fatima Ali','STF001','Computer Science','Main','["CS301","CS401","CS501"]',27,18,40,'Active')
    ins.run('Prof. Usman Malik','STF002','Electrical Engineering','Main','["EE301","EE401"]',18,12,40,'Active')
    ins.run('Dr. Ahmed Khan','STF003','Computer Science','Main','["CS601","CS701"]',36,24,40,'Near Limit')
    ins.run('Dr. Sara Ahmed','STF004','Electrical Engineering','North','["EE201","EE501","EE601"]',38,28,40,'Near Limit')
    ins.run('Prof. Bilal Hassan','STF005','Physics','Main','["PH301","PH401"]',18,10,40,'Active')
    ins.run('Dr. Zara Malik','STF006','Business','Main','["BUS301","BUS401","BUS501","BUS601"]',42,30,40,'Over Limit')
  }

  // Equipment
  if (!db.prepare('SELECT id FROM equipment LIMIT 1').get()) {
    const ins = db.prepare('INSERT INTO equipment (name,code,category,total,available,campus,status,last_maintenance) VALUES (?,?,?,?,?,?,?,?)')
    ins.run('Portable Projector','EQ-PROJ-01','AV Equipment',8,5,'Main','Good','2024-03-15')
    ins.run('Laptop (Dell)','EQ-LAP-01','Computing',20,13,'Main','Good','2024-02-20')
    ins.run('Video Camera','EQ-CAM-01','AV Equipment',4,4,'Main','Good','2024-01-10')
    ins.run('Wireless Microphone','EQ-MIC-01','Audio',10,7,'Main','Good','2024-03-01')
    ins.run('Oscilloscope','EQ-OSC-01','Lab Equipment',12,8,'Main','Maintenance','2024-04-01')
    ins.run('3D Printer','EQ-3DP-01','Fabrication',3,2,'Main','Good','2024-03-20')
    ins.run('Smart Board','EQ-SB-01','AV Equipment',6,6,'North','Good','2024-02-15')
  }

  // Events
  if (!db.prepare('SELECT id FROM events LIMIT 1').get()) {
    const ins = db.prepare('INSERT INTO events (title,type,date,end_date,venue,campus,organizer,capacity,registered,status) VALUES (?,?,?,?,?,?,?,?,?,?)')
    ins.run('Annual Tech Symposium 2024','Academic','2024-05-15','2024-05-16','Main Auditorium','Main','CS Department',500,342,'Upcoming')
    ins.run('HEC Accreditation Visit','Accreditation','2024-05-20','2024-05-22','Admin Block','Main','Administration',100,87,'Upcoming')
    ins.run('Freshmen Orientation','Student','2024-04-25','2024-04-25','Lecture Hall A','Main','Registry',300,289,'Upcoming')
    ins.run('Research Paper Presentation','Academic','2024-04-18','2024-04-18','Seminar Room B','Main','Research Dept',60,54,'Completed')
    ins.run('Industry Connect Day','Career','2024-06-05','2024-06-05','Sports Complex','North','Career Services',800,210,'Upcoming')
  }

  // Accreditation
  if (!db.prepare('SELECT id FROM accreditation_reports LIMIT 1').get()) {
    const ins = db.prepare('INSERT INTO accreditation_reports (title,type,period,status,score,deadline,submitted_on,auditor) VALUES (?,?,?,?,?,?,?,?)')
    ins.run('HEC Annual Compliance Report','HEC','2023-24','Submitted',94,'2024-03-31','2024-03-28','HEC Pakistan')
    ins.run('AAA Program Accreditation','AAA','2023-24','In Review',88,'2024-05-15','2024-04-10','AAA Board')
    ins.run('Faculty Workload Report Q1','HEC','Q1 2024','Draft',null,'2024-04-30',null,'HEC Pakistan')
    ins.run('Lab Utilization Report','Internal','2023-24','Approved',91,'2024-02-28','2024-02-25','Internal Audit')
    ins.run('Student-Faculty Ratio Report','HEC','2023-24','Submitted',96,'2024-03-15','2024-03-12','HEC Pakistan')
  }

  // Lab sessions
  if (!db.prepare('SELECT id FROM lab_sessions LIMIT 1').get()) {
    const ins = db.prepare('INSERT INTO lab_sessions (lab,course,date,time,students,instructor,status) VALUES (?,?,?,?,?,?,?)')
    ins.run('CS Lab 1','CS401 - Database Systems','2024-04-22','10:00-12:00',28,'Dr. Fatima Ali','Active')
    ins.run('Electronics Lab','EE301 - Circuit Theory','2024-04-22','14:00-16:00',22,'Prof. Usman Malik','Scheduled')
    ins.run('Physics Lab','PH301 - Physics','2024-04-23','09:00-11:00',25,'Prof. Bilal Hassan','Scheduled')
    ins.run('Network Lab','CS601 - Network Security','2024-04-24','13:00-15:00',20,'Dr. Ahmed Khan','Scheduled')
    ins.run('CS Lab 1','CS301 - OOP Lab','2024-04-25','08:00-10:00',30,'Dr. Fatima Ali','Scheduled')
  }

  // Bookings
  if (!db.prepare('SELECT id FROM bookings LIMIT 1').get()) {
    const ins = db.prepare('INSERT INTO bookings (title,room_code,type,date,start_time,end_time,requested_by,department,status) VALUES (?,?,?,?,?,?,?,?,?)')
    ins.run('CS301 Lecture','LH-101','Classroom','2024-04-22','08:00','10:00','Dr. Fatima Ali','Computer Science','Approved')
    ins.run('Database Lab Session','LAB-CS1','Lab','2024-04-22','10:00','12:00','Prof. Usman Malik','Computer Science','Approved')
    ins.run('EE301 Tutorial','TR-103','Classroom','2024-04-22','14:00','15:00','Dr. Sara Ahmed','Electrical Engineering','Pending')
    ins.run('Research Seminar','SR-102','Classroom','2024-04-23','11:00','13:00','Dr. Ahmed Khan','Computer Science','Pending')
    ins.run('Physics Experiment','LAB-PH1','Lab','2024-04-23','09:00','11:00','Prof. Bilal Hassan','Physics','Approved')
  }
})

seed()

module.exports = db
