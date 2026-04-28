const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('./db')

const app = express()
const PORT = 3001
const SECRET = process.env.JWT_SECRET || 'uroms-secret-key-2024'

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:4173',
    /\.vercel\.app$/,
    'https://uroms-backend.onrender.com',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true
}))
app.use(express.json())

// ── Auth middleware ──────────────────────────────────────────────────────────
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  try {
    req.user = jwt.verify(token, SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// ── Auth routes ──────────────────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid email or password' })
  db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user.id)
  const { password: _, ...safe } = user
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET, { expiresIn: '7d' })
  res.json({ token, user: safe })
})

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role = 'Faculty', department, campus = 'Main' } = req.body
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' })
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })
  if (db.prepare('SELECT id FROM users WHERE email = ?').get(email))
    return res.status(409).json({ error: 'Email already registered' })
  const hash = bcrypt.hashSync(password, 10)
  const result = db.prepare('INSERT INTO users (name,email,password,role,department,campus) VALUES (?,?,?,?,?,?)').run(name, email, hash, role, department, campus)
  const user = db.prepare('SELECT id,name,email,role,department,campus,status FROM users WHERE id = ?').get(result.lastInsertRowid)
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET, { expiresIn: '7d' })
  res.status(201).json({ token, user })
})

// ── Rooms ────────────────────────────────────────────────────────────────────
app.get('/api/rooms', auth, (req, res) => {
  const rows = db.prepare('SELECT * FROM rooms ORDER BY id').all()
  res.json(rows.map(r => ({ ...r, features: JSON.parse(r.features || '[]') })))
})

app.post('/api/rooms', auth, (req, res) => {
  const { name, code, type, capacity, building, floor = 1, campus = 'Main', features = [], status = 'Available' } = req.body
  if (!name || !code || !type || !capacity) return res.status(400).json({ error: 'name, code, type, capacity required' })
  if (db.prepare('SELECT id FROM rooms WHERE code = ?').get(code))
    return res.status(409).json({ error: 'Room code already exists' })
  const r = db.prepare('INSERT INTO rooms (name,code,type,capacity,building,floor,campus,features,status) VALUES (?,?,?,?,?,?,?,?,?)').run(name, code, type, capacity, building, floor, campus, JSON.stringify(features), status)
  res.status(201).json(db.prepare('SELECT * FROM rooms WHERE id = ?').get(r.lastInsertRowid))
})

app.put('/api/rooms/:id', auth, (req, res) => {
  const { name, status, utilization } = req.body
  db.prepare('UPDATE rooms SET name=COALESCE(?,name), status=COALESCE(?,status), utilization=COALESCE(?,utilization) WHERE id=?').run(name, status, utilization, req.params.id)
  res.json(db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id))
})

// ── Bookings ─────────────────────────────────────────────────────────────────
app.get('/api/bookings', auth, (req, res) => {
  res.json(db.prepare('SELECT * FROM bookings ORDER BY date DESC, start_time').all())
})

app.post('/api/bookings', auth, (req, res) => {
  const { title, room_code, type, date, start_time, end_time, requested_by, department } = req.body
  if (!title || !room_code || !date || !start_time || !end_time)
    return res.status(400).json({ error: 'title, room_code, date, start_time, end_time required' })
  // Conflict check
  const conflict = db.prepare(`SELECT id FROM bookings WHERE room_code=? AND date=? AND status!='Rejected' AND NOT (end_time<=? OR start_time>=?)`).get(room_code, date, start_time, end_time)
  if (conflict) return res.status(409).json({ error: 'Room already booked for this time slot' })
  const r = db.prepare('INSERT INTO bookings (title,room_code,type,date,start_time,end_time,requested_by,user_id,department) VALUES (?,?,?,?,?,?,?,?,?)').run(title, room_code, type, date, start_time, end_time, requested_by || req.user.email, req.user.id, department)
  res.status(201).json(db.prepare('SELECT * FROM bookings WHERE id = ?').get(r.lastInsertRowid))
})

app.put('/api/bookings/:id/status', auth, (req, res) => {
  const { status } = req.body
  if (!['Approved', 'Rejected', 'Pending'].includes(status)) return res.status(400).json({ error: 'Invalid status' })
  db.prepare('UPDATE bookings SET status=? WHERE id=?').run(status, req.params.id)
  res.json(db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id))
})

// ── Lecturers ────────────────────────────────────────────────────────────────
app.get('/api/lecturers', auth, (req, res) => {
  const rows = db.prepare('SELECT * FROM lecturers ORDER BY id').all()
  res.json(rows.map(r => ({ ...r, courses: JSON.parse(r.courses || '[]') })))
})

app.post('/api/lecturers', auth, (req, res) => {
  const { name, staff_id, department, campus = 'Main', courses = [], assigned_hours = 0, hec_limit = 40 } = req.body
  if (!name || !staff_id) return res.status(400).json({ error: 'name and staff_id required' })
  if (db.prepare('SELECT id FROM lecturers WHERE staff_id = ?').get(staff_id))
    return res.status(409).json({ error: 'Staff ID already exists' })
  const status = assigned_hours > hec_limit ? 'Over Limit' : assigned_hours >= hec_limit * 0.8 ? 'Near Limit' : 'Active'
  const r = db.prepare('INSERT INTO lecturers (name,staff_id,department,campus,courses,assigned_hours,hec_limit,status) VALUES (?,?,?,?,?,?,?,?)').run(name, staff_id, department, campus, JSON.stringify(courses), assigned_hours, hec_limit, status)
  res.status(201).json(db.prepare('SELECT * FROM lecturers WHERE id = ?').get(r.lastInsertRowid))
})

app.post('/api/lecturers/:id/workload', auth, (req, res) => {
  const { course_code, hours } = req.body
  if (!course_code || !hours) return res.status(400).json({ error: 'course_code and hours required' })
  const lec = db.prepare('SELECT * FROM lecturers WHERE id = ?').get(req.params.id)
  if (!lec) return res.status(404).json({ error: 'Lecturer not found' })
  const courses = JSON.parse(lec.courses || '[]')
  if (!courses.includes(course_code)) courses.push(course_code)
  const newHours = lec.assigned_hours + Number(hours)
  const status = newHours > lec.hec_limit ? 'Over Limit' : newHours >= lec.hec_limit * 0.8 ? 'Near Limit' : 'Active'
  db.prepare('UPDATE lecturers SET courses=?, assigned_hours=?, status=? WHERE id=?').run(JSON.stringify(courses), newHours, status, req.params.id)
  res.json(db.prepare('SELECT * FROM lecturers WHERE id = ?').get(req.params.id))
})

// ── Equipment ────────────────────────────────────────────────────────────────
app.get('/api/equipment', auth, (req, res) => {
  res.json(db.prepare('SELECT * FROM equipment ORDER BY id').all())
})

app.post('/api/equipment', auth, (req, res) => {
  const { name, code, category, total, campus = 'Main', status = 'Good', last_maintenance } = req.body
  if (!name || !code || !total) return res.status(400).json({ error: 'name, code, total required' })
  if (db.prepare('SELECT id FROM equipment WHERE code = ?').get(code))
    return res.status(409).json({ error: 'Equipment code already exists' })
  const r = db.prepare('INSERT INTO equipment (name,code,category,total,available,campus,status,last_maintenance) VALUES (?,?,?,?,?,?,?,?)').run(name, code, category, total, total, campus, status, last_maintenance)
  res.status(201).json(db.prepare('SELECT * FROM equipment WHERE id = ?').get(r.lastInsertRowid))
})

app.get('/api/equipment-bookings', auth, (req, res) => {
  res.json(db.prepare('SELECT * FROM equipment_bookings ORDER BY created_at DESC').all())
})

app.post('/api/equipment-bookings', auth, (req, res) => {
  const { equipment_id, quantity, borrower, purpose, borrow_date, return_date } = req.body
  if (!equipment_id || !quantity || !borrow_date || !return_date)
    return res.status(400).json({ error: 'equipment_id, quantity, borrow_date, return_date required' })
  const eq = db.prepare('SELECT * FROM equipment WHERE id = ?').get(equipment_id)
  if (!eq) return res.status(404).json({ error: 'Equipment not found' })
  if (eq.available < quantity) return res.status(400).json({ error: `Only ${eq.available} units available` })
  db.prepare('UPDATE equipment SET available = available - ? WHERE id = ?').run(quantity, equipment_id)
  const r = db.prepare('INSERT INTO equipment_bookings (equipment_id,item_name,quantity,borrower,purpose,borrow_date,return_date) VALUES (?,?,?,?,?,?,?)').run(equipment_id, eq.name, quantity, borrower || req.user.email, purpose, borrow_date, return_date)
  res.status(201).json(db.prepare('SELECT * FROM equipment_bookings WHERE id = ?').get(r.lastInsertRowid))
})

// ── Events ───────────────────────────────────────────────────────────────────
app.get('/api/events', auth, (req, res) => {
  res.json(db.prepare('SELECT * FROM events ORDER BY date').all())
})

app.post('/api/events', auth, (req, res) => {
  const { title, type, date, end_date, venue, campus = 'Main', organizer, capacity } = req.body
  if (!title || !date || !venue || !capacity) return res.status(400).json({ error: 'title, date, venue, capacity required' })
  const r = db.prepare('INSERT INTO events (title,type,date,end_date,venue,campus,organizer,capacity) VALUES (?,?,?,?,?,?,?,?)').run(title, type, date, end_date || date, venue, campus, organizer, capacity)
  res.status(201).json(db.prepare('SELECT * FROM events WHERE id = ?').get(r.lastInsertRowid))
})

app.post('/api/events/:id/register', auth, (req, res) => {
  const ev = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id)
  if (!ev) return res.status(404).json({ error: 'Event not found' })
  if (ev.registered >= ev.capacity) return res.status(400).json({ error: 'Event is at full capacity' })
  db.prepare('UPDATE events SET registered = registered + 1 WHERE id = ?').run(req.params.id)
  res.json(db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id))
})

// ── Accreditation ────────────────────────────────────────────────────────────
app.get('/api/accreditation', auth, (req, res) => {
  res.json(db.prepare('SELECT * FROM accreditation_reports ORDER BY deadline').all())
})

app.post('/api/accreditation', auth, (req, res) => {
  const { title, type, period, deadline, auditor } = req.body
  if (!title || !deadline) return res.status(400).json({ error: 'title and deadline required' })
  const r = db.prepare('INSERT INTO accreditation_reports (title,type,period,deadline,auditor) VALUES (?,?,?,?,?)').run(title, type, period, deadline, auditor)
  res.status(201).json(db.prepare('SELECT * FROM accreditation_reports WHERE id = ?').get(r.lastInsertRowid))
})

app.put('/api/accreditation/:id/submit', auth, (req, res) => {
  const { score } = req.body
  db.prepare('UPDATE accreditation_reports SET status="Submitted", score=?, submitted_on=date("now") WHERE id=?').run(score, req.params.id)
  res.json(db.prepare('SELECT * FROM accreditation_reports WHERE id = ?').get(req.params.id))
})

// ── Users ────────────────────────────────────────────────────────────────────
app.get('/api/users', auth, (req, res) => {
  res.json(db.prepare('SELECT id,name,email,role,department,campus,status,last_login,created_at FROM users ORDER BY id').all())
})

app.post('/api/users', auth, (req, res) => {
  const { name, email, password, role = 'Faculty', department, campus = 'Main' } = req.body
  if (!name || !email || !password) return res.status(400).json({ error: 'name, email, password required' })
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })
  if (db.prepare('SELECT id FROM users WHERE email = ?').get(email))
    return res.status(409).json({ error: 'Email already registered' })
  const hash = bcrypt.hashSync(password, 10)
  const r = db.prepare('INSERT INTO users (name,email,password,role,department,campus) VALUES (?,?,?,?,?,?)').run(name, email, hash, role, department, campus)
  res.status(201).json(db.prepare('SELECT id,name,email,role,department,campus,status FROM users WHERE id = ?').get(r.lastInsertRowid))
})

app.put('/api/users/:id/status', auth, (req, res) => {
  const { status } = req.body
  db.prepare('UPDATE users SET status=? WHERE id=?').run(status, req.params.id)
  res.json({ success: true })
})

// ── Lab sessions ─────────────────────────────────────────────────────────────
app.get('/api/lab-sessions', auth, (req, res) => {
  res.json(db.prepare('SELECT * FROM lab_sessions ORDER BY date, time').all())
})

app.post('/api/lab-sessions', auth, (req, res) => {
  const { lab, course, date, time, students, instructor } = req.body
  if (!lab || !course || !date) return res.status(400).json({ error: 'lab, course, date required' })
  const r = db.prepare('INSERT INTO lab_sessions (lab,course,date,time,students,instructor) VALUES (?,?,?,?,?,?)').run(lab, course, date, time, students || 0, instructor)
  res.status(201).json(db.prepare('SELECT * FROM lab_sessions WHERE id = ?').get(r.lastInsertRowid))
})

// ── Dashboard stats ──────────────────────────────────────────────────────────
app.get('/api/stats', auth, (req, res) => {
  res.json({
    totalRooms: db.prepare('SELECT COUNT(*) as c FROM rooms').get().c,
    totalLabs: db.prepare('SELECT COUNT(*) as c FROM rooms WHERE type="Lab"').get().c,
    activeBookings: db.prepare('SELECT COUNT(*) as c FROM bookings WHERE status="Approved"').get().c,
    pendingApprovals: db.prepare('SELECT COUNT(*) as c FROM bookings WHERE status="Pending"').get().c,
    totalLecturers: db.prepare('SELECT COUNT(*) as c FROM lecturers').get().c,
    totalStudents: db.prepare('SELECT COUNT(*) as c FROM users WHERE role="Student"').get().c,
    equipmentItems: db.prepare('SELECT SUM(total) as c FROM equipment').get().c || 0,
    upcomingEvents: db.prepare('SELECT COUNT(*) as c FROM events WHERE status="Upcoming"').get().c,
    utilizationRate: 73,
    hecCompliant: 91,
  })
})

app.listen(PORT, () => console.log(`UROMS API running on http://localhost:${PORT}`))
