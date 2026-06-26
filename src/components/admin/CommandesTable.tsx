'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { STATUT_LABELS, STATUT_COLORS, PAIEMENT_LABELS } from '@/lib/supabase/types'
import type { CommandeAvecRelations, StatutCommande } from '@/lib/supabase/types'
import Link from 'next/link'
import clsx from 'clsx'

const STATUTS: { value: StatutCommande | 'tous'; label: string }[] = [
  { value: 'tous', label: 'Toutes' },
  { value: 'nouveau', label: 'Nouvelles' },
  { value: 'confirme', label: 'Confirmées' },
  { value: 'en_preparation', label: 'En prép.' },
  { value: 'en_livraison', label: 'En livraison' },
  { value: 'livre', label: 'Livrées' },
  { value: 'annule', label: 'Annulées' },
]

export default function CommandesTable({ commandes: initial }: { commandes: CommandeAvecRelations[] }) {
  const [commandes, setCommandes] = useState<CommandeAvecRelations[]>(initial)
  const [filtre, setFiltre] = useState<StatutCommande | 'tous'>('tous')
  const [newIds, setNewIds] = useState<Set<string>>(new Set())
  const router = useRouter()
  const supabase = createClient()

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('commandes-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'commandes' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newCommande = payload.new as CommandeAvecRelations
            setCommandes(prev => [newCommande, ...prev])
            setNewIds(prev => new Set([...prev, newCommande.id]))
            // Alerte sonore
            try {
              const ctx = new AudioContext()
              const osc = ctx.createOscillator()
              osc.connect(ctx.destination)
              osc.frequency.value = 880
              osc.start()
              osc.stop(ctx.currentTime + 0.3)
            } catch {}
            // Retirer le highlight après 5s
            setTimeout(() => {
              setNewIds(prev => {
                const next = new Set(prev)
                next.delete(newCommande.id)
                return next
              })
            }, 5000)
          } else if (payload.eventType === 'UPDATE') {
            setCommandes(prev =>
              prev.map(c => c.id === payload.new.id ? { ...c, ...payload.new } : c)
            )
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  const filtered = filtre === 'tous'
    ? commandes
    : commandes.filter(c => c.statut === filtre)

  return (
    <div>
      {/* Filtres */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {STATUTS.map(s => (
          <button
            key={s.value}
            onClick={() => setFiltre(s.value)}
            className={clsx(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              filtre === s.value
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-orange-50'
            )}
          >
            {s.label}
            {s.value !== 'tous' && (
              <span className="ml-1 text-xs opacity-70">
                ({commandes.filter(c => c.statut === s.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table desktop */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">N°</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Client</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Plat</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Restaurant</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Montant</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Paiement</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Statut</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Heure</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400">
                  Aucune commande
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => router.push(`/admin/commandes/${c.id}`)}
                  className={clsx(
                    'hover:bg-orange-50 cursor-pointer transition-colors',
                    newIds.has(c.id) && 'nouvelle-commande bg-orange-50'
                  )}
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.numero}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{c.client_nom || '—'}</p>
                    <p className="text-gray-400 text-xs">{c.client_telephone}</p>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{c.plat_nom}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {(c.restaurants as any)?.nom || '—'}
                  </td>
                  <td className="px-4 py-3 font-bold text-orange-600">
                    {c.montant_total.toLocaleString('fr-FR')} F
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'text-xs px-2 py-0.5 rounded-full',
                      c.statut_paiement === 'recu'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    )}>
                      {c.statut_paiement === 'recu' ? '✓ Payé' : PAIEMENT_LABELS[c.mode_paiement]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUT_COLORS[c.statut]}`}>
                      {STATUT_LABELS[c.statut]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {format(new Date(c.created_at), 'HH:mm', { locale: fr })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Cards mobile */}
      <div className="md:hidden space-y-3 pb-20">
        {filtered.map((c) => (
          <Link
            key={c.id}
            href={`/admin/commandes/${c.id}`}
            className={clsx(
              'block bg-white rounded-2xl border border-gray-200 p-4',
              newIds.has(c.id) && 'nouvelle-commande'
            )}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-mono text-xs text-gray-400">{c.numero}</span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUT_COLORS[c.statut]}`}>
                {STATUT_LABELS[c.statut]}
              </span>
            </div>
            <p className="font-bold text-gray-900">{c.plat_nom}</p>
            <p className="text-sm text-gray-500">{c.client_nom} · {c.client_telephone}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="font-bold text-orange-600">{c.montant_total.toLocaleString('fr-FR')} FCFA</span>
              <span className="text-xs text-gray-400">
                {format(new Date(c.created_at), 'HH:mm')}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
