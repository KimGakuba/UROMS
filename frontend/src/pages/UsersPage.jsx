import { useState, useEffect } from 'react'
import { Plus, Shield, UserCheck, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Card, Badge, Modal, Table, TR, TD, SectionHeader, PrimaryBtn, SecondaryBtn, SearchInput, Label, FieldError, StatCard, InfoGrid, LoadingSpinner, EmptyState, Toast } from '../components/UI'
import { api } from '../api'
import { useAuth } from '../AuthContext'

const C = {
  bg:       'var(--bg)',
  surface:  'var(--surface)',
  surface2: 'var(--surface2)',
  surface3: 'var(--surface3)',
  border:   'var(--border)',
  borderDim:'var(--border-dim)',
  accent:   'var(--accent)',
  accentDim:'var(--accent-dim)',
  text:     'var(--text-primary)',
  textSec:  'var(--text-secondary)',
  textMuted:'var(--text-muted)',
  success:  'var(--success)',
  warning:  'var(--warning)',
  danger:   'var(--danger)',
}

const ROLE_COLORS = { Administrator: C.danger, Registry: C.accent, HoD: C.warning, Faculty: C.success, Lecturer: C.success, Student: '#a78bfa' }
const ROLE_PERMS = {
  Administrator: ['Manage Rooms','Manage Equipment','Approve Bookings','Manage Users','View Analytics','Create Events','Accreditation Reports'],
  Registry:      ['Manage Rooms','Manage Equipment','Approve Bookings','View Analytics','Create Events'],
  HoD:           ['Approve Bookings','Assign Workloads','View Analytics','Create Events'],
  Faculty:       ['Create Bookings','Create Events','View Own Workload'],
  Lecturer:      ['Create Bookings','Create Events','View Own Workload'],
  Student:       ['Create Bookings','View Events'],
}

function validate(f) {
  const e = {}
  if (!f.name?.trim())  e.name     = 'Full name is required'
  if (!f.email?.trim()) e.email    = 'Email is required'
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Enter a valid email address'
  if (!f.password)      e.password = 'Password is required'
  if (f.password && f.password.length < 6) e.password = 'Minimum 6 characters'
  return e
}

export default function UsersPage() {
  const { can, approveUser, loadUsers } = useAuth()
  const [users, setUsers] = useState(() => loadUsers())
  const [loading, setLoading]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [search, setSearch]     = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [pendingTab, setPendingTab] = useState(false)
  const [modal, setModal]       = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm]         = useState({ name:'', email:'', password:'', role:'Faculty', department:'Computer Science', campus:'Main' })
  const [errors, setErrors]     = useState({})
  const [toast, setToast]       = useState(null)

  const refresh = () => setUsers(loadUsers())

  const pending = users.filter(u => u.status === 'Pending')
  const activeUsers = users.filter(u => u.status !== 'Pending')

  const filtered = activeUsers.filter(u =>
    (roleFilter === 'All' || u.role === roleFilter) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  )

  const roles = ['Administrator','Registry','HoD','Faculty','Lecturer','Student']
  const roleCounts = roles.reduce((acc, r) => { acc[r] = activeUsers.filter(u => u.role === r).length; return acc }, {})

  const handleApprove = (id) => {
    approveUser(id, 'Active')
    refresh()
    setToast({ type:'success', msg:'User approved — they can now log in.' })
  }

  const handleReject = (id) => {
    approveUser(id, 'Rejected')
    refresh()
    setToast({ type:'error', msg:'User registration rejected.' })
  }

  const set = k => e => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors(ev => ({ ...ev, [k]: '' }))
  }

  const submit = () => {
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length) return
    const users = loadUsers()
    if (users.find(u => u.email.toLowerCase() === form.email.toLowerCase())) {
      setErrors(ev => ({ ...ev, email:'Email already registered' }))
      return
    }
    const newUser = { id:Date.now(), name:form.name, email:form.email, password:form.password, role:form.role, department:form.department, campus:form.campus, status:'Active', registeredAt:new Date().toISOString() }
    localStorage.setItem('uroms_auth_users', JSON.stringify([...users, newUser]))
    setToast({ type:'success', msg:`User "${form.name}" created!` })
    setForm({ name:'', email:'', password:'', role:'Faculty', department:'Computer Science', campus:'Main' })
    setModal(null)
    refresh()
  }

  const toggleStatus = (u) => {
    const newStatus = u.status === 'Active' ? 'Inactive' : 'Active'
    approveUser(u.id, newStatus)
    refresh()
    setToast({ type:'success', msg:`User ${newStatus === 'Active' ? 'activated' : 'deactivated'}` })
  }

  if (loading) return <LoadingSpinner msg="Loading users…" />

  const C2 = { surface:'var(--surface)', surface2:'var(--surface2)', surface3:'var(--surface3)', border:'var(--border)', borderDim:'var(--border-dim)', accent:'var(--accent)', text:'var(--text-primary)', textSec:'var(--text-secondary)', textMuted:'var(--text-muted)', danger:'var(--danger)', success:'var(--success)', warning:'var(--warning)' }

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <Toast type={toast.type} msg={toast.msg} onDismiss={() => setToast(null)} />}

      <SectionHeader
        title="User Management"
        sub={`${activeUsers.length} active users · ${pending.length} pending approval`}
        action={can('users:add') && <PrimaryBtn icon={Plus} onClick={() => { setModal('create'); setErrors({}) }}>Add User</PrimaryBtn>}
      />

      {/* ── Pending Approvals Panel ── */}
      {can('users:approve') && pending.length > 0 && (
        <div style={{ background:'#fffbeb', border:'2px solid #fde68a', borderRadius:16, padding:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <Clock size={18} color="#b7791f" />
            <p style={{ fontWeight:800, fontSize:16, color:'#92400e', margin:0 }}>Pending Approvals ({pending.length})</p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {pending.map(u => (
              <div key={u.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff', border:'1.5px solid #fde68a', borderRadius:12, padding:'12px 16px', flexWrap:'wrap', gap:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:'#fef3c7', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:14, color:'#92400e' }}>
                    {u.name.split(' ').map(n => n[0]).slice(0,2).join('')}
                  </div>
                  <div>
                    <p style={{ fontWeight:700, fontSize:14, color:'#1a1a1a', margin:0 }}>{u.name}</p>
                    <p style={{ fontSize:12, color:'#92400e', margin:0 }}>{u.email} · {u.role} · {u.department || '—'}</p>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => handleApprove(u.id)}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 16px', borderRadius:8, border:'none', background:'#166534', color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button onClick={() => handleReject(u.id)}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 16px', borderRadius:8, border:'1.5px solid #fecaca', background:'#fef2f2', color:'#c0392b', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(roleCounts).map(([role, count]) => (
          <div key={role} className="glass-card p-4 text-center cursor-pointer transition-all"
            onClick={() => setRoleFilter(role === roleFilter ? 'All' : role)}
            style={{ borderColor: roleFilter === role ? (ROLE_COLORS[role] || C.accent) : C.borderDim, borderWidth: 1.5 }}>
            <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center"
              style={{ background: C.surface2 }}>
              <Shield size={14} style={{ color: ROLE_COLORS[role] || C.accent }} />
            </div>
            <p className="font-black text-xl" style={{ color: C.text }}>{count}</p>
            <p className="text-xs mt-0.5 font-semibold" style={{ color: C.textMuted }}>{role}s</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search users..." />
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: C.surface2, border: `1px solid ${C.borderDim}` }}>
          {['All',...roles].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: roleFilter === r ? C.border : 'transparent', color: roleFilter === r ? '#fff' : C.textMuted }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <Card>
        {filtered.length === 0
          ? <EmptyState icon={Shield} title="No users found" desc="Try adjusting your search or filter." />
          : (
            <Table headers={['User','Role','Department','Campus','Last Login','Status','Actions']}>
              {filtered.map(u => (
                <TR key={u.id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: C.surface3, color: C.accent, border: `1px solid ${C.borderDim}` }}>
                        {u.name.split(' ').map(n => n[0]).slice(0,2).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-sm" style={{ color: C.text }}>{u.name}</p>
                        <p className="text-xs" style={{ color: C.textMuted }}>{u.email}</p>
                      </div>
                    </div>
                  </TD>
                  <TD>
                    <span className="badge" style={{ background:`${ROLE_COLORS[u.role]||C.accent}22`, color: ROLE_COLORS[u.role]||C.accent, border:`1px solid ${ROLE_COLORS[u.role]||C.accent}44` }}>
                      {u.role}
                    </span>
                  </TD>
                  <TD>{u.department}</TD>
                  <TD>{u.campus}</TD>
                  <TD>{u.last_login || '—'}</TD>
                  <TD><Badge status={u.status} /></TD>
                  <TD>
                    <div className="flex gap-2">
                      <button onClick={() => { setSelected(u); setModal('detail') }}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold transition-colors"
                        style={{ background: C.surface3, color: C.accent, border: `1px solid ${C.borderDim}` }}>
                        View
                      </button>
                      <button onClick={() => toggleStatus(u)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold transition-colors"
                        style={{ background: u.status === 'Active' ? 'rgba(248,113,113,0.12)' : 'rgba(74,222,128,0.1)', color: u.status === 'Active' ? C.danger : C.success, border:`1px solid ${u.status === 'Active' ? 'rgba(248,113,113,0.25)' : 'rgba(74,222,128,0.25)'}`, display: can('users:deactivate') ? 'block' : 'none' }}>
                        {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </TD>
                </TR>
              ))}
            </Table>
          )}
      </Card>

      {modal === 'detail' && selected && (
        <Modal title={selected.name} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: C.surface2, border: `1.5px solid ${C.borderDim}` }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black"
                style={{ background: C.surface3, color: C.accent, border: `1.5px solid ${C.borderDim}` }}>
                {selected.name.split(' ').map(n => n[0]).slice(0,2).join('')}
              </div>
              <div>
                <p style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>{selected.name}</p>
                <p className="text-sm" style={{ color: C.textMuted }}>{selected.email}</p>
                <span className="badge mt-1" style={{ background:`${ROLE_COLORS[selected.role]||C.accent}22`, color: ROLE_COLORS[selected.role]||C.accent, border:`1px solid ${ROLE_COLORS[selected.role]||C.accent}44` }}>{selected.role}</span>
              </div>
            </div>
            <InfoGrid items={[['Department',selected.department||'—'],['Campus',selected.campus],['Status',selected.status],['Last Login',selected.last_login||'—']]} />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.textMuted }}>Permissions</p>
              <div className="flex flex-wrap gap-2">
                {(ROLE_PERMS[selected.role] || []).map(p => (
                  <span key={p} className="flex items-center gap-1 badge badge-green">
                    <UserCheck size={10} />{p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'create' && (
        <Modal title="Add New User" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label required>Full Name</Label>
                <input className={`input-dark ${errors.name ? 'error' : ''}`} value={form.name} onChange={set('name')} placeholder="Dr. John Smith" />
                <FieldError msg={errors.name} />
              </div>
              <div>
                <Label required>Email</Label>
                <input type="email" className={`input-dark ${errors.email ? 'error' : ''}`} value={form.email} onChange={set('email')} placeholder="john@uroms.ac" />
                <FieldError msg={errors.email} />
              </div>
            </div>
            <div>
              <Label required>Password</Label>
              <input type="password" className={`input-dark ${errors.password ? 'error' : ''}`} value={form.password} onChange={set('password')} placeholder="Min. 6 characters" />
              <FieldError msg={errors.password} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Role</Label>
                <select className="input-dark" value={form.role} onChange={set('role')}>
                  {roles.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <Label>Department</Label>
                <select className="input-dark" value={form.department} onChange={set('department')}>
                  {['Computer Science','Electrical Engineering','Physics','Business','Administration'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div>
              <Label>Campus</Label>
              <select className="input-dark" value={form.campus} onChange={set('campus')}>
                {['Main','North'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <PrimaryBtn onClick={submit} loading={saving}>Create User</PrimaryBtn>
              <SecondaryBtn onClick={() => setModal(null)}>Cancel</SecondaryBtn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
