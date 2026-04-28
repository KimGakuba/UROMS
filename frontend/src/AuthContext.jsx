import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export const PERMISSIONS = {
  Administrator: new Set([
    'nav:dashboard','nav:classrooms','nav:labs','nav:workloads',
    'nav:equipment','nav:events','nav:analytics','nav:users',
    'nav:accreditation','nav:news',
    'room:book','room:approve','room:add','room:edit',
    'lab:schedule','lab:approve','lab:add',
    'workload:assign','workload:view_all',
    'equipment:book','equipment:add','equipment:edit',
    'event:create','event:register','event:manage',
    'analytics:view','analytics:export',
    'users:add','users:edit','users:deactivate','users:view','users:approve',
    'accreditation:create','accreditation:submit','accreditation:download','accreditation:view',
    'news:post','news:delete',
  ]),
  Staff: new Set([
    'nav:dashboard','nav:classrooms','nav:labs','nav:workloads',
    'nav:equipment','nav:events','nav:analytics','nav:news',
    'room:book','lab:schedule','workload:view_all','equipment:book',
    'event:create','event:register','analytics:view',
    'accreditation:view','accreditation:download',
  ]),
  Student: new Set([
    'nav:dashboard','nav:classrooms','nav:labs',
    'nav:equipment','nav:events','nav:news',
    'room:book','lab:schedule','equipment:book','event:register',
  ]),
}

const ROLE_TO_PERM = {
  Administrator:'Administrator', Faculty:'Staff', 'Lab Technician':'Staff',
  'Department Head':'Staff', Registry:'Staff', HoD:'Staff', Lecturer:'Staff', Student:'Student',
}

export const ROLE_BADGE = {
  Administrator:    { bg:'#fef2f2', color:'#c0392b', border:'#fecaca' },
  Faculty:          { bg:'#f0fdf4', color:'#166534', border:'#bbf7d0' },
  'Lab Technician': { bg:'#eff6ff', color:'#1d4ed8', border:'#bfdbfe' },
  'Department Head':{ bg:'#fdf4ff', color:'#7e22ce', border:'#e9d5ff' },
  Registry:         { bg:'#fff7ed', color:'#c2410c', border:'#fed7aa' },
  HoD:              { bg:'#fdf4ff', color:'#7e22ce', border:'#e9d5ff' },
  Lecturer:         { bg:'#f0fdf4', color:'#166534', border:'#bbf7d0' },
  Student:          { bg:'#eff6ff', color:'#1d4ed8', border:'#bfdbfe' },
}

// ── Only the admin is seeded — everyone else must register ───────────────────
const ADMIN_SEED = [
  { id:1, name:'Admin User', email:'admin@uroms.ac', password:'admin123',
    role:'Administrator', department:'Administration', campus:'Main', status:'Active' },
]

const USERS_KEY   = 'uroms_auth_users'
const USER_KEY    = 'uroms_user'
const SESSION_VER = 'uroms_session_v5'

// Reset stale session on new version; preserve registered users but re-seed admin
if (!sessionStorage.getItem(SESSION_VER)) {
  localStorage.removeItem(USER_KEY)
  try {
    const existing = JSON.parse(localStorage.getItem(USERS_KEY)) || []
    // Keep all non-admin registered users, always ensure admin exists
    const nonAdmin = existing.filter(u => u.email.toLowerCase() !== 'admin@uroms.ac')
    localStorage.setItem(USERS_KEY, JSON.stringify([...ADMIN_SEED, ...nonAdmin]))
  } catch {
    localStorage.setItem(USERS_KEY, JSON.stringify(ADMIN_SEED))
  }
  sessionStorage.setItem(SESSION_VER, '1')
}

const loadUsers = () => {
  try {
    const s = JSON.parse(localStorage.getItem(USERS_KEY))
    if (s && s.length) return s
  } catch { /* ignore */ }
  localStorage.setItem(USERS_KEY, JSON.stringify(ADMIN_SEED))
  return ADMIN_SEED
}

const saveUsers = list => localStorage.setItem(USERS_KEY, JSON.stringify(list))

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
  })

  const permRole = user ? (ROLE_TO_PERM[user.role] || 'Student') : 'Student'
  const perms    = PERMISSIONS[permRole] || PERMISSIONS.Student
  const can      = action => perms.has(action)

  const login = (email, password) => {
    if (!email || !password) return 'Email and password are required'
    const users = loadUsers()
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
    if (!found) return 'Invalid email or password'
    if (found.status === 'Inactive')  return 'This account has been deactivated'
    if (found.status === 'Pending')   return 'Your account is awaiting admin approval'
    if (found.status === 'Rejected')  return 'Your account request was rejected. Contact the administrator.'
    const { password: _, ...safe } = found
    setUser(safe)
    localStorage.setItem(USER_KEY, JSON.stringify(safe))
    return null
  }

  // Students are auto-approved; all other roles go Pending until admin approves
  const register = (name, email, password, role = 'Student', department = '', campus = 'Main') => {
    if (!name || !email || !password) return 'All fields are required'
    if (password.length < 6) return 'Password must be at least 6 characters'
    const users = loadUsers()
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) return 'Email already registered'
    const isStudent = role === 'Student'
    const newUser = {
      id: Date.now(), name, email, password, role, department, campus,
      status: isStudent ? 'Active' : 'Pending',
      registeredAt: new Date().toISOString(),
    }
    saveUsers([...users, newUser])
    // Students log in immediately; others must wait for approval
    if (isStudent) {
      const { password: _, ...safe } = newUser
      setUser(safe)
      localStorage.setItem(USER_KEY, JSON.stringify(safe))
    }
    return null
  }

  // Admin approves or rejects a pending user
  const approveUser = (id, decision) => {
    const users = loadUsers()
    const updated = users.map(u => u.id === id ? { ...u, status: decision } : u)
    saveUsers(updated)
    return updated
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(USER_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, can, permRole, login, register, approveUser, logout, loadUsers }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
