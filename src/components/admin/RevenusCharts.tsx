'use client'

import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { format, subDays } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Commande {
  created_at: string
  frais_livraison: number
  statut: string
}

export default function RevenusCharts({ commandes30j }: { commandes30j: Commande[] }) {
  const chartData = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i)
      const dayStr = format(date, 'yyyy-MM-dd')
      const livrees = commandes30j.filter(c =>
        c.created_at.startsWith(dayStr) && c.statut === 'livre'
      )
      return {
        jour: format(date, 'dd/MM'),
        revenus: livrees.reduce((s, c) => s + c.frais_livraison, 0),
        commandes: livrees.length,
      }
    })
  }, [commandes30j])

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="font-bold text-gray-800 mb-1">Évolution des revenus (30 jours)</h2>
      <p className="text-xs text-gray-400 mb-6">Frais de livraison encaissés par jour</p>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="jour" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} interval={4} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            formatter={(v: number) => [`${v.toLocaleString('fr-FR')} FCFA`, 'Revenus']}
          />
          <Area type="monotone" dataKey="revenus" stroke="#f97316" strokeWidth={2} fill="url(#colorRev)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
