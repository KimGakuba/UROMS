import { useState } from 'react'
import { Download, FileText, CheckCircle, Clock, Plus } from 'lucide-react'
import { Card, Modal, Table, TR, TD, SectionHeader, PrimaryBtn, SecondaryBtn, Label, FieldError, StatCard, Progress, Tabs, InfoGrid, Toast } from '../components/UI'
import { getAccreditation, saveAccreditation } from '../store'

const C = { surface2:'var(--surface2)', borderDim:'var(--border-dim)', accent:'var(--accent)', text:'var(--text-primary)', textMuted:'var(--text-muted)', success:'var(--success)', warning:'var(--warning)', danger:'var(--danger)' }
const TYPE_COLORS = { HEC:C.accent, AAA:C.danger, Internal:C.success }

const METRICS = [
  { label:'Student-Faculty Ratio', value:'18:1',      target:'20:1',    score:96, status:'Met' },
  { label:'PhD Faculty %',         value:'72%',       target:'70%',     score:94, status:'Met' },
  { label:'Lab Hours/Student',     value:'4.2 hrs/wk',target:'4 hrs/wk',score:91, status:'Met' },
  { label:'Research Publications', value:'48',        target:'40',      score:88, status:'Met' },
  { label:'Industry Linkages',     value:'12',        target:'15',      score:72, status:'Partial' },
  { label:'Graduate Employment',   value:'84%',       target:'85%',     score:68, status:'Partial' },
]

function validate(f) {
  const e = {}
  if (!f.title?.trim())  e.title    = 'Report title is required'
  if (!f.deadline)       e.deadline = 'Deadline is required'
  if (!f.period?.trim()) e.period   = 'Period is required'
  return e
}

export default function Accreditation() {
  const [reports, setReports] = useState(() => getAccreditation())
  const [modal, setModal]     = useState(null)
  const [selected, setSelected] = useState(null)
  const [tab, setTab]         = useState('reports')
  const [form, setForm]       = useState({ title:'', type:'HEC', period:'', deadline:'', auditor:'' })
  const [errors, setErrors]   = useState({})
  const [toast, setToast]     = useState(null)

  const submitted = reports.filter(r => r.status==='Submitted'||r.status==='Approved').length
  const avgScore  = Math.round(reports.filter(r=>r.score).reduce((a,r)=>a+r.score,0) / (reports.filter(r=>r.score).length||1))
  const set = k => e => { setForm(f => ({ ...f, [k]:e.target.value })); if (errors[k]) setErrors(ev => ({ ...ev, [k]:'' })) }

  const submit = () => {
    const errs = validate(form); setErrors(errs)
    if (Object.keys(errs).length) return
    const newReport = { id:Date.now(), title:form.title, type:form.type, period:form.period, deadline:form.deadline, auditor:form.auditor, status:'Draft', score:null, submitted_on:null }
    const updated = [...reports, newReport]
    saveAccreditation(updated); setReports(updated)
    setToast({ type:'success', msg:'Report created!' })
    setForm({ title:'', type:'HEC', period:'', deadline:'', auditor:'' }); setModal(null)
  }

  const exportReport = r => {
    const content = `UROMS Accreditation Report\n${'='.repeat(40)}\nTitle: ${r.title}\nType: ${r.type}\nPeriod: ${r.period}\nStatus: ${r.status}\nScore: ${r.score||'N/A'}\nDeadline: ${r.deadline}\nAuditor: ${r.auditor}\n`
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([content], { type:'text/plain' }))
    a.download = `${r.title.replace(/\s+/g,'-')}.txt`; a.click()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <Toast type={toast.type} msg={toast.msg} onDismiss={() => setToast(null)} />}
      <SectionHeader title="Accreditation Reports" sub="HEC & AAA compliance monitoring and audit management"
        action={<PrimaryBtn icon={Plus} onClick={() => { setModal('create'); setErrors({}) }}>New Report</PrimaryBtn>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Reports" value={reports.length}  icon={FileText}   color={C.accent} />
        <StatCard title="Submitted"     value={submitted}       icon={CheckCircle} color={C.success} />
        <StatCard title="Avg Score"     value={`${avgScore}%`}  icon={CheckCircle} color={C.accent} />
        <StatCard title="Pending"       value={reports.filter(r=>r.status==='Draft'||r.status==='In Review').length} icon={Clock} color={C.warning} />
      </div>

      <Tabs tabs={[{ value:'reports', label:'Reports' },{ value:'metrics', label:'Metrics' },{ value:'deadlines', label:'Deadlines' }]} active={tab} onChange={setTab} />

      {tab === 'reports' && (
        <div className="space-y-3">
          {reports.map(r => (
            <div key={r.id} className="glass-card p-5 cursor-pointer" onClick={() => { setSelected(r); setModal('detail') }}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:C.surface2 }}>
                    <FileText size={18} style={{ color:TYPE_COLORS[r.type]||C.accent }} />
                  </div>
                  <div>
                    <p style={{ color:C.text, fontWeight:700 }}>{r.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="badge" style={{ background:`${TYPE_COLORS[r.type]||C.accent}22`, color:TYPE_COLORS[r.type]||C.accent, border:`1px solid ${TYPE_COLORS[r.type]||C.accent}44` }}>{r.type}</span>
                      <span style={{ color:C.textMuted, fontSize:12 }}>Period: {r.period}</span>
                      <span style={{ color:C.textMuted, fontSize:12 }}>Auditor: {r.auditor}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {r.score && <div className="text-center"><p style={{ color:C.text, fontWeight:700, fontSize:20 }}>{r.score}%</p><p style={{ color:C.textMuted, fontSize:11 }}>Score</p></div>}
                  <span className={`badge ${r.status==='Submitted'||r.status==='Approved'?'badge-green':r.status==='In Review'?'badge-blue':'badge-gray'}`}>{r.status}</span>
                  <button onClick={e => { e.stopPropagation(); exportReport(r) }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ border:`1.5px solid ${C.borderDim}`, color:C.textMuted }}
                    onMouseEnter={e => e.currentTarget.style.background = C.surface2}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <Download size={14} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-6 mt-3 pt-3" style={{ borderTop:`1px solid ${C.borderDim}` }}>
                <span style={{ color:C.textMuted, fontSize:12, display:'flex', alignItems:'center', gap:4 }}><Clock size={11}/>Deadline: {r.deadline}</span>
                {r.submitted_on && <span style={{ color:C.textMuted, fontSize:12, display:'flex', alignItems:'center', gap:4 }}><CheckCircle size={11}/>Submitted: {r.submitted_on}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'metrics' && (
        <Card>
          <p style={{ color:C.text, fontWeight:700, fontSize:17, marginBottom:16 }}>HEC Compliance Metrics</p>
          <div className="space-y-4">
            {METRICS.map(m => (
              <div key={m.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div><span style={{ color:C.text, fontSize:14, fontWeight:700 }}>{m.label}</span><span style={{ color:C.textMuted, fontSize:12, marginLeft:8 }}>Target: {m.target}</span></div>
                  <div className="flex items-center gap-2"><span style={{ color:C.text, fontWeight:700 }}>{m.value}</span><span className={`badge ${m.status==='Met'?'badge-green':'badge-yellow'}`}>{m.status}</span></div>
                </div>
                <Progress value={m.score} color={m.status==='Met' ? C.success : C.warning} />
                <p style={{ color:C.textMuted, fontSize:11, marginTop:2, textAlign:'right' }}>{m.score}%</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'deadlines' && (
        <Card>
          <p style={{ color:C.text, fontWeight:700, fontSize:17, marginBottom:16 }}>Upcoming Deadlines</p>
          <Table headers={['Report','Type','Deadline','Status','Days Left']}>
            {reports.filter(r=>r.status!=='Approved').sort((a,b)=>new Date(a.deadline)-new Date(b.deadline)).map(r => {
              const days = Math.ceil((new Date(r.deadline) - new Date()) / (1000*60*60*24))
              return (
                <TR key={r.id}>
                  <TD><span style={{ fontWeight:700, color:C.text }}>{r.title}</span></TD>
                  <TD><span className="badge" style={{ background:`${TYPE_COLORS[r.type]||C.accent}22`, color:TYPE_COLORS[r.type]||C.accent, border:`1px solid ${TYPE_COLORS[r.type]||C.accent}44` }}>{r.type}</span></TD>
                  <TD>{r.deadline}</TD>
                  <TD><span className={`badge ${r.status==='Submitted'?'badge-green':r.status==='In Review'?'badge-blue':'badge-gray'}`}>{r.status}</span></TD>
                  <TD><span style={{ fontWeight:700, color:days<7?C.danger:days<30?C.warning:C.success }}>{days>0?`${days} days`:'Overdue'}</span></TD>
                </TR>
              )
            })}
          </Table>
        </Card>
      )}

      {modal === 'detail' && selected && (
        <Modal title={selected.title} onClose={() => setModal(null)} size="lg">
          <div className="space-y-4">
            <InfoGrid items={[['Type',selected.type],['Period',selected.period],['Status',selected.status],['Auditor',selected.auditor||'—'],['Deadline',selected.deadline],['Submitted',selected.submitted_on||'Not yet']]} />
            {selected.score && (
              <><div className="flex justify-between mb-2"><span style={{ color:C.textMuted, fontSize:13 }}>Compliance Score</span><span style={{ color:C.text, fontWeight:700 }}>{selected.score}%</span></div>
              <Progress value={selected.score} color={selected.score>=90?C.success:C.warning} /></>
            )}
            <div className="flex gap-3 pt-2">
              <PrimaryBtn icon={Download} onClick={() => exportReport(selected)}>Download Report</PrimaryBtn>
              <SecondaryBtn onClick={() => setModal(null)}>Close</SecondaryBtn>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'create' && (
        <Modal title="Create Accreditation Report" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div><Label required>Report Title</Label>
              <input className={`input-dark ${errors.title?'error':''}`} value={form.title} onChange={set('title')} placeholder="e.g. HEC Annual Compliance Report" />
              <FieldError msg={errors.title} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Report Type</Label>
                <select className="input-dark" value={form.type} onChange={set('type')}>{['HEC','AAA','Internal'].map(t => <option key={t}>{t}</option>)}</select></div>
              <div><Label required>Period</Label>
                <input className={`input-dark ${errors.period?'error':''}`} value={form.period} onChange={set('period')} placeholder="e.g. 2024-25" />
                <FieldError msg={errors.period} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label required>Deadline</Label>
                <input type="date" className={`input-dark ${errors.deadline?'error':''}`} value={form.deadline} onChange={set('deadline')} />
                <FieldError msg={errors.deadline} /></div>
              <div><Label>Auditor</Label><input className="input-dark" value={form.auditor} onChange={set('auditor')} placeholder="e.g. HEC Pakistan" /></div>
            </div>
            <div className="flex gap-3 pt-2">
              <PrimaryBtn onClick={submit}>Create Report</PrimaryBtn>
              <SecondaryBtn onClick={() => setModal(null)}>Cancel</SecondaryBtn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
