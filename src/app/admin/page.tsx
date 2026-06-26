import { createClient } from '@/lib/supabase/server'
import { format, startOfDay, endOfDay, subDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import DashboardCharts from '@/components/admin/DashboardCharts'
import RecentOrders from '@/components/admin/RecentOrders'

async function getDashboardData() {
  try {
    const supabase = createClient()
    const today = new Date()
    const todayStart = startOfDay(today).toISOString()
    const todayEnd = endOfDay(today).toISOString()

    const [
      { data: commandesAujourd },
      { count: livreursDispos },
      { count: restaurantsActifs },
      { data: commandes7j },
      { data: commandesRecentes },
    ] = await Promise.all([
      supabase.from('commandes').select('*').gte('created_at', todayStart).lte('created_at', todayEnd),
      supabase.from('livreurs').select('*', { count: 'exact', head: true }).eq('disponible', true),
      supabase.from('restaurants').select('*', { count: 'exact', head: true }).eq('actif', true),
      supabase.from('commandes').select('created_at, montant_total, frais_livraison, statut').gte('created_at', subDays(today, 7).toISOString()).order('created_at', { ascending: true }),
      supabase.from('commandes').select('*, restaurants(nom), livreurs(nom, telephone)').order('created_at', { ascending: false }).limit(10),
    ])

    const livrees = (commandesAujourd || []).filter((c: any) => c.statut === 'livre')
    const revenuJour = livrees.reduce((sum: number, c: any) => sum + (c.frais_livraison || 0), 0)

    return {
      commandesCount: commandesAujourd?.length || 0,
      revenuJour,
      livreursDispos: livreursDispos || 0,
      restaurantsActifs: restaurantsActifs || 0,
      commandes7j: commandes7j || [],
      commandesRecentes: commandesRecentes || [],
    }
  } catch {
    return { commandesCount: 0, revenuJour: 0, livreursDispos: 0, restaurantsActifs: 0, commandes7j: [], commandesRecentes: [] }
  }
}

export default async function AdminDashboard() {
  const data = await getDashboardData()
  const today = format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 capitalize mt-1">{today}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Commandes aujourd'hui" value={data.commandesCount.toString()} emoji="📦" color="bg-blue-50 border-blue-200" textColor="text-blue-700" />
        <KpiCard label="Revenus du jour" value={`${data.revenuJour.toLocaleString('fr-FR')} FCFA`} emoji="💰" color="bg-green-50 border-green-200" textColor="text-green-700" />
        <KpiCard label="Livreurs disponibles" value={data.livreursDispos.toString()} emoji="🛵" color="bg-orange-50 border-orange-200" textColor="text-orange-700" />
        <KpiCard label="Restaurants actifs" value={data.restaurantsActifs.toString()} emoji="🍽️" color="bg-purple-50 border-purple-200" textColor="text-purple-700" />
      </div>

      <DashboardCharts commandes7j={data.commandes7j} />

      <div className="mt-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Commandes récentes</h2>
        <RecentOrders commandes={data.commandesRecentes} />
      </div>
    </div>
  )
}

function KpiCard({ label, value, emoji, color, textColor }: { label: string; value: string; emoji: string; color: string; textColor: string }) {
  return (
    <div className={`rounded-2xl border p-5 ${color}`}>
      <span className="text-2xl">{emoji}</span>
      <p className={`text-2xl font-extrabold mt-2 ${textColor}`}>{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  )
}
