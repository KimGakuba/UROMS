import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { Building2, FlaskConical, BookMarked, Cpu, CalendarDays, Users, TrendingUp, CheckCircle, AlertTriangle, Activity } from 'lucide-react'
import { StatCard, Card } from '../components/UI'
import { getStats, bookingTrends, resourceDistribution, utilizationData } from '../store'
import { recentActivity } from '../data'

const C = { surface:'var(--surface)', surface2:'var(--surface2)', border:'var(--border)', borderDim:'var(--border-dim)', accent:'var(--accent)', text:'var(--text-primary)', textMuted:'var(--text-muted)', success:'var(--success)', warning:'var(--warning)', danger:'var(--danger)' }
const PIE_COLORS = ['var(--accent)','var(--border)','#c02448','var(--success)']
const activityIcon  = { success:CheckCircle, warning:AlertTriangle, info:Activity, error:AlertTriangle }
const activityColor = { success:C.success, warning:C.warning, info:C.accent, error:C.danger }

const TIP = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:10, padding:'8px 12px' }}>
      <p style={{ color:C.text, fontSize:11, fontWeight:700, marginBottom:4 }}>{label}</p>
      {payload.map(p => <p key={p.name} style={{ color:p.color, fontSize:11 }}>{p.name}: {p.value}</p>)}
    </div>
  )
}

export default function Dashboard() {
  const nav = useNavigate()
  const [s] = useState(() => getStats())

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Back button + title */}
      <div className="space-y-3 mb-2">
        <button onClick={() => nav(-1)}
          style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:8, border:'1.5px solid var(--border-dim)', background:'var(--surface2)', cursor:'pointer', color:'var(--text-muted)', fontSize:13, fontWeight:600, transition:'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background='var(--surface3)'; e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--accent)' }}
          onMouseLeave={e => { e.currentTarget.style.background='var(--surface2)'; e.currentTarget.style.borderColor='var(--border-dim)'; e.currentTarget.style.color='var(--text-muted)' }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div>
          <h2 className="font-bold text-2xl" style={{ color:'var(--text-primary)' }}>Dashboard</h2>
          <p className="text-sm mt-0.5" style={{ color:'var(--text-muted)' }}>Overview of university resources</p>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Rooms"     value={s.totalRooms}                      sub="Across all campuses"           icon={Building2}   color={C.accent}  delay="0s" />
        <StatCard title="Active Bookings" value={s.activeBookings}                  sub={`${s.pendingApprovals} pending`} icon={CalendarDays} color={C.accent} delay="0.05s" />
        <StatCard title="Lecturers"       value={s.totalLecturers}                  sub="HEC monitored"                 icon={BookMarked}  color={C.accent}  delay="0.1s" />
        <StatCard title="Students"        value={s.totalStudents.toLocaleString()}  sub="Enrolled"                      icon={Users}       color={C.accent}  delay="0.15s" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Labs"          value={s.totalLabs}           sub="Scheduled & bookable" icon={FlaskConical} color={C.warning} delay="0.2s" />
        <StatCard title="Equipment"     value={s.equipmentItems}      sub="Items tracked"         icon={Cpu}          color={C.warning} delay="0.25s" />
        <StatCard title="Utilization"   value={`${s.utilizationRate}%`} sub="Average this month"  icon={TrendingUp}   color={C.accent}  delay="0.3s" />
        <StatCard title="HEC Compliant" value={`${s.hecCompliant}%`}  sub="Workload compliance"   icon={CheckCircle}  color={C.success} delay="0.35s" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <p style={{ color:C.text, fontWeight:700, fontSize:17, marginBottom:16 }}>Booking Trends</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={bookingTrends}>
              <defs>
                <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/><stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/></linearGradient>
                <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--border)" stopOpacity={0.4}/><stop offset="95%" stopColor="var(--border)" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.borderDim} />
              <XAxis dataKey="month" tick={{ fill:C.textMuted, fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:C.textMuted, fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TIP />} />
              <Legend wrapperStyle={{ fontSize:11, color:C.textMuted }} />
              <Area type="monotone" dataKey="bookings" stroke="var(--border)" fill="url(#gB)" strokeWidth={2} name="Total" />
              <Area type="monotone" dataKey="approved" stroke="var(--accent)" fill="url(#gA)" strokeWidth={2} name="Approved" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <p style={{ color:C.text, fontWeight:700, fontSize:17, marginBottom:16 }}>Resource Distribution</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={resourceDistribution} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70}>
                {resourceDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<TIP />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {resourceDistribution.map((r, i) => (
              <div key={r.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background:PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span style={{ color:C.textMuted, fontSize:12 }}>{r.name}</span>
                </div>
                <span style={{ color:C.text, fontSize:12, fontWeight:700 }}>{r.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <p style={{ color:C.text, fontWeight:700, fontSize:17, marginBottom:16 }}>Weekly Utilization (%)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={utilizationData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.borderDim} />
              <XAxis dataKey="day" tick={{ fill:C.textMuted, fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0,100]} tick={{ fill:C.textMuted, fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TIP />} />
              <Legend wrapperStyle={{ fontSize:11, color:C.textMuted }} />
              <Bar dataKey="classrooms" fill="var(--border)" radius={[3,3,0,0]} name="Classrooms" />
              <Bar dataKey="labs"       fill="var(--accent)" radius={[3,3,0,0]} name="Labs" />
              <Bar dataKey="equipment"  fill="#c02448"       radius={[3,3,0,0]} name="Equipment" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <p style={{ color:C.text, fontWeight:700, fontSize:17, marginBottom:16 }}>Recent Activity</p>
          <div className="space-y-3">
            {recentActivity.map(a => {
              const Icon = activityIcon[a.type]
              return (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background:'var(--surface2)' }}>
                    <Icon size={13} style={{ color:activityColor[a.type] }} />
                  </div>
                  <div className="min-w-0">
                    <p style={{ color:C.text, fontSize:12, fontWeight:700 }}>{a.action}</p>
                    <p className="truncate" style={{ color:C.textMuted, fontSize:11 }}>{a.detail}</p>
                    <p style={{ color:C.textMuted, fontSize:11, marginTop:2 }}>{a.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
