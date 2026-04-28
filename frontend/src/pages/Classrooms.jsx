import { useState } from 'react'
import { Plus, Users, Layers } from 'lucide-react'
import { Card, Badge, Modal, Table, TR, TD, SectionHeader, PrimaryBtn, SecondaryBtn, SearchInput, Label, FieldError, Progress, Tabs, InfoGrid, Toast } from '../components/UI'
import { getRooms, saveRooms, getBookings, addBooking } from '../store'
import { useAuth } from '../AuthContext'

const C = { surface:'var(--surface)', surface2:'var(--surface2)', surface3:'var(--surface3)', border:'var(--border)', borderDim:'var(--border-dim)', accent:'var(--accent)', text:'var(--text-primary)', textSec:'var(--text-secondary)', textMuted:'var(--text-muted)', danger:'var(--danger)' }

const SLOTS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00']
const DAYS  = ['Mon','Tue','Wed','Thu','Fri']
const SCHEDULE = {
  'Mon-08:00':{ course:'CS301', lecturer:'Dr. Fatima' }, 'Mon-10:00':{ course:'EE201', lecturer:'Prof. Usman' },
  'Tue-09:00':{ course:'BUS301', lecturer:'Dr. Zara' }, 'Tue-11:00':{ course:'CS401', lecturer:'Dr. Fatima' },
  'Wed-08:00':{ course:'PH301', lecturer:'Prof. Bilal' }, 'Wed-13:00':{ course:'CS501', lecturer:'Dr. Ahmed' },
  'Thu-10:00':{ course:'EE301', lecturer:'Dr. Sara' }, 'Thu-14:00':{ course:'BUS401', lecturer:'Dr. Zara' },
  'Fri-09:00':{ course:'CS601', lecturer:'Dr. Ahmed' },
}

function validate(f) {
  const e = {}
  if (!f.title?.trim())  e.title     = 'Purpose is required'
  if (!f.room)           e.room      = 'Please select a room'
  if (!f.date)           e.date      = 'Date is required'
  if (!f.startTime)      e.startTime = 'Start time is required'
  if (!f.endTime)        e.endTime   = 'End time is required'
  if (f.startTime && f.endTime && f.startTime >= f.endTime) e.endTime = 'End time must be after start time'
  return e
}

export default function Classrooms() {
  const { user } = useAuth()
  const [rooms, setRooms]       = useState(() => getRooms())
  const [bookings, setBookings] = useState(() => getBookings())
  const [search, setSearch]     = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [modal, setModal]       = useState(null)
  const [selected, setSelected] = useState(null)
  const [tab, setTab]           = useState('rooms')
  const [form, setForm]         = useState({ title:'', date:'', startTime:'', endTime:'', room:'' })
  const [errors, setErrors]     = useState({})
  const [toast, setToast]       = useState(null)

  const classrooms = rooms.filter(r => r.type === 'Classroom')
  const filtered   = classrooms.filter(r =>
    (statusFilter === 'All' || r.status === statusFilter) &&
    (r.name.toLowerCase().includes(search.toLowerCase()) || r.code.toLowerCase().includes(search.toLowerCase()))
  )

  const set = k => e => { setForm(f => ({ ...f, [k]:e.target.value })); if (errors[k]) setErrors(ev => ({ ...ev, [k]:'' })) }

  const submitBooking = () => {
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length) return
    const updated = addBooking({ title:form.title, room_code:form.room, type:'Classroom', date:form.date, start_time:form.startTime, end_time:form.endTime, requested_by:user?.name || 'Unknown', department:user?.department || '' })
    setBookings(updated)
    // Mark room occupied
    const updatedRooms = rooms.map(r => r.code === form.room ? { ...r, status:'Occupied' } : r)
    saveRooms(updatedRooms); setRooms(updatedRooms)
    setToast({ type:'success', msg:`Room booked for "${form.title}"` })
    setForm({ title:'', date:'', startTime:'', endTime:'', room:'' }); setModal(null)
  }

  const features = r => Array.isArray(r.features) ? r.features : JSON.parse(r.features || '[]')

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <Toast type={toast.type} msg={toast.msg} onDismiss={() => setToast(null)} />}
      <SectionHeader
        title="Classroom Allocation"
        sub={`${classrooms.length} classrooms · ${classrooms.filter(r => r.status === 'Available').length} available`}
        action={<PrimaryBtn icon={Plus} onClick={() => { setModal('add'); setErrors({}) }}>Book Room</PrimaryBtn>}
      />
      <Tabs tabs={[{ value:'rooms', label:'Room List' }, { value:'timetable', label:'Timetable' }, { value:'bookings', label:'My Bookings' }]} active={tab} onChange={setTab} />

      {tab === 'rooms' && (
        <>
          <div className="flex flex-wrap gap-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Search rooms..." />
            {['All','Available','Occupied','Maintenance'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                style={{ padding:'7px 16px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', border:'1.5px solid', background:statusFilter===s ? C.border : C.surface2, color:statusFilter===s ? '#fff' : C.textSec, borderColor:statusFilter===s ? C.border : C.borderDim }}>
                {s}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(room => (
              <div key={room.id} className="glass-card p-5 cursor-pointer" onClick={() => { setSelected(room); setModal('detail') }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-base" style={{ color:C.text }}>{room.name}</p>
                    <p className="text-xs mt-0.5" style={{ color:C.textMuted }}>{room.code} · {room.building}, Floor {room.floor}</p>
                  </div>
                  <Badge status={room.status} />
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <span className="flex items-center gap-1.5 text-xs" style={{ color:C.textMuted }}><Users size={12}/>{room.capacity} seats</span>
                  <span className="flex items-center gap-1.5 text-xs" style={{ color:C.textMuted }}><Layers size={12}/>{room.campus} Campus</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {features(room).map(f => <span key={f} className="px-2 py-0.5 rounded-md text-xs font-medium" style={{ background:C.surface2, color:C.accent, border:`1px solid ${C.borderDim}` }}>{f}</span>)}
                </div>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color:C.textMuted }}>Utilization</span>
                  <span className="font-bold" style={{ color:C.text }}>{room.utilization}%</span>
                </div>
                <Progress value={room.utilization} />
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'timetable' && (
        <Card>
          <p className="font-bold text-base mb-4" style={{ color:C.text }}>Weekly Timetable — Fall 2024</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead><tr style={{ background:C.surface2 }}>
                <th className="text-left px-3 py-2 text-xs font-bold w-20" style={{ color:C.textMuted }}>Time</th>
                {DAYS.map(d => <th key={d} className="text-center px-2 py-2 text-xs font-bold" style={{ color:C.textMuted }}>{d}</th>)}
              </tr></thead>
              <tbody>
                {SLOTS.map(slot => (
                  <tr key={slot} style={{ borderTop:`1px solid ${C.borderDim}` }}>
                    <td className="px-3 py-2 text-xs font-semibold" style={{ color:C.textMuted }}>{slot}</td>
                    {DAYS.map(day => {
                      const entry = SCHEDULE[`${day}-${slot}`]
                      return (
                        <td key={day} className="px-2 py-1.5 text-center">
                          {entry ? (
                            <div className="rounded-lg px-2 py-1.5 text-xs" style={{ background:C.surface2, border:`1.5px solid ${C.borderDim}` }}>
                              <p className="font-bold" style={{ color:C.accent }}>{entry.course}</p>
                              <p style={{ color:C.textMuted, fontSize:10 }}>{entry.lecturer}</p>
                            </div>
                          ) : <div className="rounded-lg py-1.5" style={{ background:C.surface2, opacity:0.3 }} />}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'bookings' && (
        <Card>
          <Table headers={['Title','Room','Date','Time','Requested By','Status']}>
            {bookings.map(b => (
              <TR key={b.id}>
                <TD><span style={{ fontWeight:700, color:C.text }}>{b.title}</span></TD>
                <TD>{b.room_code}</TD>
                <TD>{b.date}</TD>
                <TD>{b.start_time} – {b.end_time}</TD>
                <TD>{b.requested_by}</TD>
                <TD><Badge status={b.status} /></TD>
              </TR>
            ))}
          </Table>
        </Card>
      )}

      {modal === 'detail' && selected && (
        <Modal title={selected.name} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <InfoGrid items={[['Code',selected.code],['Type',selected.type],['Capacity',`${selected.capacity} seats`],['Building',selected.building],['Floor',selected.floor],['Campus',selected.campus]]} />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color:C.textMuted }}>Features</p>
              <div className="flex flex-wrap gap-2">{features(selected).map(f => <span key={f} className="badge badge-blue">{f}</span>)}</div>
            </div>
            <div className="flex justify-between text-sm mb-2"><span style={{ color:C.textMuted }}>Utilization</span><span className="font-bold" style={{ color:C.text }}>{selected.utilization}%</span></div>
            <Progress value={selected.utilization} />
            <div className="flex gap-3 pt-2">
              <PrimaryBtn onClick={() => { setModal('add'); setForm(f => ({ ...f, room:selected.code })) }}>Book This Room</PrimaryBtn>
              <SecondaryBtn onClick={() => setModal(null)}>Close</SecondaryBtn>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'add' && (
        <Modal title="Book a Classroom" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div><Label required>Purpose / Title</Label>
              <input className={`input-dark ${errors.title?'error':''}`} value={form.title} onChange={set('title')} placeholder="e.g. CS301 Lecture" />
              <FieldError msg={errors.title} /></div>
            <div><Label required>Select Room</Label>
              <select className={`input-dark ${errors.room?'error':''}`} value={form.room} onChange={set('room')}>
                <option value="">— Choose a room —</option>
                {classrooms.filter(r => r.status === 'Available').map(r => <option key={r.id} value={r.code}>{r.name} ({r.code}) — Cap: {r.capacity}</option>)}
              </select><FieldError msg={errors.room} /></div>
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
            <div className="flex gap-3 pt-2">
              <PrimaryBtn onClick={submitBooking}>Submit Booking</PrimaryBtn>
              <SecondaryBtn onClick={() => setModal(null)}>Cancel</SecondaryBtn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
