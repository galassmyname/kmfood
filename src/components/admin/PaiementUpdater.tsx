'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { StatutPaiement } from '@/lib/supabase/types'
import clsx from 'clsx'

export default function PaiementUpdater({
  commandeId,
  statutPaiement,
}: {
  commandeId: string
  statutPaiement: StatutPaiement
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function confirmer() {
    setLoading(true)
    try {
      const res = await fetch(`/api/commandes/${commandeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut_paiement: 'recu' }),
      })
      if (!res.ok) throw new Error()
      toast.success('Paiement confirmé ✓')
      router.refresh()
    } catch {
      toast.error('Erreur confirmation paiement')
    } finally {
      setLoading(false)
    }
  }

  if (statutPaiement === 'recu') {
    return (
      <div className="flex items-center gap-2 text-green-600 font-semibold">
        <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-sm">✓</span>
        Paiement reçu
      </div>
    )
  }

  return (
    <button
      onClick={confirmer}
      disabled={loading}
      className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-3 rounded-xl font-bold transition-colors"
    >
      {loading ? 'Confirmation...' : '✓ Confirmer le paiement reçu'}
    </button>
  )
}
