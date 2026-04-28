import { useState } from 'react'
import { Download } from 'lucide-react'
import { Card, SectionHeader, PrimaryBtn, StatCard, Tabs } from '../components/UI'
import { getRooms, getLecturers, bookingTrends, utilizationData, resourceDistribution } from '../store'
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { TrendingUp, BarChart3 } from 'lucide-react'

const C = { surface:'var(--surface)', surface2:'var(--surface2)', border:'var(--border)', borderDim:'var(--border-dim)', accent:'var(--accent)', text:'var(--text-primary)', textMuted:'var(--text-muted)', success:'var(--success)', warning:'var(--warning)', danger:'var(--danger)' }
const PIE_COLORS = ['var(--accent)','var(--border)','#c02448','var(--success)']

const TIP = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return <div style={{ background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:10, padding:'8px 12px' }}>
    <p style={{ color:C.text, fontSize:11, fontWeight:700, marginBottom:4 }}>{label}</p>
    {payload.map(p => <p key={p.name} style={{ color:p.color||C.accent, fontSize:11 }}>{p.name}: {p.value}</p>)}
  </div>
}

const peakHours = [
  { hour:'08:00', load:45 },{ hour:'09:00', load:72 },{ hour:'10:00', load:91 },
  { hour:'11:00', load:88 },{ hour:'12:00', load:55 },{ hour:'13:00', load:62 },
  { hour:'14:00', load:85 },{ hour:'15:00', load:78 },{ hour:'16:00', load:60 },{ hour:'17:00', load:30 },
]
const radarData = [
  { subject:'Classrooms', A:85 },{ subject:'Labs', A:72 },{ subject:'Equipment', A:65 },
  { subject:'Events', A:78 },{ subject:'Workload', A:91 },{ subject:'Compliance', A:94 },
]

export default function Analytics() {
  const [tab, setTab] = useState('overview')
  const rooms     = getRooms()
  const lecturers = getLecturers()
  const roomUtil  = rooms.map(r => ({ name:r.code, utilization:r.utilization, capacity:r.capacity }))

  const exportCSV = (data, name) => {
    const keys = Object.keys(data[0])
    const csv = [keys.join(','), ...data.map(r => keys.map(k => r[k]).join(','))].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type:'text/csv' }))
    a.download = `${name}.csv`; a.click()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader title="Resource Analytics" sub="Comprehensive utilization metrics and accreditation insights"
        action={<PrimaryBtn icon={Download} small onClick={() => exportCSV(rooms.map(r => ({ name:r.name, code:r.code, utilization:r.utilization, status:r.status })), 'room-utilization')}>Export Report</PrimaryBtn>} />

      <Tabs tabs={[{ value:'overview', label:'Overview' },{ value:'utilization', label:'Utilization' },{ value:'workload', label:'Workload' },{ value:'trends', label:'Trends' }]} active={tab} onChange={setTab} />

      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <p style={{ color:C.text, fontWeight:700, fontSize:17, marginBottom:16 }}>Overall Performance Radar</p>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke={C.borderDim} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill:C.textMuted, fontSize:11 }} />
                  <Radar name="Score" dataKey="A" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.2} strokeWidth={2} />
                  <Tooltip content={<TIP />} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <p style={{ color:C.text, fontWeight:700, fontSize:17, marginBottom:16 }}>Resource Distribution</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={resourceDistribution} dataKey="value" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`} labelLine={{ stroke:C.textMuted }}>
                    {resourceDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<TIP />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {resourceDistribution.map((r, i) => (
                  <div key={r.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background:PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-xs" style={{ color:C.textMuted }}>{r.name}: <strong style={{ color:C.text }}>{r.value}</strong></span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <Card>
            <p style={{ color:C.text, fontWeight:700, fontSize:17, marginBottom:16 }}>Peak Hours Analysis</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={peakHours}>
                <defs><linearGradient id="gPeak" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--accent)" stopOpacity={0.35}/><stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.borderDim} />
                <XAxis dataKey="hour" tick={{ fill:C.textMuted, fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0,100]} tick={{ fill:C.textMuted, fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<TIP />} />
                <Area type="monotone" dataKey="load" stroke="var(--accent)" fill="url(#gPeak)" strokeWidth={2} name="Load %" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {tab === 'utilization' && (
        <div className="space-y-4">
          <Card>
            <p style={{ color:C.text, fontWeight:700, fontSize:17, marginBottom:16 }}>Room Utilization Rates</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={roomUtil}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.borderDim} />
                <XAxis dataKey="name" tick={{ fill:C.textMuted, fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0,100]} tick={{ fill:C.textMuted, fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<TIP />} />
                <Bar dataKey="utilization" fill="var(--accent)" radius={[4,4,0,0]} name="Utilization %" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card>
            <p style={{ color:C.text, fontWeight:700, fontSize:17, marginBottom:16 }}>Weekly Utilization by Resource Type</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.borderDim} />
                <XAxis dataKey="day" tick={{ fill:C.textMuted, fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0,100]} tick={{ fill:C.textMuted, fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<TIP />} />
                <Legend wrapperStyle={{ fontSize:11, color:C.textMuted }} />
                <Line type="monotone" dataKey="classrooms" stroke="var(--accent)" strokeWidth={2} dot={{ r:3 }} name="Classrooms" />
                <Line type="monotone" dataKey="labs"       stroke="var(--border)" strokeWidth={2} dot={{ r:3 }} name="Labs" />
                <Line type="monotone" dataKey="equipment"  stroke="#c02448"       strokeWidth={2} dot={{ r:3 }} name="Equipment" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {tab === 'workload' && (
        <div className="space-y-4">
          <Card>
            <p style={{ color:C.text, fontWeight:700, fontSize:17, marginBottom:16 }}>Lecturer Workload vs HEC Limit</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={lecturers.map(l => ({ name:l.name.split(' ').pop(), assigned:l.assigned_hours||0, limit:l.hec_limit, completed:l.completed_hours||0 }))}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.borderDim} />
                <XAxis dataKey="name" tick={{ fill:C.textMuted, fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:C.textMuted, fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<TIP />} />
                <Legend wrapperStyle={{ fontSize:11, color:C.textMuted }} />
                <Bar dataKey="assigned"  fill="var(--accent)" radius={[3,3,0,0]} name="Assigned" />
                <Bar dataKey="completed" fill="var(--success)" radius={[3,3,0,0]} name="Completed" />
                <Bar dataKey="limit"     fill="var(--border)" radius={[3,3,0,0]} name="HEC Limit" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[{ label:'Avg Load', value:'28.5 hrs', color:C.accent },{ label:'HEC Compliant', value:'83%', color:C.success },{ label:'Over Limit', value:'1 lecturer', color:C.danger }].map(s => (
              <Card key={s.label}><p className="text-4xl font-black mb-1" style={{ color:s.color }}>{s.value}</p><p className="text-sm font-semibold" style={{ color:C.textMuted }}>{s.label}</p></Card>
            ))}
          </div>
        </div>
      )}

      {tab === 'trends' && (
        <Card>
          <p style={{ color:C.text, fontWeight:700, fontSize:17, marginBottom:16 }}>Booking Trends (Monthly)</p>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={bookingTrends}>
              <defs>
                <linearGradient id="gT1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/><stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/></linearGradient>
                <linearGradient id="gT2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--success)" stopOpacity={0.3}/><stop offset="95%" stopColor="var(--success)" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.borderDim} />
              <XAxis dataKey="month" tick={{ fill:C.textMuted, fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:C.textMuted, fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TIP />} />
              <Legend wrapperStyle={{ fontSize:11, color:C.textMuted }} />
              <Area type="monotone" dataKey="bookings" stroke="var(--accent)"  fill="url(#gT1)" strokeWidth={2} name="Total Bookings" />
              <Area type="monotone" dataKey="approved" stroke="var(--success)" fill="url(#gT2)" strokeWidth={2} name="Approved" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  )
}
