import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend, ResponsiveContainer } from 'recharts'
import { Download, Users, BookOpen, Star, TrendingUp, Lock } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import mentorsData from '../data/mentors.json'

const STAFF_PASSWORD = import.meta.env.VITE_STAFF_PASSWORD
const COLORS = ['#f97316', '#7c3aed', '#10b981', '#3b82f6', '#ec4899', '#f59e0b', '#6366f1']

interface ParticipantRow {
  id: string
  name: string
  startup_name: string
  email: string
  diagnostic: Record<string, string> | null
  created_at: string
  selected_mentors: string[]
}

interface BookingCount { mentor_id: number; count: number }
interface TopicCount { name: string; value: number; fill: string }

export function StaffPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [participants, setParticipants] = useState<ParticipantRow[]>([])
  const [bookingCounts, setBookingCounts] = useState<BookingCount[]>([])
  const [topicCounts, setTopicCounts] = useState<TopicCount[]>([])
  const [feedbackStats, setFeedbackStats] = useState({ avg: 0, count: 0 })
  const [loading, setLoading] = useState(false)

  function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    if (pw === STAFF_PASSWORD) setAuthed(true)
    else setPw('')
  }

  useEffect(() => {
    if (!authed) return
    setLoading(true)

    async function load() {
      // Participants with their bookings
      const { data: ps } = await supabase
        .from('participants')
        .select('id, name, startup_name, email, diagnostic, created_at')
        .order('created_at', { ascending: false })

      const { data: bs } = await supabase
        .from('bookings')
        .select('participant_id, mentor_id, topics')

      const { data: fs } = await supabase
        .from('feedback')
        .select('rating')

      const mentorNameMap = Object.fromEntries(mentorsData.map(m => [m.id, m.name]))
      const bookingsByPart: Record<string, string[]> = {}
      const countByMentor: Record<number, number> = {}
      const countByTopic: Record<string, number> = {}

      for (const b of bs ?? []) {
        bookingsByPart[b.participant_id] = [...(bookingsByPart[b.participant_id] ?? []), mentorNameMap[b.mentor_id] ?? 'Desconocido']
        countByMentor[b.mentor_id] = (countByMentor[b.mentor_id] ?? 0) + 1
        for (const t of b.topics ?? []) countByTopic[t] = (countByTopic[t] ?? 0) + 1
      }

      setParticipants((ps ?? []).map(p => ({ ...p, selected_mentors: bookingsByPart[p.id] ?? [] })))
      setBookingCounts(
        Object.entries(countByMentor)
          .map(([mentor_id, count]) => ({ mentor_id: Number(mentor_id), count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
      )
      setTopicCounts(
        Object.entries(countByTopic)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 12)
          .map(([name, value], i) => ({ name, value, fill: COLORS[i % COLORS.length] }))
      )

      const ratings = (fs ?? []).map(f => f.rating)
      setFeedbackStats({
        avg: ratings.length ? +(ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1) : 0,
        count: ratings.length,
      })

      setLoading(false)
    }

    load()
  }, [authed])

  function exportCSV() {
    const header = 'Nombre,Emprendimiento,Email,Mentores,Fecha\n'
    const rows = participants.map(p =>
      `"${p.name}","${p.startup_name}","${p.email}","${p.selected_mentors.join(' | ')}","${new Date(p.created_at).toLocaleDateString('es-AR')}"`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'emprending-participantes.csv'; a.click()
  }

  const barData = bookingCounts.map(bc => ({
    name: mentorsData.find(m => m.id === bc.mentor_id)?.name.split(' ')[0] ?? `#${bc.mentor_id}`,
    reservas: bc.count,
  }))

  const stageLabels: Record<string, string> = { idea: 'Idea', mvp: 'MVP', growth: 'Crecimiento', company: 'Empresa' }
  const problemLabels: Record<string, string> = { sales: 'Ventas', financing: 'Financiamiento', team: 'Equipo', product: 'Producto', legal: 'Legales', marketing: 'Marketing', scale: 'Expansión' }
  const sectorLabels: Record<string, string> = { gastronomy: 'Gastronomía', tech: 'Tecnología', services: 'Servicios prof.', manufacturing: 'Prod. físicos', other: 'Otro' }

  const stageData = Object.entries(stageLabels).map(([k, label]) => ({
    name: label,
    value: participants.filter(p => p.diagnostic?.stage === k).length,
  })).filter(d => d.value > 0)

  const problemData = Object.entries(problemLabels).map(([k, label]) => ({
    name: label,
    value: participants.filter(p => p.diagnostic?.problem === k).length,
  })).filter(d => d.value > 0)

  const sectorData = Object.entries(sectorLabels).map(([k, label], i) => ({
    name: label,
    value: participants.filter(p => p.diagnostic?.sector === k).length,
    fill: COLORS[i % COLORS.length],
  })).filter(d => d.value > 0)

  if (!authed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#f97316] flex items-center justify-center">
              <span className="text-white font-black text-xl">E.</span>
            </div>
            <div>
              <div className="text-white font-bold">Staff Dashboard</div>
              <div className="text-gray-500 text-xs">Emprending Hub 2026</div>
            </div>
          </div>
          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                <Lock size={14} /> Contraseña de acceso
              </label>
              <input
                type="password"
                value={pw}
                onChange={e => setPw(e.target.value)}
                placeholder="Ingresá la contraseña"
                autoFocus
                className="bg-[#12121f] border border-[#1e1e35] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-[#f97316]/40 transition-colors"
              />
            </div>
            <button type="submit" className="bg-[#f97316] text-white font-bold py-3 rounded-xl hover:bg-[#ea6c0c] transition-colors">
              Entrar
            </button>
          </form>
        </div>
      </div>
    )
  }

  const totalBookings = participants.reduce((s, p) => s + p.selected_mentors.length, 0)
  const avgMentors = participants.length ? (totalBookings / participants.length).toFixed(1) : '0'

  return (
    <div className="min-h-screen px-4 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Staff Dashboard</h1>
          <p className="text-gray-500 text-sm">Emprending Hub 2026</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 bg-[#12121f] border border-[#1e1e35] text-gray-300 text-sm px-4 py-2 rounded-xl hover:border-[#f97316]/40 hover:text-white transition-all">
          <Download size={15} /> Exportar CSV
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { icon: <Users size={20} />, label: 'Participantes', value: participants.length },
          { icon: <BookOpen size={20} />, label: 'Reservas totales', value: totalBookings },
          { icon: <TrendingUp size={20} />, label: 'Promedio tutores', value: avgMentors },
          { icon: <Star size={20} />, label: `Satisfacción (${feedbackStats.count})`, value: feedbackStats.avg ? `${feedbackStats.avg}★` : 'N/A' },
        ].map(k => (
          <div key={k.label} className="bg-[#12121f] border border-[#1e1e35] rounded-2xl p-4 flex flex-col gap-2">
            <div className="text-[#f97316]">{k.icon}</div>
            <div className="text-2xl font-black text-white">{k.value}</div>
            <div className="text-gray-500 text-xs">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {/* Top mentors */}
        <div className="bg-[#12121f] border border-[#1e1e35] rounded-2xl p-4">
          <h3 className="text-white font-semibold text-sm mb-4">Top 10 mentores más solicitados</h3>
          {barData.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-8">Sin datos aún</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ left: -20 }}>
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: 8, color: '#fff' }} />
                <Bar dataKey="reservas" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Stage distribution */}
        <div className="bg-[#12121f] border border-[#1e1e35] rounded-2xl p-4">
          <h3 className="text-white font-semibold text-sm mb-4">Etapa del emprendimiento</h3>
          {stageData.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-8">Sin datos aún</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stageData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                  {stageData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: 8, color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Problem distribution */}
        <div className="bg-[#12121f] border border-[#1e1e35] rounded-2xl p-4 sm:col-span-2">
          <h3 className="text-white font-semibold text-sm mb-4">Principal problema declarado</h3>
          {problemData.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-8">Sin datos aún</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={problemData} margin={{ left: -20 }}>
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: 8, color: '#fff' }} />
                <Bar dataKey="value" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Sector / Rubro — radial wheel */}
        <div className="bg-[#12121f] border border-[#1e1e35] rounded-2xl p-4">
          <h3 className="text-white font-semibold text-sm mb-1">Rubro del emprendimiento</h3>
          <p className="text-gray-600 text-xs mb-3">Gira según cuántos hay en cada sector</p>
          {sectorData.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-8">Sin datos aún</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <RadialBarChart
                cx="50%" cy="50%"
                innerRadius="20%"
                outerRadius="90%"
                data={sectorData}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  dataKey="value"
                  background={{ fill: '#1e1e35' }}
                  cornerRadius={6}
                />
                <Legend
                  iconSize={8}
                  formatter={(value) => <span style={{ color: '#9ca3af', fontSize: 11 }}>{value}</span>}
                />
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: 8, color: '#fff', fontSize: 12 }}
                  formatter={(v) => { const n = Number(v); return [`${n} emprendimiento${n !== 1 ? 's' : ''}`, ''] }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Topics requested */}
        <div className="bg-[#12121f] border border-[#1e1e35] rounded-2xl p-4">
          <h3 className="text-white font-semibold text-sm mb-1">Temas más solicitados</h3>
          <p className="text-gray-600 text-xs mb-3">Lo que los participantes quieren hablar con sus tutores</p>
          {topicCounts.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-8">Sin datos aún</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topicCounts} layout="vertical" margin={{ left: 0, right: 16 }}>
                <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 9 }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#9ca3af', fontSize: 9 }}
                  width={130}
                  tickFormatter={v => v.length > 22 ? v.slice(0, 20) + '…' : v}
                />
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: 8, color: '#fff', fontSize: 12 }}
                  formatter={(v) => { const n = Number(v); return [`${n} solicitud${n !== 1 ? 'es' : ''}`, ''] }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {topicCounts.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Participants table */}
      <div className="bg-[#12121f] border border-[#1e1e35] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e1e35] flex items-center justify-between">
          <span className="text-white font-semibold text-sm">Participantes registrados</span>
          <span className="text-gray-500 text-xs">{participants.length} total</span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-600 text-sm">Cargando...</div>
        ) : participants.length === 0 ? (
          <div className="p-8 text-center text-gray-600 text-sm">Sin registros aún</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e1e35]">
                  {['Nombre', 'Emprendimiento', 'Email', 'Tutores elegidos', 'Fecha'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-gray-500 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {participants.map((p, i) => (
                  <tr key={p.id} className={i % 2 === 0 ? '' : 'bg-[#0f0f1a]'}>
                    <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{p.name}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{p.startup_name}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{p.email}</td>
                    <td className="px-4 py-3 text-gray-400 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {p.selected_mentors.map(mn => (
                          <span key={mn} className="text-xs bg-[#1a1000] text-[#f97316] border border-[#f97316]/20 px-1.5 py-0.5 rounded-full whitespace-nowrap">{mn}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{new Date(p.created_at).toLocaleDateString('es-AR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
