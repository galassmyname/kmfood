import { createClient } from '@/lib/supabase/server'
import LivreursManager from '@/components/admin/LivreursManager'

export const revalidate = 0

async function getLivreurs() {
  const supabase = createClient()
  const { data } = await supabase
    .from('livreurs')
    .select('*')
    .order('nom')
  return data || []
}

export default async function LivreursPage() {
  const livreurs = await getLivreurs()

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Livreurs</h1>
        <p className="text-gray-500 mt-1">
          {livreurs.filter(l => l.disponible).length} disponible(s) sur {livreurs.length}
        </p>
      </div>
      <LivreursManager livreurs={livreurs} />
    </div>
  )
}
