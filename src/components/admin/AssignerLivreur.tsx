'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Livreur } from '@/lib/supabase/types'

export default function AssignerLivreur({
  commandeId,
  livreurActuelId,
  livreurs,
}: {
  commandeId: string
  livreurActuelId: string | null
  livreurs: Pick<Livreur, 'id' | 'nom' | 'telephone' | 'disponible'>[]
}) {
  const [selected, setSelected] = useState(livreurActuelId || '')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function assigner() {
    setLoading(true)
    try {
      const res = await fetch(`/api/commandes/${commandeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ livreur_id: selected || null }),
      })
      if (!res.ok) throw new Error()
      toast.success('Livreur assigné')
      router.refresh()
    } catch {
      toast.error('Erreur assignation livreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <select
        value={selected}
        onChange={e => setSelected(e.target.value)}
        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
      >
        <option value="">— Aucun livreur —</option>
        {livreurs.map(l => (
          <option key={l.id} value={l.id}>
            {l.nom} {!l.disponible ? '(indispo)' : ''}
          </option>
        ))}
      </select>
      <button
        onClick={assigner}
        disabled={loading}
        className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
      >
        {loading ? '...' : 'Assigner'}
      </button>
    </div>
  )
}
