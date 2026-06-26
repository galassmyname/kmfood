import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import CommandesTable from '@/components/admin/CommandesTable'
import NouvelleCommandeBtn from '@/components/admin/NouvelleCommandeBtn'

export const revalidate = 0

async function getCommandes() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('commandes')
    .select('*, restaurants(nom), livreurs(nom, telephone)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Erreur commandes:', error)
    return []
  }
  return data
}

export default async function CommandesPage() {
  const commandes = await getCommandes()

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Commandes</h1>
          <p className="text-gray-500 mt-1">{commandes.length} commande(s) chargée(s)</p>
        </div>
        <NouvelleCommandeBtn />
      </div>

      <CommandesTable commandes={commandes} />
    </div>
  )
}
