import { useState } from 'react'
import { Plus, Calendar, MapPin, Users, Clock } from 'lucide-react'
import { Card, Badge, Modal, Table, TR, TD, SectionHeader, PrimaryBtn, SecondaryBtn, SearchInput, Label, FieldError, Progress, StatCard, Tabs, InfoGrid, Toast } from '../components/UI'
import { getEvents, saveEvents } from '../store'
import { useAuth } from '../AuthContext'

const C = { surface2:'var(--surface2)', borderDim:'var(--border-dim)', accent:'var(--accent)', text:'var(--text-primary)', textMuted:'var(--text-muted)', success:'var(--success)', warning:'var(--warning)', danger:'var(--danger)' }
const TYPE_COLOR = { Academic:C.accent, Accreditation:C.danger, Student:C.success, Career:C.warning, Cultural:'#a78bfa' }

function validate(f) {
  const e = {}
  if (!f.title?.trim())  e.title    = 'Event title is required'
  if (!f.date)           e.date     = 'Start date is required'
  if (!f.venue?.trim())  e.venue    = 'Venue is required'
  if (!f.capacity || isNaN(f.capacity) || Number(f.capacity) < 1) e.capacity = 'Enter valid capacity'
  if (f.endDate && f.endDate < f.date) e.endDate = 'End date must be on or after start date'
  return e
}

export default function Events() {
  const { user } = useAuth()
  const [events, setEvents]   = useState(() => getEvents())
  const [search, setSearch]   = useState('')
  const [modal, setModal]     = useState(null)
  const [selected, setSelected] = useState(null)
  const [view, setView]       = useState('cards')
  const [form, setForm]       = useState({ title:'', type:'Academic', date:'', endDate:'', venue:'', campus:'Main', organizer:'', capacity:'' })
  const [errors, setErrors]   = useState({})
  const [toast, setToast]     = useState(null)

  const filtered = events.filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || e.type.toLowerCase().includes(search.toLowerCase()))
  const set = k => e => { setForm(f => ({ ...f, [k]:e.target.value })); if (errors[k]) setErrors(ev => ({ ...ev, [k]:'' })) }

  const submit = () => {
    const errs = validate(form); setErrors(errs)
    if (Object.keys(errs).length) return
    const newEvent = { id:Date.now(), title:form.title, type:form.type, date:form.date, end_date:form.endDate||form.date, venue:form.venue, campus:form.campus, organizer:form.organizer||user?.name||'', capacity:Number(form.capacity), registered:0, status:'Upcoming' }
    const updated = [newEvent, ...events]
    saveEvents(updated); setEvents(updated)
    setToast({ type:'success', msg:`Event "${form.title}" created!` })
    setForm({ title:'', type:'Academic', date:'', endDate:'', venue:'', campus:'Main', organizer:'', capacity:'' }); setModal(null)
  }

  const doRegister = (ev) => {
    if (ev.registered >= ev.capacity) return
    const updated = events.map(e => e.id === ev.id ? { ...e, registered:e.registered+1 } : e)
    saveEvents(updated); setEvents(updated)
    if (selected?.id === ev.id) setSelected(s => ({ ...s, registered:s.registered+1 }))
    setToast({ type:'success', msg:'Registered successfully!' })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <Toast type={toast.type} msg={toast.msg} onDismiss={() => setToast(null)} />}
      <SectionHeader title="Event Management" sub={`${events.length} events · ${events.filter(e=>e.status==='Upcoming').length} upcoming`}
        action={<PrimaryBtn icon={Plus} onClick={() => { setModal('create'); setErrors({}) }}>Create Event</PrimaryBtn>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Events"     value={events.length}                                    icon={Calendar} color={C.accent} />
        <StatCard title="Upcoming"         value={events.filter(e=>e.status==='Upcoming').length}   icon={Clock}    color={C.warning} />
        <StatCard title="Total Registered" value={events.reduce((a,e)=>a+(e.registered||0),0)}      icon={Users}    color={C.success} />
        <StatCard title="Venues"           value={new Set(events.map(e=>e.venue)).size}             icon={MapPin}   color={C.accent} />
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <Tabs tabs={[{ value:'cards', label:'Card View' }, { value:'table', label:'Table View' }]} active={view} onChange={setView} />
        <SearchInput value={search} onChange={setSearch} placeholder="Search events..." />
      </div>

      {view === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(event => {
            const tc = TYPE_COLOR[event.type] || C.accent
            return (
              <div key={event.id} className="glass-card p-5 cursor-pointer" onClick={() => { setSelected(event); setModal('detail') }}>
                <div className="flex items-start justify-between mb-3">
                  <span className="badge" style={{ background:`${tc}22`, color:tc, border:`1px solid ${tc}44` }}>{event.type}</span>
                  <Badge status={event.status} />
                </div>
                <h3 className="font-bold text-base mb-2 leading-snug" style={{ color:C.text }}>{event.title}</h3>
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs" style={{ color:C.textMuted }}><Calendar size={12}/><span>{event.date}{event.end_date !== event.date ? ` → ${event.end_date}` : ''}</span></div>
                  <div className="flex items-center gap-2 text-xs" style={{ color:C.textMuted }}><MapPin size={12}/><span>{event.venue} · {event.campus}</span></div>
                  <div className="flex items-center gap-2 text-xs" style={{ color:C.textMuted }}><Users size={12}/><span>{event.registered} / {event.capacity} registered</span></div>
                </div>
                <Progress value={event.registered} max={event.capacity} color={tc} />
                <p className="text-xs mt-1 text-right" style={{ color:C.textMuted }}>{Math.round((event.registered/event.capacity)*100)}% capacity</p>
              </div>
            )
          })}
        </div>
      ) : (
        <Card>
          <Table headers={['Event','Type','Date','Venue','Registered','Status']}>
            {filtered.map(e => {
              const tc = TYPE_COLOR[e.type] || C.accent
              return (
                <TR key={e.id}>
                  <TD><span className="font-bold" style={{ color:C.text }}>{e.title}</span></TD>
                  <TD><span className="badge" style={{ background:`${tc}22`, color:tc, border:`1px solid ${tc}44` }}>{e.type}</span></TD>
                  <TD>{e.date}</TD><TD>{e.venue}</TD><TD>{e.registered}/{e.capacity}</TD>
                  <TD><Badge status={e.status} /></TD>
                </TR>
              )
            })}
          </Table>
        </Card>
      )}

      {modal === 'detail' && selected && (
        <Modal title={selected.title} onClose={() => setModal(null)} size="lg">
          <div className="space-y-4">
            <InfoGrid items={[['Type',selected.type],['Organizer',selected.organizer||'—'],['Start',selected.date],['End',selected.end_date],['Venue',selected.venue],['Campus',selected.campus]]} />
            <div className="flex justify-between text-sm mb-2"><span style={{ color:C.textMuted }}>Registration</span><span className="font-bold" style={{ color:C.text }}>{selected.registered}/{selected.capacity}</span></div>
            <Progress value={selected.registered} max={selected.capacity} color={TYPE_COLOR[selected.type]||C.accent} />
            <div className="flex gap-3 pt-2">
              <PrimaryBtn onClick={() => doRegister(selected)} disabled={selected.registered >= selected.capacity}>
                {selected.registered >= selected.capacity ? 'Event Full' : 'Register Attendee'}
              </PrimaryBtn>
              <SecondaryBtn onClick={() => setModal(null)}>Close</SecondaryBtn>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'create' && (
        <Modal title="Create Event" onClose={() => setModal(null)} size="lg">
          <div className="space-y-4">
            <div><Label required>Event Title</Label>
              <input className={`input-dark ${errors.title?'error':''}`} value={form.title} onChange={set('title')} placeholder="e.g. Annual Tech Symposium 2024" />
              <FieldError msg={errors.title} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Event Type</Label>
                <select className="input-dark" value={form.type} onChange={set('type')}>{['Academic','Accreditation','Student','Career','Cultural'].map(t => <option key={t}>{t}</option>)}</select></div>
              <div><Label>Campus</Label>
                <select className="input-dark" value={form.campus} onChange={set('campus')}>{['Main','North'].map(c => <option key={c}>{c}</option>)}</select></div>
            </div>
            <div><Label required>Venue</Label>
              <input className={`input-dark ${errors.venue?'error':''}`} value={form.venue} onChange={set('venue')} placeholder="e.g. Main Auditorium" />
              <FieldError msg={errors.venue} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label required>Start Date</Label>
                <input type="date" className={`input-dark ${errors.date?'error':''}`} value={form.date} onChange={set('date')} />
                <FieldError msg={errors.date} /></div>
              <div><Label>End Date</Label>
                <input type="date" className={`input-dark ${errors.endDate?'error':''}`} value={form.endDate} onChange={set('endDate')} />
                <FieldError msg={errors.endDate} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label required>Capacity</Label>
                <input type="number" min="1" className={`input-dark ${errors.capacity?'error':''}`} value={form.capacity} onChange={set('capacity')} placeholder="e.g. 500" />
                <FieldError msg={errors.capacity} /></div>
              <div><Label>Organizer</Label><input className="input-dark" value={form.organizer} onChange={set('organizer')} placeholder="e.g. CS Department" /></div>
            </div>
            <div className="flex gap-3 pt-2">
              <PrimaryBtn onClick={submit}>Create Event</PrimaryBtn>
              <SecondaryBtn onClick={() => setModal(null)}>Cancel</SecondaryBtn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
