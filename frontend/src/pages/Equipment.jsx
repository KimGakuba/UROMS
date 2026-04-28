import { useState } from 'react'
import { Plus, Cpu, Package, Wrench } from 'lucide-react'
import { Card, Modal, Table, TR, TD, SectionHeader, PrimaryBtn, SecondaryBtn, SearchInput, Label, FieldError, Progress, StatCard, Tabs, InfoGrid, Toast } from '../components/UI'
import { getEquipment, saveEquipment, getEqBookings, saveEqBookings } from '../store'
import { useAuth } from '../AuthContext'

const C = { surface2:'var(--surface2)', borderDim:'var(--border-dim)', accent:'var(--accent)', text:'var(--text-primary)', textMuted:'var(--text-muted)', success:'var(--success)', warning:'var(--warning)', danger:'var(--danger)' }

function validate(f, equipment) {
  const e = {}
  if (!f.equipmentId) e.equipmentId = 'Select equipment'
  if (!f.qty || isNaN(f.qty) || Number(f.qty) < 1) e.qty = 'Enter a valid quantity'
  if (f.equipmentId && f.qty) {
    const eq = equipment.find(x => String(x.id) === String(f.equipmentId))
    if (eq && Number(f.qty) > eq.available) e.qty = `Only ${eq.available} units available`
  }
  if (!f.borrowDate)  e.borrowDate = 'Borrow date is required'
  if (!f.returnDate)  e.returnDate = 'Return date is required'
  if (f.borrowDate && f.returnDate && f.returnDate < f.borrowDate) e.returnDate = 'Return date must be after borrow date'
  return e
}

export default function Equipment() {
  const { user } = useAuth()
  const [equipment, setEquipment] = useState(() => getEquipment())
  const [bookings, setBookings]   = useState(() => getEqBookings())
  const [search, setSearch]       = useState('')
  const [modal, setModal]         = useState(null)
  const [selected, setSelected]   = useState(null)
  const [tab, setTab]             = useState('inventory')
  const [form, setForm]           = useState({ equipmentId:'', qty:'', borrower:'', purpose:'', borrowDate:'', returnDate:'' })
  const [errors, setErrors]       = useState({})
  const [toast, setToast]         = useState(null)

  const filtered = equipment.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || (e.category||'').toLowerCase().includes(search.toLowerCase()))
  const totalItems = equipment.reduce((a,e) => a+e.total, 0)
  const availableItems = equipment.reduce((a,e) => a+e.available, 0)
  const inMaintenance = equipment.filter(e => e.status==='Maintenance').length

  const set = k => e => { setForm(f => ({ ...f, [k]:e.target.value })); if (errors[k]) setErrors(ev => ({ ...ev, [k]:'' })) }

  const submitBook = () => {
    const errs = validate(form, equipment); setErrors(errs)
    if (Object.keys(errs).length) return
    const eq = equipment.find(x => String(x.id) === String(form.equipmentId))
    const updatedEq = equipment.map(x => String(x.id) === String(form.equipmentId) ? { ...x, available:x.available - Number(form.qty) } : x)
    saveEquipment(updatedEq); setEquipment(updatedEq)
    const newBooking = { id:Date.now(), item_name:eq.name, quantity:Number(form.qty), borrower:form.borrower||user?.name||'—', purpose:form.purpose, borrow_date:form.borrowDate, return_date:form.returnDate, status:'Active' }
    const updatedBk = [newBooking, ...bookings]
    saveEqBookings(updatedBk); setBookings(updatedBk)
    setToast({ type:'success', msg:'Equipment booked!' })
    setForm({ equipmentId:'', qty:'', borrower:'', purpose:'', borrowDate:'', returnDate:'' }); setModal(null)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <Toast type={toast.type} msg={toast.msg} onDismiss={() => setToast(null)} />}
      <SectionHeader title="Equipment Booking" sub={`${equipment.length} types · ${availableItems} units available`}
        action={<PrimaryBtn icon={Plus} onClick={() => { setModal('book'); setErrors({}) }}>Book Equipment</PrimaryBtn>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Items"  value={totalItems}                              icon={Package} color={C.accent} />
        <StatCard title="Available"    value={availableItems}                          icon={Cpu}     color={C.success} />
        <StatCard title="In Use"       value={totalItems - availableItems - inMaintenance} icon={Cpu} color={C.warning} />
        <StatCard title="Maintenance"  value={inMaintenance}                           icon={Wrench}  color={C.warning} />
      </div>

      <Tabs tabs={[{ value:'inventory', label:'Inventory' }, { value:'bookings', label:'Booking History' }]} active={tab} onChange={setTab} />

      {tab === 'inventory' && (
        <>
          <div className="flex justify-end"><SearchInput value={search} onChange={setSearch} placeholder="Search equipment..." /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(eq => (
              <div key={eq.id} className="glass-card p-5 cursor-pointer" onClick={() => { setSelected(eq); setModal('detail') }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:C.surface2 }}><Cpu size={18} style={{ color:C.accent }} /></div>
                  <span className={`badge ${eq.status==='Good'?'badge-green':'badge-yellow'}`}>{eq.status}</span>
                </div>
                <p style={{ color:'var(--text-primary)', fontWeight:700 }}>{eq.name}</p>
                <p style={{ color:C.textMuted, fontSize:12, marginTop:2, marginBottom:12 }}>{eq.code} · {eq.category}</p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[['Total',eq.total],['Available',eq.available],['In Use',eq.total-eq.available]].map(([k,v]) => (
                    <div key={k} className="rounded-lg p-2 text-center" style={{ background:C.surface2 }}>
                      <p style={{ color:'var(--text-primary)', fontWeight:700, fontSize:18 }}>{v}</p>
                      <p style={{ color:C.textMuted, fontSize:11 }}>{k}</p>
                    </div>
                  ))}
                </div>
                <Progress value={eq.available} max={eq.total} />
                <p style={{ color:C.textMuted, fontSize:11, marginTop:4 }}>Last maintenance: {eq.last_maintenance||eq.lastMaintenance||'—'}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'bookings' && (
        <Card>
          <Table headers={['Equipment','Qty','Borrower','Borrow Date','Return Date','Status']}>
            {bookings.map(b => (
              <TR key={b.id}>
                <TD><span style={{ fontWeight:700, color:'var(--text-primary)' }}>{b.item_name}</span></TD>
                <TD>{b.quantity}</TD><TD>{b.borrower}</TD><TD>{b.borrow_date}</TD><TD>{b.return_date}</TD>
                <TD><span className={`badge ${b.status==='Active'?'badge-green':b.status==='Returned'?'badge-blue':'badge-yellow'}`}>{b.status}</span></TD>
              </TR>
            ))}
          </Table>
        </Card>
      )}

      {modal === 'detail' && selected && (
        <Modal title={selected.name} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <InfoGrid items={[['Code',selected.code],['Category',selected.category],['Total',selected.total],['Available',selected.available],['Campus',selected.campus],['Status',selected.status]]} />
            <div className="flex justify-between mb-2"><span style={{ color:C.textMuted, fontSize:13 }}>Availability</span><span style={{ color:'var(--text-primary)', fontWeight:700 }}>{selected.available}/{selected.total} units</span></div>
            <Progress value={selected.available} max={selected.total} />
            <div className="flex gap-3">
              <PrimaryBtn onClick={() => { setModal('book'); setForm(f => ({ ...f, equipmentId:String(selected.id) })) }}>Book This Equipment</PrimaryBtn>
              <SecondaryBtn onClick={() => setModal(null)}>Close</SecondaryBtn>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'book' && (
        <Modal title="Book Equipment" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div><Label required>Equipment</Label>
              <select className={`input-dark ${errors.equipmentId?'error':''}`} value={form.equipmentId} onChange={set('equipmentId')}>
                <option value="">— Select equipment —</option>
                {equipment.filter(e => e.available > 0).map(e => <option key={e.id} value={e.id}>{e.name} ({e.available} available)</option>)}
              </select><FieldError msg={errors.equipmentId} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label required>Quantity</Label>
                <input type="number" min="1" className={`input-dark ${errors.qty?'error':''}`} value={form.qty} onChange={set('qty')} placeholder="1" />
                <FieldError msg={errors.qty} /></div>
              <div><Label>Borrower</Label><input className="input-dark" value={form.borrower} onChange={set('borrower')} placeholder="Name or department" /></div>
            </div>
            <div><Label>Purpose</Label><input className="input-dark" value={form.purpose} onChange={set('purpose')} placeholder="e.g. Lab Session" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label required>Borrow Date</Label>
                <input type="date" className={`input-dark ${errors.borrowDate?'error':''}`} value={form.borrowDate} onChange={set('borrowDate')} />
                <FieldError msg={errors.borrowDate} /></div>
              <div><Label required>Return Date</Label>
                <input type="date" className={`input-dark ${errors.returnDate?'error':''}`} value={form.returnDate} onChange={set('returnDate')} />
                <FieldError msg={errors.returnDate} /></div>
            </div>
            <div className="flex gap-3 pt-2">
              <PrimaryBtn onClick={submitBook}>Submit Request</PrimaryBtn>
              <SecondaryBtn onClick={() => setModal(null)}>Cancel</SecondaryBtn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
