import { useState } from 'react'
import { Plus, FlaskConical, Monitor, Zap } from 'lucide-react'
import { Card, Modal, Table, TR, TD, SectionHeader, PrimaryBtn, SecondaryBtn, SearchInput, Label, FieldError, Progress, StatCard, InfoGrid, Toast } from '../components/UI'
import { getRooms, getSessions, addSession } from '../store'
import { useAuth } from '../AuthContext'

const C = { surface2:'var(--surface2)', borderDim:'var(--border-dim)', accent:'var(--accent)', text:'var(--text-primary)', textMuted:'var(--text-muted)', success:'var(--success)', warning:'var(--warning)' }

function validate(f) {
  const e = {}
  if (!f.lab)            e.lab       = 'Select a lab'
  if (!f.course?.trim()) e.course    = 'Course name is required'
  if (!f.date)           e.date      = 'Date is required'
  if (!f.startTime)      e.startTime = 'Start time is required'
  if (!f.endTime)        e.endTime   = 'End time is required'
  if (f.startTime && f.endTime && f.startTime >= f.endTime) e.endTime = 'End time must be after start time'
  if (f.students && (isNaN(f.students) || Number(f.students) < 1)) e.students = 'Enter a valid number'
  return e
}

export default function Labs() {
  const { user } = useAuth()
  const labs     = getRooms().filter(r => r.type === 'Lab')
  const [sessions, setSessions] = useState(() => getSessions())
  const [modal, setModal]       = useState(null)
  const [selected, setSelected] = useState(null)
  const [search, setSearch]     = useState('')
  const [form, setForm]         = useState({ lab:'', course:'', date:'', startTime:'', endTime:'', students:'', instructor:'' })
  const [errors, setErrors]     = useState({})
  const [toast, setToast]       = useState(null)

  const filtered = sessions.filter(s => s.lab.toLowerCase().includes(search.toLowerCase()) || s.course.toLowerCase().includes(search.toLowerCase()))
  const set = k => e => { setForm(f => ({ ...f, [k]:e.target.value })); if (errors[k]) setErrors(ev => ({ ...ev, [k]:'' })) }
  const features = l => Array.isArray(l.features) ? l.features : JSON.parse(l.features || '[]')

  const submit = () => {
    const errs = validate(form); setErrors(errs)
    if (Object.keys(errs).length) return
    const updated = addSession({ lab:form.lab, course:form.course, date:form.date, time:`${form.startTime}-${form.endTime}`, students:Number(form.students)||0, instructor:form.instructor||user?.name||'' })
    setSessions(updated)
    setToast({ type:'success', msg:'Lab session scheduled!' })
    setForm({ lab:'', course:'', date:'', startTime:'', endTime:'', students:'', instructor:'' }); setModal(null)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <Toast type={toast.type} msg={toast.msg} onDismiss={() => setToast(null)} />}
      <SectionHeader title="Laboratory Scheduling" sub={`${labs.length} labs · ${labs.filter(l => l.status==='Available').length} available`}
        action={<PrimaryBtn icon={Plus} onClick={() => { setModal('book'); setErrors({}) }}>Schedule Lab</PrimaryBtn>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Labs"      value={labs.length}                                       icon={FlaskConical} color={C.accent} />
        <StatCard title="Active Sessions" value={sessions.filter(s => s.status==='Active').length}  icon={Monitor}     color={C.success} />
        <StatCard title="Scheduled"       value={sessions.filter(s => s.status==='Scheduled').length} icon={Zap}       color={C.warning} />
        <StatCard title="Total Capacity"  value={labs.reduce((a,l) => a+l.capacity, 0)}             icon={FlaskConical} color={C.accent} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {labs.map(lab => (
          <div key={lab.id} className="glass-card p-4 cursor-pointer" onClick={() => { setSelected(lab); setModal('detail') }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:C.surface2 }}>
                <FlaskConical size={16} style={{ color:C.accent }} />
              </div>
              <span className={`badge ${lab.status==='Available'?'badge-green':lab.status==='Maintenance'?'badge-yellow':'badge-blue'}`}>{lab.status}</span>
            </div>
            <p style={{ color:'var(--text-primary)', fontWeight:700, fontSize:14 }}>{lab.name}</p>
            <p style={{ color:C.textMuted, fontSize:12, marginTop:2, marginBottom:12 }}>{lab.code} · Cap: {lab.capacity}</p>
            <div className="flex flex-wrap gap-1 mb-3">
              {features(lab).slice(0,2).map(f => <span key={f} className="px-2 py-0.5 rounded text-xs font-medium" style={{ background:C.surface2, color:C.accent, border:`1px solid ${C.borderDim}` }}>{f}</span>)}
            </div>
            <Progress value={lab.utilization} />
            <p style={{ color:C.textMuted, fontSize:11, marginTop:4, textAlign:'right' }}>{lab.utilization}% utilized</p>
          </div>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <p style={{ color:'var(--text-primary)', fontWeight:700, fontSize:17 }}>Lab Sessions</p>
          <SearchInput value={search} onChange={setSearch} placeholder="Search sessions..." />
        </div>
        <Table headers={['Lab','Course','Date','Time','Students','Instructor','Status']}>
          {filtered.map(s => (
            <TR key={s.id}>
              <TD><span style={{ fontWeight:700, color:'var(--text-primary)' }}>{s.lab}</span></TD>
              <TD>{s.course}</TD><TD>{s.date}</TD><TD>{s.time}</TD><TD>{s.students}</TD><TD>{s.instructor}</TD>
              <TD><span className={`badge ${s.status==='Active'?'badge-green':'badge-blue'}`}>{s.status}</span></TD>
            </TR>
          ))}
        </Table>
      </Card>

      {modal === 'detail' && selected && (
        <Modal title={selected.name} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <InfoGrid items={[['Code',selected.code],['Capacity',`${selected.capacity} seats`],['Building',selected.building],['Campus',selected.campus]]} />
            <div><p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color:C.textMuted }}>Equipment</p>
              <div className="flex flex-wrap gap-2">{features(selected).map(f => <span key={f} className="badge badge-blue">{f}</span>)}</div></div>
            <Progress value={selected.utilization} />
            <div className="flex gap-3">
              <PrimaryBtn onClick={() => { setModal('book'); setForm(f => ({ ...f, lab:selected.name })) }}>Schedule This Lab</PrimaryBtn>
              <SecondaryBtn onClick={() => setModal(null)}>Close</SecondaryBtn>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'book' && (
        <Modal title="Schedule Lab Session" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div><Label required>Select Lab</Label>
              <select className={`input-dark ${errors.lab?'error':''}`} value={form.lab} onChange={set('lab')}>
                <option value="">— Choose a lab —</option>
                {labs.filter(l => l.status!=='Maintenance').map(l => <option key={l.id} value={l.name}>{l.name} ({l.code})</option>)}
              </select><FieldError msg={errors.lab} /></div>
            <div><Label required>Course</Label>
              <input className={`input-dark ${errors.course?'error':''}`} value={form.course} onChange={set('course')} placeholder="e.g. CS401 - Database Lab" />
              <FieldError msg={errors.course} /></div>
            <div><Label required>Date</Label>
              <input type="date" className={`input-dark ${errors.date?'error':''}`} value={form.date} onChange={set('date')} />
              <FieldError msg={errors.date} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label required>Start Time</Label>
                <input type="time" className={`input-dark ${errors.startTime?'error':''}`} value={form.startTime} onChange={set('startTime')} />
                <FieldError msg={errors.startTime} /></div>
              <div><Label required>End Time</Label>
                <input type="time" className={`input-dark ${errors.endTime?'error':''}`} value={form.endTime} onChange={set('endTime')} />
                <FieldError msg={errors.endTime} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Expected Students</Label>
                <input type="number" min="1" className={`input-dark ${errors.students?'error':''}`} value={form.students} onChange={set('students')} placeholder="e.g. 25" />
                <FieldError msg={errors.students} /></div>
              <div><Label>Instructor</Label>
                <input className="input-dark" value={form.instructor} onChange={set('instructor')} placeholder="e.g. Dr. Fatima Ali" /></div>
            </div>
            <div className="flex gap-3 pt-2">
              <PrimaryBtn onClick={submit}>Schedule Session</PrimaryBtn>
              <SecondaryBtn onClick={() => setModal(null)}>Cancel</SecondaryBtn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
