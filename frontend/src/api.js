const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const token = () => localStorage.getItem('uroms_token')

async function req(method, path, body) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
    return data
  } catch (e) {
    if (e.message === 'Failed to fetch') throw new Error('Cannot reach server. Please ensure the backend is running.')
    throw e
  }
}

export const api = {
  // Auth
  login:    (email, password) => req('POST', '/auth/login', { email, password }),
  register: (name, email, password, role, department, campus) =>
    req('POST', '/auth/register', { name, email, password, role, department, campus }),

  // Stats
  stats: () => req('GET', '/stats'),

  // Rooms / Classrooms
  rooms:      ()     => req('GET',  '/rooms'),
  addRoom:    body   => req('POST', '/rooms', body),
  updateRoom: (id, body) => req('PUT', `/rooms/${id}`, body),

  // Bookings
  bookings:            ()         => req('GET',  '/bookings'),
  addBooking:          body       => req('POST', '/bookings', body),
  updateBookingStatus: (id, status) => req('PUT', `/bookings/${id}/status`, { status }),

  // Lecturers / Workloads
  lecturers:      ()       => req('GET',  '/lecturers'),
  addLecturer:    body     => req('POST', '/lecturers', body),
  assignWorkload: (id, body) => req('POST', `/lecturers/${id}/workload`, body),

  // Equipment
  equipment:        ()     => req('GET',  '/equipment'),
  addEquipment:     body   => req('POST', '/equipment', body),
  equipmentBookings: ()    => req('GET',  '/equipment-bookings'),
  bookEquipment:    body   => req('POST', '/equipment-bookings', body),

  // Events
  events:        ()   => req('GET',  '/events'),
  addEvent:      body => req('POST', '/events', body),
  registerEvent: id   => req('POST', `/events/${id}/register`),

  // Accreditation
  accreditation:       ()          => req('GET',  '/accreditation'),
  addAccreditation:    body        => req('POST', '/accreditation', body),
  submitAccreditation: (id, score) => req('PUT',  `/accreditation/${id}/submit`, { score }),

  // Users
  users:            ()         => req('GET',  '/users'),
  addUser:          body       => req('POST', '/users', body),
  updateUserStatus: (id, status) => req('PUT', `/users/${id}/status`, { status }),

  // Lab sessions
  labSessions:    ()   => req('GET',  '/lab-sessions'),
  addLabSession:  body => req('POST', '/lab-sessions', body),
}
