import { useState } from 'react'
import { Plus, Megaphone, Trash2, Pin, Calendar, User, X, AlertCircle } from 'lucide-react'
import { useAuth } from '../AuthContext'
import { Modal, Label, FieldError, PrimaryBtn, SecondaryBtn, SectionHeader } from '../components/UI'

const C = {
  bg:'var(--bg)', surface:'var(--surface)', surface2:'var(--surface2)', surface3:'var(--surface3)',
  border:'var(--border)', borderDim:'var(--border-dim)',
  accent:'var(--accent)', text:'var(--text-primary)',
  textSec:'var(--text-secondary)', textMuted:'var(--text-muted)',
  danger:'var(--danger)', success:'var(--success)', warning:'var(--warning)',
}

const NEWS_KEY = 'uroms_news'
const SEED_NEWS = [
  { id:1, title:'Welcome to UROMS Academic Year 2024-25', body:'The university resource and operations management system is now live. All staff and students can access their respective modules. Please contact the admin for any issues.', category:'General', pinned:true, author:'Admin User', date:'2024-09-01' },
  { id:2, title:'HEC Accreditation Visit — May 20-22', body:'The Higher Education Commission will conduct an accreditation visit from May 20 to 22. All departments are requested to ensure their documentation is up to date.', category:'Accreditation', pinned:false, author:'Admin User', date:'2024-04-15' },
  { id:3, title:'Lab Booking System Updated', body:'The laboratory scheduling module has been updated. Students can now book lab sessions directly through the system. Please review the new booking guidelines.', category:'Academic', pinned:false, author:'Admin User', date:'2024-04-10' },
]

const CATEGORIES = ['General','Academic','Accreditation','Events','Administrative']
const CAT_STYLE = {
  General:        { bg:'#eff6ff', color:'#1d4ed8', border:'#bfdbfe' },
  Academic:       { bg:'#f0fdf4', color:'#166534', border:'#bbf7d0' },
  Accreditation:  { bg:'#fef2f2', color:'#c0392b', border:'#fecaca' },
  Events:         { bg:'#fdf4ff', color:'#7e22ce', border:'#e9d5ff' },
  Administrative: { bg:'#fff7ed', color:'#c2410c', border:'#fed7aa' },
}

const loadNews = () => { try { return JSON.parse(localStorage.getItem(NEWS_KEY)) || SEED_NEWS } catch { return SEED_NEWS } }
const saveNews = d => localStorage.setItem(NEWS_KEY, JSON.stringify(d))

function validate(f) {
  const e = {}
  if (!f.title?.trim()) e.title = 'Title is required'
  if (!f.body?.trim())  e.body  = 'Content is required'
  return e
}

export default function News() {
  const { user, can } = useAuth()
  const [news, setNews]     = useState(loadNews)
  const [modal, setModal]   = useState(false)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('All')
  const [form, setForm]     = useState({ title:'', body:'', category:'General', pinned:false })
  const [errors, setErrors] = useState({})

  const set = k => e => { setForm(f => ({ ...f, [k]: e.target.value })); if (errors[k]) setErrors(ev => ({ ...ev, [k]:'' })) }

  const filtered = news
    .filter(n => filter === 'All' || n.category === filter)
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.date) - new Date(a.date))

  const post = () => {
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length) return
    const item = { id:Date.now(), ...form, author:user.name, date:new Date().toISOString().split('T')[0] }
    const updated = [item, ...news]
    setNews(updated); saveNews(updated)
    setModal(false); setForm({ title:'', body:'', category:'General', pinned:false })
  }

  const remove = (id, e) => {
    e.stopPropagation()
    const updated = news.filter(n => n.id !== id)
    setNews(updated); saveNews(updated)
    if (selected?.id === id) setSelected(null)
  }

  const togglePin = (id, e) => {
    e.stopPropagation()
    const updated = news.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n)
    setNews(updated); saveNews(updated)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="University News & Announcements"
        sub={`${news.length} announcements · ${news.filter(n => n.pinned).length} pinned`}
        action={can('news:post') && (
          <PrimaryBtn icon={Plus} onClick={() => { setModal(true); setErrors({}) }}>Post Announcement</PrimaryBtn>
        )}
      />

      {/* Category filter */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {['All', ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setFilter(c)}
            style={{ padding:'6px 16px', borderRadius:20, fontSize:13, fontWeight:600, cursor:'pointer', border:'1.5px solid', transition:'all 0.15s',
              background: filter === c ? C.border : C.surface2,
              color: filter === c ? '#fff' : C.textSec,
              borderColor: filter === c ? C.border : C.borderDim }}>
            {c}
          </button>
        ))}
      </div>

      {/* News grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:C.textMuted }}>
          <Megaphone size={40} style={{ margin:'0 auto 12px', opacity:0.3 }} />
          <p style={{ fontWeight:600 }}>No announcements yet</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(340px, 1fr))', gap:20 }}>
          {filtered.map(item => {
            const cs = CAT_STYLE[item.category] || CAT_STYLE.General
            return (
              <div key={item.id} className="glass-card p-5 cursor-pointer"
                onClick={() => setSelected(item)}
                style={{ position:'relative', borderLeft: item.pinned ? `4px solid ${C.border}` : undefined }}>
                {item.pinned && (
                  <div style={{ position:'absolute', top:14, right:14, display:'flex', alignItems:'center', gap:4 }}>
                    <Pin size={12} color={C.accent} />
                    <span style={{ fontSize:10, fontWeight:700, color:C.accent }}>PINNED</span>
                  </div>
                )}
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                  <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:cs.bg, color:cs.color, border:`1px solid ${cs.border}` }}>
                    {item.category}
                  </span>
                </div>
                <h3 style={{ fontWeight:800, fontSize:15, color:C.text, margin:'0 0 8px', lineHeight:1.4, paddingRight: item.pinned ? 60 : 0 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize:13, color:C.textMuted, lineHeight:1.6, margin:'0 0 14px', display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                  {item.body}
                </p>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:C.textMuted }}>
                      <User size={11} />{item.author}
                    </span>
                    <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:C.textMuted }}>
                      <Calendar size={11} />{item.date}
                    </span>
                  </div>
                  {can('news:delete') && (
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={e => togglePin(item.id, e)}
                        style={{ padding:'4px 8px', borderRadius:6, border:`1px solid ${C.borderDim}`, background:'transparent', cursor:'pointer', fontSize:11, color:C.textMuted }}
                        title={item.pinned ? 'Unpin' : 'Pin'}>
                        <Pin size={12} />
                      </button>
                      <button onClick={e => remove(item.id, e)}
                        style={{ padding:'4px 8px', borderRadius:6, border:'1px solid rgba(220,38,38,0.25)', background:'rgba(220,38,38,0.06)', cursor:'pointer', color:C.danger }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Read modal */}
      {selected && (
        <Modal title={selected.title} onClose={() => setSelected(null)} size="lg">
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16, flexWrap:'wrap' }}>
            {(() => { const cs = CAT_STYLE[selected.category] || CAT_STYLE.General; return (
              <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:cs.bg, color:cs.color, border:`1px solid ${cs.border}` }}>{selected.category}</span>
            )})()}
            {selected.pinned && <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:'#fff7ed', color:'#c2410c', border:'1px solid #fed7aa' }}>📌 Pinned</span>}
            <span style={{ fontSize:12, color:C.textMuted, marginLeft:'auto' }}>
              By {selected.author} · {selected.date}
            </span>
          </div>
          <p style={{ fontSize:15, color:C.textSec, lineHeight:1.8, whiteSpace:'pre-wrap' }}>{selected.body}</p>
        </Modal>
      )}

      {/* Post modal */}
      {modal && (
        <Modal title="Post Announcement" onClose={() => setModal(false)}>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <Label required>Title</Label>
              <input className={`input-dark ${errors.title ? 'error' : ''}`} value={form.title}
                onChange={set('title')} placeholder="e.g. Important Notice for All Students" />
              <FieldError msg={errors.title} />
            </div>
            <div>
              <Label required>Content</Label>
              <textarea className={`input-dark ${errors.body ? 'error' : ''}`} value={form.body}
                onChange={set('body')} placeholder="Write your announcement here…"
                rows={5} style={{ resize:'vertical' }} />
              <FieldError msg={errors.body} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <Label>Category</Label>
                <select className="input-dark" value={form.category} onChange={set('category')}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', alignItems:'flex-end', paddingBottom:2 }}>
                <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:14, fontWeight:600, color:C.textSec }}>
                  <input type="checkbox" checked={form.pinned} onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))}
                    style={{ width:16, height:16, cursor:'pointer' }} />
                  Pin this announcement
                </label>
              </div>
            </div>
            <div style={{ display:'flex', gap:12, paddingTop:4 }}>
              <PrimaryBtn onClick={post}>Post Announcement</PrimaryBtn>
              <SecondaryBtn onClick={() => setModal(false)}>Cancel</SecondaryBtn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
