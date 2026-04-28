import { Routes, Route, NavLink, useLocation, Navigate, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { LayoutDashboard, Building2, FlaskConical, BookMarked, Cpu,
  CalendarDays, BarChart3, Users, FileText, Bell, Menu,
  GraduationCap, ChevronRight, LogOut, X, ShieldAlert, Newspaper
} from 'lucide-react'
import { useAuth, ROLE_BADGE } from './AuthContext'
import LandingPage    from './pages/LandingPage'
import Login          from './pages/Login'
import Signup         from './pages/Signup'
import Dashboard      from './pages/Dashboard'
import Classrooms     from './pages/Classrooms'
import Labs           from './pages/Labs'
import Workloads      from './pages/Workloads'
import Equipment      from './pages/Equipment'
import Events         from './pages/Events'
import Analytics      from './pages/Analytics'
import UsersPage      from './pages/UsersPage'
import Accreditation  from './pages/Accreditation'
import News           from './pages/News'

const C = {
  bg:'var(--bg)', surface:'var(--surface)', surface2:'var(--surface2)', surface3:'var(--surface3)',
  border:'var(--border)', borderDim:'var(--border-dim)',
  accent:'var(--accent)', accentDim:'var(--accent-dim)',
  text:'var(--text-primary)', textSec:'var(--text-secondary)', textMuted:'var(--text-muted)',
  danger:'var(--danger)',
}

// Each nav item declares which permission key gates it
const ALL_NAV = [
  { to:'/dashboard',     label:'Dashboard',     icon:LayoutDashboard, perm:'nav:dashboard' },
  { to:'/classrooms',    label:'Classrooms',    icon:Building2,       perm:'nav:classrooms' },
  { to:'/labs',          label:'Laboratories',  icon:FlaskConical,    perm:'nav:labs' },
  { to:'/workloads',     label:'Workloads',     icon:BookMarked,      perm:'nav:workloads' },
  { to:'/equipment',     label:'Equipment',     icon:Cpu,             perm:'nav:equipment' },
  { to:'/events',        label:'Events',        icon:CalendarDays,    perm:'nav:events' },
  { to:'/news',          label:'News',          icon:Newspaper,       perm:'nav:news' },
  { to:'/analytics',     label:'Analytics',     icon:BarChart3,       perm:'nav:analytics' },
  { to:'/users',         label:'Users',         icon:Users,           perm:'nav:users' },
  { to:'/accreditation', label:'Accreditation', icon:FileText,        perm:'nav:accreditation' },
]

const NOTIFS_INIT = [
  { t:'Booking Approved',    d:'LH-101 for CS301 Lecture',         read:false },
  { t:'Workload Alert',      d:'Dr. Zara exceeded HEC limit',      read:false },
  { t:'New Booking Request', d:'SR-102 for Research Seminar',      read:false },
]

// Shown when a user tries to access a page they don't have permission for
function AccessDenied() {
  const nav = useNavigate()
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'60vh', gap:16, textAlign:'center' }}>
      <div style={{ width:64, height:64, borderRadius:20, background:'var(--surface2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <ShieldAlert size={28} style={{ color:'var(--danger)' }} />
      </div>
      <h2 style={{ color:'var(--text-primary)', fontWeight:800, fontSize:22, margin:0 }}>Access Denied</h2>
      <p style={{ color:'var(--text-muted)', fontSize:14, maxWidth:320, margin:0 }}>
        You don't have permission to view this page. Contact your administrator if you think this is a mistake.
      </p>
      <button onClick={() => nav('/dashboard')}
        className="gradient-btn"
        style={{ padding:'10px 28px', borderRadius:10, fontWeight:700, fontSize:14, cursor:'pointer', marginTop:8 }}>
        Back to Dashboard
      </button>
    </div>
  )
}

// Wraps a route — renders AccessDenied if user lacks the permission
function Guard({ perm, children }) {
  const { can } = useAuth()
  return can(perm) ? children : <AccessDenied />
}

function DashboardLayout() {
  const { user, can, logout } = useAuth()
  const nav = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifs, setNotifs] = useState(NOTIFS_INIT)

  // Only show nav items the user has permission for
  const visibleNav = ALL_NAV.filter(n => can(n.perm))
  const currentPage = ALL_NAV.find(n => n.to === location.pathname)?.label || 'Dashboard'
  const unread  = notifs.filter(n => !n.read).length
  const initial = user?.name?.[0]?.toUpperCase() || 'U'
  const badge   = ROLE_BADGE[user?.role] || ROLE_BADGE['Student']

  const markRead = i => setNotifs(ns => ns.map((n, idx) => idx === i ? { ...n, read:true } : n))
  const markAll  = () => setNotifs(ns => ns.map(n => ({ ...n, read:true })))

  return (
    <div className="flex h-screen overflow-hidden" style={{ background:C.bg }}>

      {/* ── Sidebar ── */}
      <aside className="flex flex-col flex-shrink-0 transition-all duration-300"
        style={{ width:collapsed ? 68 : 236, background:C.surface, borderRight:`2px solid ${C.borderDim}` }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom:`1.5px solid ${C.borderDim}` }}>
          <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center animate-pulse-glow"
            style={{ background:`linear-gradient(135deg,${C.border} 0%,#c02448 100%)` }}>
            <GraduationCap size={18} color={C.text} />
          </div>
          {!collapsed && (
            <div>
              <p className="font-black text-sm leading-none" style={{ color:C.text }}>UROMS</p>
              <p className="text-xs mt-0.5 font-medium" style={{ color:C.textMuted }}>University Platform</p>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto p-1.5 rounded-lg transition-colors"
            style={{ color:C.textMuted }}
            onMouseEnter={e => e.currentTarget.style.background = C.surface2}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            {collapsed ? <ChevronRight size={15} /> : <Menu size={15} />}
          </button>
        </div>

        {/* Role badge strip */}
        {!collapsed && (
          <div className="px-3 pt-3 pb-1">
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 10px', borderRadius:20,
              background:badge.bg, border:`1px solid ${badge.border}` }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:badge.color }} />
              <span style={{ fontSize:11, fontWeight:700, color:badge.color }}>{user?.role}</span>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {visibleNav.map(({ to, label, icon:Icon }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => `sidebar-item flex items-center gap-3 px-3 py-2.5 ${isActive ? 'active' : ''}`}>
              {({ isActive }) => (
                <>
                  <Icon size={17} className="flex-shrink-0" style={{ color:isActive ? C.accent : C.textMuted }} />
                  {!collapsed && (
                    <span className="text-sm font-semibold" style={{ color:isActive ? C.accent : C.textSec }}>{label}</span>
                  )}
                  {!collapsed && isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background:C.accent }} />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="px-3 py-4" style={{ borderTop:`1.5px solid ${C.borderDim}` }}>
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl" style={{ background:C.surface2 }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background:`linear-gradient(135deg,${C.border} 0%,#c02448 100%)`, color:C.text }}>
              {initial}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold truncate" style={{ color:C.text }}>{user?.name}</p>
                <p className="text-xs truncate" style={{ color:C.textMuted }}>{user?.department || user?.role}</p>
              </div>
            )}
            <button onClick={() => { logout(); nav('/') }} title="Log out"
              className="flex-shrink-0 p-1.5 rounded-lg transition-colors"
              style={{ color:C.textMuted }}
              onMouseEnter={e => { e.currentTarget.style.background = C.surface3; e.currentTarget.style.color = C.accent }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.textMuted }}>
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom:`2px solid ${C.borderDim}`, background:C.surface }}>
          <div>
            <h1 className="font-black text-xl" style={{ color:C.text }}>{currentPage}</h1>
            <p className="text-xs mt-0.5 font-medium" style={{ color:C.textMuted }}>
              University Resource &amp; Operations Management
            </p>
          </div>
          <div className="flex items-center gap-3">

            {/* Role pill */}
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:20,
              background:badge.bg, border:`1.5px solid ${badge.border}` }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:badge.color }} />
              <span style={{ fontSize:12, fontWeight:700, color:badge.color }}>{user?.role}</span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                style={{ border:`1.5px solid ${C.borderDim}`, background:notifOpen ? C.surface2 : 'transparent' }}>
                <Bell size={16} style={{ color:C.textMuted }} />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center font-bold"
                    style={{ background:C.accent, color:C.bg, fontSize:9 }}>{unread}</span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 w-72 rounded-2xl z-50 animate-fade-in"
                  style={{ background:C.surface, border:`1.5px solid ${C.border}`, boxShadow:'0 16px 40px rgba(0,0,0,0.4)' }}>
                  <div className="flex items-center justify-between px-4 py-3"
                    style={{ borderBottom:`1.5px solid ${C.borderDim}`, background:C.surface2, borderRadius:'14px 14px 0 0' }}>
                    <p className="font-bold text-sm" style={{ color:C.text }}>Notifications</p>
                    <div className="flex items-center gap-2">
                      {unread > 0 && (
                        <button onClick={markAll}
                          style={{ fontSize:11, color:C.accent, background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>
                          Mark all read
                        </button>
                      )}
                      <button onClick={() => setNotifOpen(false)}
                        style={{ color:C.textMuted, background:'none', border:'none', cursor:'pointer', display:'flex' }}>
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  {notifs.map((n, i) => (
                    <div key={i} onClick={() => markRead(i)}
                      className="px-4 py-3 cursor-pointer transition-colors"
                      style={{ borderBottom:`1px solid ${C.borderDim}`, background:n.read ? C.surface : C.surface2 }}
                      onMouseEnter={e => e.currentTarget.style.background = C.surface3}
                      onMouseLeave={e => e.currentTarget.style.background = n.read ? C.surface : C.surface2}>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                          style={{ background:n.read ? C.textMuted : C.accent }} />
                        <div className="flex-1">
                          <p className="text-xs font-bold" style={{ color:C.text }}>{n.t}</p>
                          <p className="text-xs mt-0.5" style={{ color:C.textMuted }}>{n.d}</p>
                        </div>
                        {!n.read && <div className="w-1.5 h-1.5 rounded-full mt-1.5" style={{ background:C.accent }} />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
              style={{ background:`linear-gradient(135deg,${C.border} 0%,#c02448 100%)`, color:C.text }}>
              {initial}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6" style={{ background:C.bg }}>
          <Routes>
            <Route path="/dashboard"     element={<Dashboard />} />
            <Route path="/classrooms"    element={<Guard perm="nav:classrooms"><Classrooms /></Guard>} />
            <Route path="/labs"          element={<Guard perm="nav:labs"><Labs /></Guard>} />
            <Route path="/workloads"     element={<Guard perm="nav:workloads"><Workloads /></Guard>} />
            <Route path="/equipment"     element={<Guard perm="nav:equipment"><Equipment /></Guard>} />
            <Route path="/events"        element={<Guard perm="nav:events"><Events /></Guard>} />
            <Route path="/news"         element={<Guard perm="nav:news"><News /></Guard>} />
            <Route path="/analytics"     element={<Guard perm="nav:analytics"><Analytics /></Guard>} />
            <Route path="/users"         element={<Guard perm="nav:users"><UsersPage /></Guard>} />
            <Route path="/accreditation" element={<Guard perm="nav:accreditation"><Accreditation /></Guard>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function RequireAuth({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/"       element={<LandingPage />} />
      <Route path="/login"  element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />
      <Route path="/*"      element={<RequireAuth><DashboardLayout /></RequireAuth>} />
    </Routes>
  )
}
