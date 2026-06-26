'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { STATUT_LABELS, STATUT_COLORS } from '@/lib/supabase/types'
import type { StatutCommande } from '@/lib/supabase/types'
import clsx from 'clsx'

const SEQUENCE: StatutCommande[] = [
  'nouveau', 'confirme', 'en_preparation', 'en_livraison', 'livre'
]

export default function StatutUpdater({
  commandeId,
  statutActuel,
}: {
  commandeId: string
  statutActuel: StatutCommande
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function updateStatut(newStatut: StatutCommande) {
    setLoading(true)
    try {
      const res = await fetch(`/api/commandes/${commandeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: newStatut }),
      })
      if (!res.ok) throw new Error('Erreur mise à jour')
      toast.success(`Statut → ${STATUT_LABELS[newStatut]}`)
      router.refresh()
    } catch {
      toast.error('Impossible de mettre à jour le statut')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Barre de progression */}
      <div className="flex items-center gap-1">
        {SEQUENCE.map((s, i) => {
          const currentIdx = SEQUENCE.indexOf(statutActuel as StatutCommande)
          const isDone = SEQUENCE.indexOf(s) <= currentIdx
          return (
            <div key={s} className="flex items-center gap-1 flex-1">
              <div className={clsx(
                'h-2 rounded-full flex-1 transition-all',
                isDone ? 'bg-orange-500' : 'bg-gray-200'
              )} />
              {i < SEQUENCE.length - 1 && null}
            </div>
          )
        })}
      </div>

      {/* Boutons */}
      <div className="flex flex-wrap gap-2">
        {SEQUENCE.map((s) => (
          <button
            key={s}
            onClick={() => updateStatut(s)}
            disabled={loading || s === statutActuel}
            className={clsx(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all',
              s === statutActuel
                ? STATUT_COLORS[s] + ' cursor-default ring-2 ring-offset-1 ring-orange-400'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {STATUT_LABELS[s]}
          </button>
        ))}
        <button
          onClick={() => updateStatut('annule')}
          disabled={loading || statutActuel === 'annule' || statutActuel === 'livre'}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-40 transition-all"
        >
          Annuler
        </button>
      </div>
    </div>
  )
}
