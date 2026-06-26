'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { format, subDays } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Commande {
  created_at: string
  frais_livraison: number
  statut: string
}

export default function DashboardCharts({ commandes7j }: { commandes7j: Commande[] }) {
  const chartData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i)
      const dayStr = format(date, 'yyyy-MM-dd')
      const dayCommandes = commandes7j.filter(c =>
        c.created_at.startsWith(dayStr)
      )
      const livrees = dayCommandes.filter(c => c.statut === 'livre')
      return {
        jour: format(date, 'EEE', { locale: fr }),
        commandes: dayCommandes.length,
        revenus: livrees.reduce((s, c) => s + c.frais_livraison, 0),
      }
    })
  }, [commandes7j])

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-bold text-gray-800 mb-1">Commandes (7 jours)</h2>
        <p className="text-xs text-gray-400 mb-4">Nombre de commandes par jour</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="jour" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              formatter={(v: number) => [`${v} commande(s)`, 'Commandes']}
            />
            <Bar dataKey="commandes" fill="#f97316" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-bold text-gray-800 mb-1">Revenus (7 jours)</h2>
        <p className="text-xs text-gray-400 mb-4">Frais de livraison encaissés (FCFA)</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="jour" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              formatter={(v: number) => [`${v.toLocaleString('fr-FR')} FCFA`, 'Revenus']}
            />
            <Bar dataKey="revenus" fill="#22c55e" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
