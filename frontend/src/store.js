// ── Central localStorage store — replaces all API calls ─────────────────────
import { rooms as seedRooms, lecturers as seedLecturers, equipment as seedEquipment, events as seedEvents, accreditationReports as seedAccreditation, bookingTrends, utilizationData, resourceDistribution } from './data'

const get = (key, seed) => { try { const s = JSON.parse(localStorage.getItem(key)); return s && s.length ? s : seed } catch { return seed } }
const set = (key, val) => localStorage.setItem(key, JSON.stringify(val))

// ── Rooms ────────────────────────────────────────────────────────────────────
export const getRooms       = ()    => get('uroms_rooms', seedRooms)
export const saveRooms      = list  => set('uroms_rooms', list)

// ── Bookings ─────────────────────────────────────────────────────────────────
const SEED_BOOKINGS = [
  { id:1, title:'CS301 Lecture',      room_code:'LH-101',   type:'Classroom', date:'2024-04-22', start_time:'08:00', end_time:'10:00', requested_by:'Dr. Fatima Ali',    department:'Computer Science',      status:'Approved' },
  { id:2, title:'Database Lab',       room_code:'LAB-CS1',  type:'Lab',       date:'2024-04-22', start_time:'10:00', end_time:'12:00', requested_by:'Prof. Usman Malik', department:'Computer Science',      status:'Approved' },
  { id:3, title:'EE301 Tutorial',     room_code:'TR-103',   type:'Classroom', date:'2024-04-22', start_time:'14:00', end_time:'15:00', requested_by:'Dr. Sara Ahmed',    department:'Electrical Engineering',status:'Pending'  },
  { id:4, title:'Research Seminar',   room_code:'SR-102',   type:'Classroom', date:'2024-04-23', start_time:'11:00', end_time:'13:00', requested_by:'Dr. Ahmed Khan',    department:'Computer Science',      status:'Pending'  },
]
export const getBookings    = ()    => get('uroms_bookings', SEED_BOOKINGS)
export const saveBookings   = list  => set('uroms_bookings', list)
export const addBooking     = item  => { const list = [...getBookings(), { ...item, id:Date.now(), status:'Pending' }]; saveBookings(list); return list }

// ── Lab sessions ─────────────────────────────────────────────────────────────
const SEED_SESSIONS = [
  { id:1, lab:'CS Lab 1',       course:'CS401 - Database Systems', date:'2024-04-22', time:'10:00-12:00', students:28, instructor:'Dr. Fatima Ali',    status:'Active'    },
  { id:2, lab:'Electronics Lab',course:'EE301 - Circuit Theory',   date:'2024-04-22', time:'14:00-16:00', students:22, instructor:'Prof. Usman Malik', status:'Scheduled' },
  { id:3, lab:'Physics Lab',    course:'PH301 - Physics',          date:'2024-04-23', time:'09:00-11:00', students:25, instructor:'Prof. Bilal Hassan',status:'Scheduled' },
  { id:4, lab:'Network Lab',    course:'CS601 - Network Security',  date:'2024-04-24', time:'13:00-15:00', students:20, instructor:'Dr. Ahmed Khan',    status:'Scheduled' },
]
export const getSessions    = ()    => get('uroms_sessions', SEED_SESSIONS)
export const saveSessions   = list  => set('uroms_sessions', list)
export const addSession     = item  => { const list = [...getSessions(), { ...item, id:Date.now(), status:'Scheduled' }]; saveSessions(list); return list }

// ── Lecturers ────────────────────────────────────────────────────────────────
export const getLecturers   = ()    => get('uroms_lecturers', seedLecturers.map(l => ({ ...l, assigned_hours: l.assignedHours, completed_hours: l.completedHours, hec_limit: l.hecLimit, staff_id: l.staffId, courses: l.courses })))
export const saveLecturers  = list  => set('uroms_lecturers', list)

// ── Equipment ────────────────────────────────────────────────────────────────
export const getEquipment   = ()    => get('uroms_equipment', seedEquipment.map(e => ({ ...e, last_maintenance: e.lastMaintenance })))
export const saveEquipment  = list  => set('uroms_equipment', list)

const SEED_EQ_BOOKINGS = [
  { id:1, item_name:'Portable Projector', quantity:2, borrower:'Dr. Fatima Ali', borrow_date:'2024-04-22', return_date:'2024-04-22', status:'Active'   },
  { id:2, item_name:'Laptop (Dell)',       quantity:5, borrower:'CS Department',  borrow_date:'2024-04-20', return_date:'2024-04-25', status:'Active'   },
  { id:3, item_name:'Wireless Microphone',quantity:1, borrower:'Events Team',    borrow_date:'2024-04-18', return_date:'2024-04-18', status:'Returned' },
]
export const getEqBookings  = ()    => get('uroms_eq_bookings', SEED_EQ_BOOKINGS)
export const saveEqBookings = list  => set('uroms_eq_bookings', list)

// ── Events ───────────────────────────────────────────────────────────────────
export const getEvents      = ()    => get('uroms_events', seedEvents.map(e => ({ ...e, end_date: e.endDate })))
export const saveEvents     = list  => set('uroms_events', list)

// ── Accreditation ────────────────────────────────────────────────────────────
export const getAccreditation  = ()   => get('uroms_accreditation', seedAccreditation.map(r => ({ ...r, submitted_on: r.submittedOn })))
export const saveAccreditation = list => set('uroms_accreditation', list)

// ── Dashboard stats ──────────────────────────────────────────────────────────
export const getStats = () => {
  const rooms    = getRooms()
  const bookings = getBookings()
  const lecs     = getLecturers()
  const eq       = getEquipment()
  const evts     = getEvents()
  try {
    const users = JSON.parse(localStorage.getItem('uroms_auth_users')) || []
    return {
      totalRooms:      rooms.length,
      totalLabs:       rooms.filter(r => r.type === 'Lab').length,
      activeBookings:  bookings.filter(b => b.status === 'Approved').length,
      pendingApprovals:bookings.filter(b => b.status === 'Pending').length,
      totalLecturers:  lecs.length,
      totalStudents:   users.filter(u => u.role === 'Student' && u.status === 'Active').length,
      equipmentItems:  eq.reduce((a, e) => a + e.total, 0),
      upcomingEvents:  evts.filter(e => e.status === 'Upcoming').length,
      utilizationRate: 73,
      hecCompliant:    91,
    }
  } catch { return { totalRooms:48, totalLabs:12, activeBookings:127, pendingApprovals:23, totalLecturers:84, totalStudents:0, equipmentItems:215, upcomingEvents:9, utilizationRate:73, hecCompliant:91 } }
}

export { bookingTrends, utilizationData, resourceDistribution }
