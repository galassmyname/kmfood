import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { STATUT_LABELS, STATUT_COLORS, PAIEMENT_LABELS } from '@/lib/supabase/types'
import StatutUpdater from '@/components/admin/StatutUpdater'
import PaiementUpdater from '@/components/admin/PaiementUpdater'
import AssignerLivreur from '@/components/admin/AssignerLivreur'

async function getCommande(id: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('commandes')
    .select('*, restaurants(nom, contact), livreurs(nom, telephone, moto)')
    .eq('id', id)
    .single()
  return data
}

async function getLivreurs() {
  const supabase = createClient()
  const { data } = await supabase
    .from('livreurs')
    .select('id, nom, telephone, disponible')
    .order('nom')
  return data || []
}

export default async function CommandeDetailPage({ params }: { params: { id: string } }) {
  const [commande, livreurs] = await Promise.all([
    getCommande(params.id),
    getLivreurs(),
  ])

  if (!commande) notFound()

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/commandes" className="text-gray-400 hover:text-gray-700 transition-colors">
          ← Retour
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-900">
          Commande {commande.numero}
        </h1>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${STATUT_COLORS[commande.statut]}`}>
          {STATUT_LABELS[commande.statut]}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Infos client */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>👤</span> Client
          </h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-gray-400">Nom</dt>
              <dd className="font-medium text-gray-800">{commande.client_nom || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Téléphone</dt>
              <dd className="font-medium text-gray-800">
                {commande.client_telephone ? (
                  <a href={`tel:${commande.client_telephone}`} className="text-orange-600 hover:underline">
                    {commande.client_telephone}
                  </a>
                ) : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">Adresse</dt>
              <dd className="font-medium text-gray-800">{commande.client_adresse || '—'}</dd>
            </div>
            {commande.client_geoloc && (
              <div>
                <dt className="text-gray-400">Géolocalisation</dt>
                <dd>
                  <a
                    href={commande.client_geoloc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    📍 Ouvrir dans Google Maps
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Infos commande */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>🍽️</span> Commande
          </h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-gray-400">Restaurant</dt>
              <dd className="font-medium text-gray-800">
                {(commande.restaurants as any)?.nom || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">Plat</dt>
              <dd className="font-bold text-gray-900 text-base">{commande.plat_nom}</dd>
            </div>
            {commande.details_plat && (
              <div>
                <dt className="text-gray-400">Détails / Personnalisation</dt>
                <dd className="font-medium text-gray-800 italic">{commande.details_plat}</dd>
              </div>
            )}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">Prix du plat</span>
                <span className="font-medium">{commande.plat_prix.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-gray-500">Frais de livraison</span>
                <span className="font-medium">{commande.frais_livraison.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between mt-2 text-base font-bold text-orange-600">
                <span>Total</span>
                <span>{commande.montant_total.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          </dl>
        </div>

        {/* Paiement */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>💳</span> Paiement
          </h2>
          <div className="mb-4 text-sm">
            <span className="text-gray-400">Mode : </span>
            <span className="font-medium">{PAIEMENT_LABELS[commande.mode_paiement]}</span>
          </div>
          <PaiementUpdater
            commandeId={commande.id}
            statutPaiement={commande.statut_paiement}
          />
        </div>

        {/* Livreur */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>🛵</span> Livreur
          </h2>
          {commande.livreurs ? (
            <div className="mb-4 text-sm space-y-1">
              <p className="font-bold text-gray-900">{(commande.livreurs as any).nom}</p>
              <a href={`tel:${(commande.livreurs as any).telephone}`} className="text-orange-600 hover:underline">
                {(commande.livreurs as any).telephone}
              </a>
              {(commande.livreurs as any).moto && (
                <p className="text-gray-400">{(commande.livreurs as any).moto}</p>
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-sm mb-4">Aucun livreur assigné</p>
          )}
          <AssignerLivreur
            commandeId={commande.id}
            livreurActuelId={commande.livreur_id}
            livreurs={livreurs}
          />
        </div>
      </div>

      {/* Statut */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-6">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>📊</span> Mettre à jour le statut
        </h2>
        <StatutUpdater commandeId={commande.id} statutActuel={commande.statut} />
      </div>

      {/* Notes */}
      {commande.notes && (
        <div className="bg-yellow-50 rounded-2xl border border-yellow-200 p-6 mt-6">
          <h2 className="font-bold text-yellow-800 mb-2">📝 Notes internes</h2>
          <p className="text-yellow-700 text-sm">{commande.notes}</p>
        </div>
      )}

      {/* Lien de suivi client */}
      <div className="bg-blue-50 rounded-2xl border border-blue-200 p-5 mt-6">
        <h2 className="font-bold text-blue-800 mb-2 text-sm">📤 Lien de suivi à envoyer au client</h2>
        <p className="font-mono text-blue-700 text-sm break-all mb-3 select-all">
          https://votre-domaine.vercel.app/suivi/{commande.numero}
        </p>
        {commande.client_telephone && (
          <a
            href={`https://wa.me/${commande.client_telephone.replace(/\s/g, '')}?text=Bonjour%20!%20Suivez%20votre%20commande%20KM%20FOOD%20(${commande.numero})%20en%20temps%20r%C3%A9el%20ici%20%3A%20https%3A%2F%2Fvotre-domaine.vercel.app%2Fsuivi%2F${commande.numero}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Envoyer sur WhatsApp
          </a>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-400">
        Créée le {format(new Date(commande.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
        {commande.livre_at && (
          <> · Livrée le {format(new Date(commande.livre_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}</>
        )}
      </div>
    </div>
  )
}
