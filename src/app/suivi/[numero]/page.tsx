import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { STATUT_LABELS } from '@/lib/supabase/types'
import type { StatutCommande } from '@/lib/supabase/types'
import SuiviRealtime from '@/components/client/SuiviRealtime'
import { CONFIG } from '@/lib/config'

const ETAPES: { statut: StatutCommande; label: string; emoji: string; desc: string }[] = [
  { statut: 'nouveau',        label: 'Reçue',          emoji: '📩', desc: 'Votre commande a été reçue par KM FOOD' },
  { statut: 'confirme',       label: 'Confirmée',      emoji: '✅', desc: 'KM FOOD a confirmé votre commande' },
  { statut: 'en_preparation', label: 'En préparation', emoji: '👨‍🍳', desc: 'Le restaurant prépare votre repas' },
  { statut: 'en_livraison',   label: 'En livraison',   emoji: '🛵', desc: 'Votre livreur est en route !' },
  { statut: 'livre',          label: 'Livré',          emoji: '🎉', desc: 'Commande livrée. Bon appétit !' },
]

async function getCommande(numero: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('commandes')
    .select('*, restaurants(nom), livreurs(nom, telephone)')
    .eq('numero', numero.toUpperCase())
    .single()
  return data
}

export default async function SuiviPage({ params }: { params: { numero: string } }) {
  const commande = await getCommande(params.numero)

  if (!commande) notFound()

 const WHATSAPP_URL = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=Bonjour%20${encodeURIComponent(CONFIG.NOM)}%2C%20je%20veux%20des%20infos%20sur%20ma%20commande%20${commande.numero}`

  const etapeActuelle = ETAPES.findIndex(e => e.statut === commande.statut)
  const estAnnule = commande.statut === 'annule'

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-white border-b border-orange-100 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🍔</span>
            <span className="font-extrabold text-orange-600">KM FOOD</span>
          </Link>
          <span className="font-mono text-sm text-gray-400">{commande.numero}</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-5">

        {/* Statut principal */}
        {estAnnule ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <span className="text-5xl">❌</span>
            <h1 className="text-xl font-extrabold text-red-700 mt-3">Commande annulée</h1>
            <p className="text-red-500 text-sm mt-2">
              Contactez-nous sur WhatsApp pour plus d'informations.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
            <span className="text-5xl">{ETAPES[etapeActuelle]?.emoji}</span>
            <h1 className="text-2xl font-extrabold text-gray-900 mt-3">
              {ETAPES[etapeActuelle]?.label}
            </h1>
            <p className="text-gray-500 mt-1">{ETAPES[etapeActuelle]?.desc}</p>
          </div>
        )}

        {/* Barre de progression */}
        {!estAnnule && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">
              Suivi de commande
            </h2>
            <div className="relative">
              {/* Ligne de fond */}
              <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200" />
              {/* Ligne de progression */}
              <div
                className="absolute left-5 top-5 w-0.5 bg-orange-400 transition-all duration-700"
                style={{ height: `${(etapeActuelle / (ETAPES.length - 1)) * 100}%` }}
              />
              <div className="space-y-6">
                {ETAPES.map((etape, i) => {
                  const done = i <= etapeActuelle
                  const active = i === etapeActuelle
                  return (
                    <div key={etape.statut} className="flex items-start gap-4 relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 border-2 transition-all ${
                        done
                          ? 'bg-orange-500 border-orange-500 text-white'
                          : 'bg-white border-gray-200 text-gray-300'
                      } ${active ? 'ring-4 ring-orange-100' : ''}`}>
                        {done ? (i === etapeActuelle ? etape.emoji : '✓') : etape.emoji}
                      </div>
                      <div className="pt-1.5">
                        <p className={`font-semibold ${done ? 'text-gray-900' : 'text-gray-400'}`}>
                          {etape.label}
                        </p>
                        {active && (
                          <p className="text-sm text-orange-600 mt-0.5">{etape.desc}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Détail commande */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Votre commande
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Plat</span>
              <span className="font-semibold text-gray-800">{commande.plat_nom}</span>
            </div>
            {commande.details_plat && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Personnalisation</span>
                <span className="text-gray-700 italic text-right max-w-[60%]">{commande.details_plat}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Restaurant</span>
              <span className="font-medium text-gray-700">{(commande.restaurants as any)?.nom || '—'}</span>
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Prix du plat</span>
                <span>{commande.plat_prix.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Frais de livraison</span>
                <span>{commande.frais_livraison.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between font-bold text-orange-600 text-base pt-1">
                <span>Total</span>
                <span>{commande.montant_total.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info livreur si en livraison */}
        {commande.statut === 'en_livraison' && commande.livreurs && (
          <div className="bg-orange-500 rounded-2xl p-5 text-white">
            <p className="text-orange-100 text-sm font-medium mb-1">Votre livreur</p>
            <p className="text-xl font-extrabold">{(commande.livreurs as any).nom}</p>
            <a
              href={`tel:${(commande.livreurs as any).telephone}`}
              className="inline-flex items-center gap-2 mt-3 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              📞 Appeler {(commande.livreurs as any).telephone}
            </a>
          </div>
        )}

        {/* Paiement */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Paiement</p>
              <p className="font-semibold text-gray-800">
                {commande.mode_paiement === 'wave' ? '🔵 Wave' :
                 commande.mode_paiement === 'orange_money' ? '🟠 Orange Money' :
                 '💵 Cash à la livraison'}
              </p>
            </div>
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${
              commande.statut_paiement === 'recu'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {commande.statut_paiement === 'recu' ? '✓ Payé' : 'En attente'}
            </span>
          </div>
          {commande.statut_paiement !== 'recu' && commande.mode_paiement !== 'cash' && (
            <Link
              href={`/paiement?montant=${commande.montant_total}&commande=${commande.numero}`}
              className="mt-3 block text-center bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition-colors text-sm"
            >
              Payer maintenant ({commande.montant_total.toLocaleString('fr-FR')} FCFA)
            </Link>
          )}
        </div>

        {/* Heure et WhatsApp */}
        <div className="text-center space-y-3">
          <p className="text-xs text-gray-400">
            Commande passée le {format(new Date(commande.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Contacter KM FOOD
          </a>
        </div>
      </div>

      {/* Realtime updates silencieux */}
      <SuiviRealtime commandeId={commande.id} />
    </div>
  )
}
