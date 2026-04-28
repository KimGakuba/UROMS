import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, Eye, EyeOff, AlertCircle, Loader2, Clock, CheckCircle2, ArrowLeft } from 'lucide-react'
import { useAuth } from '../AuthContext'
import { useNavigate } from 'react-router-dom'

const C = {
  bg:'var(--bg)', surface:'var(--surface)', surface2:'var(--surface2)',
  border:'var(--border)', borderDim:'var(--border-dim)',
  accent:'var(--accent)', text:'var(--text-primary)',
  textSec:'var(--text-secondary)', textMuted:'var(--text-muted)',
  danger:'var(--danger)', success:'var(--success)',
}

const ROLES = ['Student','Faculty','Lab Technician','Department Head','Registry']
const DEPARTMENTS = ['Computer Science','Electrical Engineering','Physics','Business','Registry','Administration','Other']

function validate(form) {
  const e = {}
  if (!form.name.trim())   e.name     = 'Full name is required'
  if (!form.email.trim())  e.email    = 'Email address is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address'
  if (!form.password)      e.password = 'Password is required'
  else if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
  if (!form.confirm)       e.confirm  = 'Please confirm your password'
  else if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
  return e
}

// Pending screen shown to non-student roles after registration
function PendingScreen({ name, role }) {
  const nav = useNavigate()
  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:440, textAlign:'center' }}>
        <div style={{ width:72, height:72, borderRadius:20, background:'#fffbeb', border:'2px solid #fde68a', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
          <Clock size={32} color="#b7791f" />
        </div>
        <h2 style={{ fontWeight:900, fontSize:22, color:C.text, margin:'0 0 10px' }}>Account Pending Approval</h2>
        <p style={{ color:C.textMuted, fontSize:15, lineHeight:1.7, margin:'0 0 24px' }}>
          Hi <strong style={{ color:C.text }}>{name}</strong>, your <strong style={{ color:C.text }}>{role}</strong> account request has been submitted.
          <br />The administrator will review and approve your account. You'll be able to log in once approved.
        </p>
        <div style={{ background:'#fffbeb', border:'1.5px solid #fde68a', borderRadius:14, padding:'16px 20px', marginBottom:24, textAlign:'left' }}>
          <p style={{ fontSize:13, fontWeight:700, color:'#92400e', margin:'0 0 8px' }}>What happens next?</p>
          {['Admin reviews your registration request','Account gets approved or rejected','You receive access to log in'].map((s, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <div style={{ width:20, height:20, borderRadius:'50%', background:'#fde68a', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ fontSize:10, fontWeight:700, color:'#92400e' }}>{i+1}</span>
              </div>
              <span style={{ fontSize:13, color:'#92400e' }}>{s}</span>
            </div>
          ))}
        </div>
        <button onClick={() => nav('/login')}
          style={{ padding:'12px 32px', borderRadius:10, border:'none', background:`linear-gradient(135deg,${C.border} 0%,#c02448 100%)`, color:C.text, fontWeight:700, fontSize:14, cursor:'pointer' }}>
          Back to Login
        </button>
      </div>
    </div>
  )
}

export default function Signup() {
  const { register } = useAuth()
  const nav = useNavigate()
  const [form, setForm]       = useState({ name:'', email:'', role:'Student', department:'', password:'', confirm:'' })
  const [showPw, setShowPw]   = useState(false)
  const [errors, setErrors]   = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState(null) // { name, role } when non-student registered

  const set = k => e => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors(ev => ({ ...ev, [k]:'' }))
    setApiError('')
  }

  const submit = async e => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    const err = register(form.name, form.email, form.password, form.role, form.department, 'Main')
    setLoading(false)
    if (err) { setApiError(err); return }
    if (form.role === 'Student') {
      nav('/dashboard')
    } else {
      setPending({ name: form.name, role: form.role })
    }
  }

  if (pending) return <PendingScreen name={pending.name} role={pending.role} />

  const inp = (field, extra = {}) => ({
    value: form[field],
    onChange: set(field),
    style: {
      width:'100%', padding:'12px 14px', borderRadius:10,
      border:`1.5px solid ${errors[field] ? C.danger : C.borderDim}`,
      background:C.surface2, fontSize:14, color:C.text, outline:'none',
      boxSizing:'border-box', fontFamily:'inherit', transition:'border-color 0.2s', ...extra,
    },
    onFocus: ev => { ev.target.style.borderColor = errors[field] ? C.danger : C.accent; ev.target.style.boxShadow = `0 0 0 3px ${errors[field] ? 'rgba(220,38,38,0.12)' : 'rgba(239,137,163,0.15)'}` },
    onBlur:  ev => { ev.target.style.borderColor = errors[field] ? C.danger : C.borderDim; ev.target.style.boxShadow = 'none' },
  })

  const FieldErr = ({ k }) => errors[k] ? (
    <span style={{ display:'flex', alignItems:'center', gap:4, color:C.danger, fontSize:12, marginTop:4 }}>
      <AlertCircle size={11} />{errors[k]}
    </span>
  ) : null

  const isStudent = form.role === 'Student'

  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:460 }}>

        <div style={{ textAlign:'center', marginBottom:32 }}>
          <Link to="/"
            style={{ display:'inline-flex', alignItems:'center', gap:6, marginBottom:16, fontSize:13, fontWeight:600, color:'var(--text-muted)', textDecoration:'none' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
            <div style={{ width:48, height:48, borderRadius:14, background:`linear-gradient(135deg,${C.border} 0%,#c02448 100%)`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(124,23,48,0.4)' }}>
              <GraduationCap size={24} color={C.text} />
            </div>
            <span style={{ fontWeight:900, fontSize:24, color:C.text }}>UROMS</span>
          </div>
          <p style={{ marginTop:10, color:C.textMuted, fontSize:14 }}>Create your account</p>
        </div>

        <div style={{ background:C.surface, border:`1.5px solid ${C.borderDim}`, borderRadius:20, padding:36, boxShadow:'0 8px 32px rgba(0,0,0,0.12)' }}>

          {/* Role notice */}
          {!isStudent && (
            <div style={{ display:'flex', alignItems:'flex-start', gap:10, background:'#fffbeb', border:'1.5px solid #fde68a', borderRadius:10, padding:'10px 14px', marginBottom:20 }}>
              <Clock size={15} color="#b7791f" style={{ flexShrink:0, marginTop:1 }} />
              <p style={{ fontSize:12, color:'#92400e', margin:0, lineHeight:1.5 }}>
                <strong>Staff accounts require admin approval.</strong> After registering, your account will be reviewed before you can log in.
              </p>
            </div>
          )}
          {isStudent && (
            <div style={{ display:'flex', alignItems:'center', gap:10, background:'#f0fdf4', border:'1.5px solid #bbf7d0', borderRadius:10, padding:'10px 14px', marginBottom:20 }}>
              <CheckCircle2 size={15} color="#166534" />
              <p style={{ fontSize:12, color:'#166534', margin:0 }}>Student accounts are activated immediately.</p>
            </div>
          )}

          {apiError && (
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(220,38,38,0.08)', border:'1px solid rgba(220,38,38,0.25)', borderRadius:10, padding:'10px 14px', marginBottom:20 }}>
              <AlertCircle size={15} color={C.danger} />
              <span style={{ fontSize:13, color:C.danger }}>{apiError}</span>
            </div>
          )}

          <form onSubmit={submit} noValidate style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:C.textSec, marginBottom:6 }}>Full Name <span style={{ color:C.danger }}>*</span></label>
              <input placeholder="Dr. Jane Doe" autoComplete="name" {...inp('name')} />
              <FieldErr k="name" />
            </div>

            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:C.textSec, marginBottom:6 }}>Email address <span style={{ color:C.danger }}>*</span></label>
              <input type="email" placeholder="you@uroms.ac" autoComplete="email" {...inp('email')} />
              <FieldErr k="email" />
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:C.textSec, marginBottom:6 }}>Role</label>
                <select {...inp('role', { cursor:'pointer' })}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:C.textSec, marginBottom:6 }}>Department</label>
                <select {...inp('department', { cursor:'pointer' })}>
                  <option value="">— Select —</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:C.textSec, marginBottom:6 }}>Password <span style={{ color:C.danger }}>*</span></label>
              <div style={{ position:'relative' }}>
                <input type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters" autoComplete="new-password"
                  {...inp('password', { paddingRight:44 })} />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:C.textMuted, display:'flex' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <FieldErr k="password" />
            </div>

            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:C.textSec, marginBottom:6 }}>Confirm Password <span style={{ color:C.danger }}>*</span></label>
              <input type="password" placeholder="Repeat password" autoComplete="new-password" {...inp('confirm')} />
              <FieldErr k="confirm" />
            </div>

            <button type="submit" disabled={loading}
              style={{ padding:'13px', borderRadius:10, border:'none', background:loading ? C.borderDim : `linear-gradient(135deg,${C.border} 0%,#c02448 100%)`, color:C.text, fontWeight:700, fontSize:15, cursor:loading ? 'not-allowed':'pointer', marginTop:4, display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:loading ? 'none':'0 4px 14px rgba(124,23,48,0.4)' }}>
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Creating account…' : isStudent ? 'Create Account' : 'Submit Registration Request'}
            </button>
          </form>
        </div>

        <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:C.textMuted }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:C.accent, fontWeight:700, textDecoration:'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
