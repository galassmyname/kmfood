'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { STATUT_LABELS, STATUT_COLORS, PAIEMENT_LABELS } from '@/lib/supabase/types'
import type { CommandeAvecRelations } from '@/lib/supabase/types'

export default function RecentOrders({ commandes }: { commandes: CommandeAvecRelations[] }) {
  if (commandes.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
        <span className="text-4xl">📦</span>
        <p className="mt-3">Aucune commande pour le moment</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="divide-y divide-gray-100">
        {commandes.map((c) => (
          <Link
            key={c.id}
            href={`/admin/commandes/${c.id}`}
            className="flex items-center gap-4 px-5 py-4 hover:bg-orange-50 transition-colors"
          >
            {/* Statut dot */}
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
              c.statut === 'nouveau' ? 'bg-blue-500' :
              c.statut === 'livre' ? 'bg-green-500' :
              c.statut === 'annule' ? 'bg-red-500' : 'bg-orange-400'
            }`} />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-gray-400">{c.numero}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUT_COLORS[c.statut]}`}>
                  {STATUT_LABELS[c.statut]}
                </span>
              </div>
              <p className="font-medium text-gray-800 text-sm truncate">{c.plat_nom}</p>
              <p className="text-xs text-gray-400 truncate">
                {c.client_nom || 'Client'} · {(c.restaurants as any)?.nom || '—'}
              </p>
            </div>

            {/* Montant & heure */}
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-orange-600">{c.montant_total.toLocaleString('fr-FR')} F</p>
              <p className="text-xs text-gray-400">
                {format(new Date(c.created_at), 'HH:mm', { locale: fr })}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <div className="p-4 border-t border-gray-100 text-center">
        <Link href="/admin/commandes" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
          Voir toutes les commandes →
        </Link>
      </div>
    </div>
  )
}
