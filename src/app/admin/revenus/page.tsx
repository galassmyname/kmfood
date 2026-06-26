import { createClient } from '@/lib/supabase/server'
import { startOfWeek, startOfMonth, subDays } from 'date-fns'
import RevenusCharts from '@/components/admin/RevenusCharts'

async function getRevenus() {
  const supabase = createClient()
  const now = new Date()

  // Commandes livrées uniquement
  const { data: commandes } = await supabase
    .from('commandes')
    .select('created_at, frais_livraison, mode_paiement, statut_paiement, statut, montant_total')
    .eq('statut', 'livre')
    .order('created_at', { ascending: false })

  const livrees = commandes || []

  const today = livrees.filter(c =>
    new Date(c.created_at) >= new Date(now.toDateString())
  )
  const thisWeek = livrees.filter(c =>
    new Date(c.created_at) >= startOfWeek(now, { weekStartsOn: 1 })
  )
  const thisMonth = livrees.filter(c =>
    new Date(c.created_at) >= startOfMonth(now)
  )

  const sum = (arr: typeof livrees) => arr.reduce((s, c) => s + c.frais_livraison, 0)

  // Par mode de paiement
  const byMode = {
    wave: livrees.filter(c => c.mode_paiement === 'wave'),
    orange_money: livrees.filter(c => c.mode_paiement === 'orange_money'),
    cash: livrees.filter(c => c.mode_paiement === 'cash'),
  }

  // Données pour graphique 30 derniers jours
  const commandes30j = await supabase
    .from('commandes')
    .select('created_at, frais_livraison, statut')
    .gte('created_at', subDays(now, 30).toISOString())
    .order('created_at', { ascending: true })

  return {
    revenuJour: sum(today),
    revenuSemaine: sum(thisWeek),
    revenuMois: sum(thisMonth),
    commandesLivreesTotal: livrees.length,
    byMode: {
      wave: { count: byMode.wave.length, total: sum(byMode.wave) },
      orange_money: { count: byMode.orange_money.length, total: sum(byMode.orange_money) },
      cash: { count: byMode.cash.length, total: sum(byMode.cash) },
    },
    commandes30j: commandes30j.data || [],
  }
}

export default async function RevenusPage() {
  const data = await getRevenus()

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Revenus KM FOOD</h1>
        <p className="text-gray-500 mt-1">Frais de livraison encaissés</p>
      </div>

      {/* KPIs revenus */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <RevenuCard label="Aujourd'hui" value={data.revenuJour} emoji="📅" />
        <RevenuCard label="Cette semaine" value={data.revenuSemaine} emoji="📆" />
        <RevenuCard label="Ce mois" value={data.revenuMois} emoji="🗓️" />
      </div>

      {/* Par mode de paiement */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <h2 className="font-bold text-gray-800 mb-4">Répartition par mode de paiement</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { key: 'wave', label: 'Wave', emoji: '🔵', data: data.byMode.wave },
            { key: 'orange_money', label: 'Orange Money', emoji: '🟠', data: data.byMode.orange_money },
            { key: 'cash', label: 'Cash', emoji: '💵', data: data.byMode.cash },
          ].map(item => (
            <div key={item.key} className="text-center p-4 bg-gray-50 rounded-xl">
              <span className="text-3xl">{item.emoji}</span>
              <p className="font-bold text-gray-900 mt-2">
                {item.data.total.toLocaleString('fr-FR')} FCFA
              </p>
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-xs text-gray-400">{item.data.count} commande(s)</p>
            </div>
          ))}
        </div>
      </div>

      {/* Graphique 30 jours */}
      <RevenusCharts commandes30j={data.commandes30j} />
    </div>
  )
}

function RevenuCard({ label, value, emoji }: { label: string; value: number; emoji: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <span className="text-3xl">{emoji}</span>
      <p className="text-3xl font-extrabold text-orange-600 mt-2">
        {value.toLocaleString('fr-FR')} FCFA
      </p>
      <p className="text-gray-500 text-sm mt-1">{label}</p>
    </div>
  )
}
