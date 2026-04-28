import { X, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

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

export function Card({ children, className = '', style = {} }) {
  return (
    <div className={`glass-card p-5 ${className}`} style={style}>
      {children}
    </div>
  )
}

export function StatCard({ title, value, sub, icon: Icon, color, delay = '0s' }) {
  return (
    <div className="stat-card glass-card p-5 animate-fade-in" style={{ animationDelay: delay }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: C.surface3, border: `1.5px solid ${C.borderDim}` }}>
          <Icon size={18} style={{ color: color || C.accent }} />
        </div>
      </div>
      <p className="text-3xl font-bold" style={{ color: C.text }}>{value}</p>
      <p className="text-sm font-semibold mt-1" style={{ color: C.textSec }}>{title}</p>
      {sub && <p className="text-xs mt-1" style={{ color: C.textMuted }}>{sub}</p>}
    </div>
  )
}

export function Badge({ status }) {
  const map = {
    Available: 'badge-green', Active: 'badge-green', Approved: 'badge-green',
    Completed: 'badge-green', Submitted: 'badge-green', Good: 'badge-green',
    Occupied: 'badge-blue', 'In Review': 'badge-blue', Upcoming: 'badge-blue', Scheduled: 'badge-blue',
    'Near Limit': 'badge-yellow', Pending: 'badge-yellow', Maintenance: 'badge-yellow',
    Draft: 'badge-gray', Inactive: 'badge-gray', Returned: 'badge-gray',
    Rejected: 'badge-red', 'Over Limit': 'badge-red', Cancelled: 'badge-red',
  }
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>
}

export function Progress({ value, max = 100, color }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const c = color || (pct >= 100 ? C.danger : pct >= 80 ? C.warning : C.accent)
  return (
    <div className="progress-bar w-full">
      <div className="progress-fill" style={{ width: `${pct}%`, background: c }} />
    </div>
  )
}

export function Modal({ title, onClose, children, size = 'md' }) {
  const w = { sm: 400, md: 520, lg: 680, xl: 860 }
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="animate-fade-in rounded-2xl flex flex-col overflow-hidden"
        style={{ width: w[size], maxWidth: '95vw', maxHeight: '90vh', background: C.surface, border: `1.5px solid ${C.border}`, boxShadow: '0 24px 60px rgba(0,0,0,0.7)' }}>
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: `1.5px solid ${C.borderDim}`, background: C.surface2 }}>
          <h3 className="font-bold text-lg" style={{ color: C.text }}>{title}</h3>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: C.textMuted }}
            onMouseEnter={e => e.currentTarget.style.background = C.surface3}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto p-6" style={{ background: C.surface }}>{children}</div>
      </div>
    </div>
  )
}

export function Table({ headers, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: `2px solid ${C.border}`, background: C.surface2 }}>
            {headers.map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider"
                style={{ color: C.textMuted }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function TR({ children }) {
  return (
    <tr className="table-row" style={{ borderBottom: `1px solid ${C.borderDim}` }}>
      {children}
    </tr>
  )
}

export function TD({ children, className = '' }) {
  return (
    <td className={`px-4 py-3 text-sm ${className}`} style={{ color: C.textSec }}>
      {children}
    </td>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Search...' }) {
  return (
    <input className="input-dark" style={{ maxWidth: 260 }}
      value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
  )
}

export function SectionHeader({ title, sub, action }) {
  const nav = useNavigate()
  return (
    <div className="space-y-3 mb-6">
      {/* Back button row */}
      <button onClick={() => nav(-1)}
        style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:8, border:'1.5px solid var(--border-dim)', background:'var(--surface2)', cursor:'pointer', color:'var(--text-muted)', fontSize:13, fontWeight:600, transition:'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.background='var(--surface3)'; e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--accent)' }}
        onMouseLeave={e => { e.currentTarget.style.background='var(--surface2)'; e.currentTarget.style.borderColor='var(--border-dim)'; e.currentTarget.style.color='var(--text-muted)' }}>
        <ArrowLeft size={14} /> Back
      </button>
      {/* Title + action row */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-bold text-2xl" style={{ color: C.text }}>{title}</h2>
          {sub && <p className="text-sm mt-1" style={{ color: C.textMuted }}>{sub}</p>}
        </div>
        {action}
      </div>
    </div>
  )
}

export function PrimaryBtn({ children, onClick, icon: Icon, small = false, disabled = false, type = 'button', loading = false }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      className={`gradient-btn flex items-center gap-2 font-semibold rounded-xl ${small ? 'px-3 py-1.5 text-xs' : 'px-5 py-2.5 text-sm'}`}>
      {loading ? <Loader2 size={small ? 12 : 14} className="animate-spin" /> : Icon && <Icon size={small ? 13 : 15} />}
      {children}
    </button>
  )
}

export function AccentBtn({ children, onClick, icon: Icon, small = false, disabled = false, type = 'button', loading = false }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      className={`accent-btn flex items-center gap-2 rounded-xl ${small ? 'px-3 py-1.5 text-xs' : 'px-5 py-2.5 text-sm'}`}>
      {loading ? <Loader2 size={small ? 12 : 14} className="animate-spin" /> : Icon && <Icon size={small ? 13 : 15} />}
      {children}
    </button>
  )
}

export function SecondaryBtn({ children, onClick, icon: Icon, small = false, type = 'button' }) {
  return (
    <button type={type} onClick={onClick}
      className={`secondary-btn flex items-center gap-2 font-semibold rounded-xl ${small ? 'px-3 py-1.5 text-xs' : 'px-5 py-2.5 text-sm'}`}>
      {Icon && <Icon size={small ? 13 : 15} />}
      {children}
    </button>
  )
}

export function DangerBtn({ children, onClick, small = false }) {
  return (
    <button onClick={onClick}
      className={`danger-btn flex items-center gap-2 font-semibold rounded-xl ${small ? 'px-3 py-1.5 text-xs' : 'px-5 py-2.5 text-sm'}`}>
      {children}
    </button>
  )
}

export function Label({ children, required }) {
  return (
    <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: C.textMuted }}>
      {children}{required && <span style={{ color: C.danger, marginLeft: 3 }}>*</span>}
    </label>
  )
}

export function FieldError({ msg }) {
  if (!msg) return null
  return (
    <span className="field-error">
      <AlertCircle size={11} /> {msg}
    </span>
  )
}

export function FormFeedback({ type, msg }) {
  if (!msg) return null
  return (
    <div className={type === 'success' ? 'toast-success' : 'toast-error'}
      style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
      {msg}
    </div>
  )
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: C.surface2, border: `1px solid ${C.borderDim}` }}>
      {tabs.map(t => (
        <button key={t.value} onClick={() => onChange(t.value)}
          className={`px-4 py-2 text-sm font-semibold transition-all ${active === t.value ? 'tab-active' : 'tab-inactive'}`}>
          {t.label}
        </button>
      ))}
    </div>
  )
}

export function InfoGrid({ items }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map(([k, v]) => (
        <div key={k} className="rounded-xl p-3" style={{ background: C.surface2, border: `1px solid ${C.borderDim}` }}>
          <p className="text-xs font-semibold mb-1" style={{ color: C.textMuted }}>{k}</p>
          <p className="font-semibold text-sm" style={{ color: C.text }}>{v}</p>
        </div>
      ))}
    </div>
  )
}

export function LoadingSpinner({ msg = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 size={32} style={{ color: C.accent }} className="animate-spin" />
      <p style={{ color: C.textMuted, fontSize: 13 }}>{msg}</p>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: C.surface2, border: `1.5px solid ${C.borderDim}` }}>
          <Icon size={24} style={{ color: C.textMuted }} />
        </div>
      )}
      <p className="font-bold text-base" style={{ color: C.textSec }}>{title}</p>
      {desc && <p style={{ color: C.textMuted, fontSize: 13, maxWidth: 280 }}>{desc}</p>}
      {action}
    </div>
  )
}

export function Toast({ type, msg, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500)
    return () => clearTimeout(t)
  }, [onDismiss])
  return (
    <div className="animate-toast fixed top-5 right-5 z-[9999] max-w-xs"
      style={{ background: C.surface2, border: `1.5px solid ${type === 'success' ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`, borderRadius: 12, padding: '12px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: 10 }}>
      {type === 'success'
        ? <CheckCircle2 size={16} style={{ color: C.success, flexShrink: 0 }} />
        : <AlertCircle size={16} style={{ color: C.danger, flexShrink: 0 }} />}
      <span style={{ fontSize: 13, fontWeight: 600, color: type === 'success' ? C.success : C.danger }}>{msg}</span>
      <button onClick={onDismiss} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, display: 'flex' }}>
        <X size={13} />
      </button>
    </div>
  )
}
