import { useState } from 'react'
import { Plus, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'
import { Card, Modal, SectionHeader, PrimaryBtn, SecondaryBtn, SearchInput, Label, FieldError, Progress, StatCard, InfoGrid, Toast } from '../components/UI'
import { getLecturers, saveLecturers } from '../store'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const C = { surface:'var(--surface)', surface2:'var(--surface2)', surface3:'var(--surface3)', border:'var(--border)', borderDim:'var(--border-dim)', accent:'var(--accent)', text:'var(--text-primary)', textMuted:'var(--text-muted)', success:'var(--success)', warning:'var(--warning)', danger:'var(--danger)' }

const TIP = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return <div style={{ background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:10, padding:'8px 12px' }}>
    <p style={{ color:C.text, fontSize:11, fontWeight:700, marginBottom:4 }}>{label}</p>
    {payload.map(p => <p key={p.name} style={{ color:p.color, fontSize:11 }}>{p.name}: {p.value}h</p>)}
  </div>
}

function validate(f) {
  const e = {}
  if (!f.lecturer)           e.lecturer   = 'Select a lecturer'
  if (!f.courseCode?.trim()) e.courseCode = 'Course code is required'
  if (!f.hours || isNaN(f.hours) || Number(f.hours) < 1) e.hours = 'Enter valid hours (min 1)'
  if (Number(f.hours) > 40)  e.hours = 'Cannot exceed 40 hours'
  return e
}

export default function Workloads() {
  const [lecturers, setLecturers] = useState(() => getLecturers())
  const [search, setSearch]       = useState('')
  const [modal, setModal]         = useState(null)
  const [selected, setSelected]   = useState(null)
  const [form, setForm]           = useState({ lecturer:'', courseCode:'', hours:'', semester:'Fall', year:'2024-25' })
  const [errors, setErrors]       = useState({})
  const [toast, setToast]         = useState(null)

  const filtered = lecturers.filter(l => l.name.toLowerCase().includes(search.toLowerCase()) || l.department.toLowerCase().includes(search.toLowerCase()))
  const set = k => e => { setForm(f => ({ ...f, [k]:e.target.value })); if (errors[k]) setErrors(ev => ({ ...ev, [k]:'' })) }

  const submit = () => {
    const errs = validate(form); setErrors(errs)
    if (Object.keys(errs).length) return
    const updated = lecturers.map(l => {
      if (String(l.id) !== String(form.lecturer)) return l
      const newHours = (l.assigned_hours || 0) + Number(form.hours)
      const courses  = Array.isArray(l.courses) ? l.courses : []
      const status   = newHours > l.hec_limit ? 'Over Limit' : newHours >= l.hec_limit * 0.8 ? 'Near Limit' : 'Active'
      return { ...l, assigned_hours:newHours, courses:courses.includes(form.courseCode) ? courses : [...courses, form.courseCode], status }
    })
    saveLecturers(updated); setLecturers(updated)
    setToast({ type:'success', msg:'Workload assigned!' })
    setForm({ lecturer:'', courseCode:'', hours:'', semester:'Fall', year:'2024-25' }); setModal(null)
  }

  const chartData = lecturers.map(l => ({ name:l.name.split(' ').slice(-1)[0], assigned:l.assigned_hours||0, completed:l.completed_hours||0 }))

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <Toast type={toast.type} msg={toast.msg} onDismiss={() => setToast(null)} />}
      <SectionHeader title="Lecturer Workload" sub="HEC-aligned teaching load monitoring (40 hrs/semester limit)"
        action={<PrimaryBtn icon={Plus} onClick={() => { setModal('assign'); setErrors({}) }}>Assign Workload</PrimaryBtn>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Lecturers" value={lecturers.length}                                    icon={TrendingUp}    color={C.accent} />
        <StatCard title="HEC Compliant"   value={lecturers.filter(l=>l.status==='Active').length}     icon={CheckCircle}   color={C.success} sub="Within 40hr limit" />
        <StatCard title="Near Limit"      value={lecturers.filter(l=>l.status==='Near Limit').length} icon={AlertTriangle} color={C.warning} sub="80% of limit" />
        <StatCard title="Over Limit"      value={lecturers.filter(l=>l.status==='Over Limit').length} icon={AlertTriangle} color={C.danger}  sub="Requires action" />
      </div>

      <Card>
        <p style={{ color:C.text, fontWeight:700, fontSize:17, marginBottom:16 }}>Workload Overview</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.borderDim} />
            <XAxis dataKey="name" tick={{ fill:C.textMuted, fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0,50]} tick={{ fill:C.textMuted, fontSize:11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<TIP />} />
            <Bar dataKey="assigned"  fill="var(--border)" radius={[3,3,0,0]} name="Assigned" />
            <Bar dataKey="completed" fill="var(--accent)" radius={[3,3,0,0]} name="Completed" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="flex items-center justify-between">
        <p style={{ color:C.text, fontWeight:700, fontSize:17 }}>Lecturer Details</p>
        <SearchInput value={search} onChange={setSearch} placeholder="Search lecturers..." />
      </div>

      <div className="space-y-3">
        {filtered.map(l => {
          const pct = ((l.assigned_hours||0) / l.hec_limit) * 100
          const barColor = l.status==='Over Limit' ? C.danger : l.status==='Near Limit' ? C.warning : C.accent
          return (
            <div key={l.id} className="glass-card p-5 cursor-pointer" onClick={() => { setSelected(l); setModal('detail') }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background:C.surface3, color:C.accent, border:`1.5px solid ${C.borderDim}` }}>
                    {l.name.split(' ').map(n=>n[0]).slice(0,2).join('')}
                  </div>
                  <div>
                    <p style={{ color:C.text, fontWeight:700 }}>{l.name}</p>
                    <p style={{ color:C.textMuted, fontSize:12 }}>{l.staff_id} · {l.department} · {l.campus} Campus</p>
                  </div>
                </div>
                <span className={`badge ${l.status==='Over Limit'?'badge-red':l.status==='Near Limit'?'badge-yellow':'badge-green'}`}>{l.status}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-3">
                {[['Assigned',(l.assigned_hours||0)+'h'],['Completed',(l.completed_hours||0)+'h'],['HEC Limit',l.hec_limit+'h']].map(([k,v]) => (
                  <div key={k}><p style={{ color:C.textMuted, fontSize:11, marginBottom:2 }}>{k}</p><p style={{ color:C.text, fontWeight:700, fontSize:20 }}>{v}</p></div>
                ))}
              </div>
              <div className="flex justify-between mb-1.5">
                <span style={{ color:C.textMuted, fontSize:12 }}>Load: {l.assigned_hours||0}/{l.hec_limit} hrs</span>
                <span style={{ color:barColor, fontSize:12, fontWeight:700 }}>{Math.round(pct)}%</span>
              </div>
              <Progress value={l.assigned_hours||0} max={l.hec_limit} color={barColor} />
            </div>
          )
        })}
      </div>

      {modal === 'detail' && selected && (
        <Modal title={selected.name} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <InfoGrid items={[['Staff ID',selected.staff_id],['Department',selected.department],['Campus',selected.campus],['Status',selected.status]]} />
            <div><p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color:C.textMuted }}>Assigned Courses</p>
              <div className="flex flex-wrap gap-2">{(selected.courses||[]).map(c => <span key={c} className="badge badge-blue">{c}</span>)}</div></div>
            <div className="flex justify-between mb-2"><span style={{ color:C.textMuted, fontSize:13 }}>HEC Workload</span><span style={{ color:C.text, fontWeight:700 }}>{selected.assigned_hours||0}/{selected.hec_limit} hrs</span></div>
            <Progress value={selected.assigned_hours||0} max={selected.hec_limit} />
            {selected.status === 'Over Limit' && (
              <div className="rounded-xl p-3 flex items-start gap-2" style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.25)' }}>
                <AlertTriangle size={14} style={{ color:C.danger, marginTop:2, flexShrink:0 }} />
                <p style={{ color:C.danger, fontSize:12 }}>Exceeded HEC limit of {selected.hec_limit} hours. Immediate review required.</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {modal === 'assign' && (
        <Modal title="Assign Workload" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div><Label required>Lecturer</Label>
              <select className={`input-dark ${errors.lecturer?'error':''}`} value={form.lecturer} onChange={set('lecturer')}>
                <option value="">— Select lecturer —</option>
                {lecturers.map(l => <option key={l.id} value={l.id}>{l.name} ({l.staff_id}) — {l.assigned_hours||0}/{l.hec_limit}h</option>)}
              </select><FieldError msg={errors.lecturer} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label required>Course Code</Label>
                <input className={`input-dark ${errors.courseCode?'error':''}`} value={form.courseCode} onChange={set('courseCode')} placeholder="e.g. CS301" />
                <FieldError msg={errors.courseCode} /></div>
              <div><Label required>Hours</Label>
                <input type="number" min="1" max="40" className={`input-dark ${errors.hours?'error':''}`} value={form.hours} onChange={set('hours')} placeholder="e.g. 9" />
                <FieldError msg={errors.hours} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Semester</Label>
                <select className="input-dark" value={form.semester} onChange={set('semester')}>{['Fall','Spring','Summer'].map(s => <option key={s}>{s}</option>)}</select></div>
              <div><Label>Academic Year</Label><input className="input-dark" value={form.year} onChange={set('year')} /></div>
            </div>
            <div className="rounded-xl p-3 flex items-start gap-2" style={{ background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.25)' }}>
              <AlertTriangle size={14} style={{ color:C.warning, marginTop:2, flexShrink:0 }} />
              <p style={{ color:C.warning, fontSize:12 }}>HEC limit: 40 contact hours per semester.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <PrimaryBtn onClick={submit}>Assign</PrimaryBtn>
              <SecondaryBtn onClick={() => setModal(null)}>Cancel</SecondaryBtn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
