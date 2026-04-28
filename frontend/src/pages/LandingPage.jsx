import { useNavigate } from 'react-router-dom'
import {
  GraduationCap, Building2, FlaskConical, BarChart3,
  Users, Cpu, CalendarDays, BookMarked, ArrowRight, CheckCircle2, Shield
} from 'lucide-react'

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

const features = [
  { icon: Building2,    title: 'Classroom Management',  desc: 'Book and manage lecture halls, seminar rooms, and study spaces in real time.' },
  { icon: FlaskConical, title: 'Laboratory Scheduling',  desc: 'Coordinate lab sessions, equipment usage, and maintenance schedules.' },
  { icon: BookMarked,   title: 'Faculty Workloads',      desc: 'Track teaching hours, research duties, and HEC compliance automatically.' },
  { icon: Cpu,          title: 'Equipment Tracking',     desc: 'Monitor assets, maintenance cycles, and procurement requests.' },
  { icon: CalendarDays, title: 'Events & Timetables',    desc: 'Plan university events, exams, and academic calendars seamlessly.' },
  { icon: BarChart3,    title: 'Analytics & Reports',    desc: 'Data-driven insights on resource utilisation and operational efficiency.' },
]

const stats = [
  { value: '50+',  label: 'Universities' },
  { value: '12K+', label: 'Rooms Managed' },
  { value: '98%',  label: 'Uptime' },
  { value: '4.9★', label: 'Rating' },
]

export default function LandingPage() {
  const nav = useNavigate()

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: C.text }}>

      {/* ── Navbar ── */}
      <nav style={{ background: C.surface, borderBottom: `1px solid ${C.borderDim}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${C.border} 0%, #c02448 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={18} color={C.text} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 18, color: C.text }}>UROMS</span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
            <button onClick={() => nav('/login')}
              style={{ padding: '8px 20px', borderRadius: 8, border: `1.5px solid ${C.borderDim}`, background: 'transparent', color: C.textSec, fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accent }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.borderDim; e.currentTarget.style.color = C.textSec }}>
              Log In
            </button>
            <button onClick={() => nav('/signup')}
              style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: `linear-gradient(135deg, ${C.border} 0%, #c02448 100%)`, color: C.text, fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: `0 2px 8px rgba(124,23,48,0.4)`, transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,23,48,0.6)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(124,23,48,0.4)'}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 24px 70px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.surface2, border: `1px solid ${C.borderDim}`, borderRadius: 20, padding: '6px 16px', marginBottom: 32 }}>
          <Shield size={14} color={C.accent} />
          <span style={{ fontSize: 13, fontWeight: 600, color: C.accent }}>Trusted by 50+ universities across Africa</span>
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900, lineHeight: 1.05, color: C.text, margin: '0 0 24px' }}>
          University Resource<br />
          <span style={{ background: `linear-gradient(135deg, ${C.accent} 0%, #f5b0c4 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Operations Management
          </span>
        </h1>
        <p style={{ fontSize: 18, color: C.textSec, maxWidth: 560, margin: '0 auto 44px', lineHeight: 1.75 }}>
          One platform to manage classrooms, labs, faculty workloads, equipment, and events — built for modern universities.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => nav('/signup')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '15px 36px', borderRadius: 12, border: 'none', background: C.accent, color: C.bg, fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 4px 16px rgba(239,137,163,0.35)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = C.accentDim; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.transform = '' }}>
            Start Free Trial <ArrowRight size={16} />
          </button>
          <button onClick={() => nav('/login')}
            style={{ padding: '15px 36px', borderRadius: 12, border: `2px solid ${C.borderDim}`, background: C.surface, color: C.textSec, fontWeight: 700, fontSize: 16, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accent }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.borderDim; e.currentTarget.style.color = C.textSec }}>
            Sign In to Dashboard
          </button>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ background: C.surface, borderTop: `1px solid ${C.borderDim}`, borderBottom: `1px solid ${C.borderDim}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '44px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 24, textAlign: 'center' }}>
          {stats.map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 40, fontWeight: 900, background: `linear-gradient(135deg, ${C.accent} 0%, #f5b0c4 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.value}</div>
              <div style={{ fontSize: 14, color: C.textMuted, fontWeight: 600, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: C.text, margin: '0 0 12px' }}>Everything your university needs</h2>
          <p style={{ fontSize: 16, color: C.textMuted }}>Integrated modules that work together seamlessly</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ background: C.surface, border: `1.5px solid ${C.borderDim}`, borderRadius: 16, padding: 28, transition: 'all 0.2s', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(124,23,48,0.3)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.borderDim; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: C.surface2, border: `1.5px solid ${C.borderDim}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Icon size={20} color={C.accent} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>{title}</h3>
              <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.65, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: C.surface, borderTop: `1px solid ${C.borderDim}`, padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.surface2, border: `1px solid ${C.borderDim}`, borderRadius: 20, padding: '6px 16px', marginBottom: 24 }}>
          <CheckCircle2 size={14} color={C.accent} />
          <span style={{ fontSize: 13, fontWeight: 600, color: C.accent }}>No credit card required</span>
        </div>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: C.text, margin: '0 0 16px' }}>Ready to transform your campus?</h2>
        <p style={{ fontSize: 16, color: C.textMuted, marginBottom: 36 }}>Join hundreds of institutions already using UROMS</p>
        <button onClick={() => nav('/signup')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 44px', borderRadius: 12, border: 'none', background: C.accent, color: C.bg, fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 4px 16px rgba(239,137,163,0.35)', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = C.accentDim; e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.transform = '' }}>
          Create Free Account <ArrowRight size={16} />
        </button>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: C.bg, borderTop: `1px solid ${C.borderDim}`, padding: '24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${C.border} 0%, #c02448 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={14} color={C.text} />
          </div>
          <span style={{ fontWeight: 700, color: C.text }}>UROMS</span>
        </div>
        <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>© {new Date().getFullYear()} University Resource &amp; Operations Management System</p>
      </footer>
    </div>
  )
}
