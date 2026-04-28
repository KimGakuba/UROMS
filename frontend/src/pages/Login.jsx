import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { GraduationCap, Eye, EyeOff, AlertCircle, Loader2, ArrowLeft } from 'lucide-react'
import { useAuth } from '../AuthContext'

const C = {
  bg:'var(--bg)', surface:'var(--surface)', surface2:'var(--surface2)',
  border:'var(--border)', borderDim:'var(--border-dim)',
  accent:'var(--accent)', text:'var(--text-primary)',
  textSec:'var(--text-secondary)', textMuted:'var(--text-muted)',
  danger:'var(--danger)',
}

function validate(form) {
  const e = {}
  if (!form.email.trim()) e.email = 'Email address is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address'
  if (!form.password) e.password = 'Password is required'
  return e
}

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [form, setForm]       = useState({ email:'', password:'' })
  const [showPw, setShowPw]   = useState(false)
  const [errors, setErrors]   = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

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
    const err = login(form.email, form.password)
    setLoading(false)
    if (err) setApiError(err)
    else nav('/dashboard')
  }

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

  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:420 }}>

        <div style={{ textAlign:'center', marginBottom:36 }}>
          <Link to="/"
            style={{ display:'inline-flex', alignItems:'center', gap:6, marginBottom:16, fontSize:13, fontWeight:600, color:C.textMuted, textDecoration:'none' }}
            onMouseEnter={e => e.currentTarget.style.color = C.accent}
            onMouseLeave={e => e.currentTarget.style.color = C.textMuted}>
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
            <div style={{ width:48, height:48, borderRadius:14, background:`linear-gradient(135deg,${C.border} 0%,#c02448 100%)`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(124,23,48,0.4)' }}>
              <GraduationCap size={24} color={C.text} />
            </div>
            <span style={{ fontWeight:900, fontSize:24, color:C.text }}>UROMS</span>
          </div>
          <p style={{ marginTop:10, color:C.textMuted, fontSize:14 }}>Sign in to your account</p>
        </div>

        <div style={{ background:C.surface, border:`1.5px solid ${C.borderDim}`, borderRadius:20, padding:36, boxShadow:'0 8px 32px rgba(0,0,0,0.12)' }}>

          {apiError && (
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(220,38,38,0.08)', border:'1px solid rgba(220,38,38,0.25)', borderRadius:10, padding:'10px 14px', marginBottom:20 }}>
              <AlertCircle size={15} color={C.danger} />
              <span style={{ fontSize:13, color:C.danger }}>{apiError}</span>
            </div>
          )}

          <form onSubmit={submit} noValidate style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:C.textSec, marginBottom:6 }}>
                Email address <span style={{ color:C.danger }}>*</span>
              </label>
              <input type="email" placeholder="you@uroms.ac" autoComplete="email" {...inp('email')} />
              {errors.email && (
                <span style={{ display:'flex', alignItems:'center', gap:4, color:C.danger, fontSize:12, marginTop:4 }}>
                  <AlertCircle size={11} />{errors.email}
                </span>
              )}
            </div>

            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:C.textSec, marginBottom:6 }}>
                Password <span style={{ color:C.danger }}>*</span>
              </label>
              <div style={{ position:'relative' }}>
                <input type={showPw ? 'text' : 'password'} placeholder="••••••••" autoComplete="current-password"
                  {...inp('password', { paddingRight:44 })} />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:C.textMuted, display:'flex' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <span style={{ display:'flex', alignItems:'center', gap:4, color:C.danger, fontSize:12, marginTop:4 }}>
                  <AlertCircle size={11} />{errors.password}
                </span>
              )}
            </div>

            <button type="submit" disabled={loading}
              style={{ padding:'13px', borderRadius:10, border:'none', background:loading ? C.borderDim : `linear-gradient(135deg,${C.border} 0%,#c02448 100%)`, color:C.text, fontWeight:700, fontSize:15, cursor:loading ? 'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:loading ? 'none':'0 4px 14px rgba(124,23,48,0.4)' }}>
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Admin-only hint */}
          <div style={{ marginTop:20, padding:'10px 14px', background:C.surface2, borderRadius:10, border:`1px solid ${C.borderDim}` }}>
            <p style={{ fontSize:12, color:C.textMuted, margin:0 }}>
              <span style={{ fontWeight:700, color:C.textSec }}>Admin: </span>
              admin@uroms.ac · admin123
            </p>
          </div>
        </div>

        <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:C.textMuted }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color:C.accent, fontWeight:700, textDecoration:'none' }}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}
