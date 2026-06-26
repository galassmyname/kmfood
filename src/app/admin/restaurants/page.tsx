import { createClient } from '@/lib/supabase/server'
import RestaurantsManager from '@/components/admin/RestaurantsManager'

export const revalidate = 0

async function getRestaurants() {
  const supabase = createClient()
  const { data } = await supabase
    .from('restaurants')
    .select('*, plats(*)')
    .order('nom')
  return data || []
}

export default async function RestaurantsPage() {
  const restaurants = await getRestaurants()

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Restaurants partenaires</h1>
        <p className="text-gray-500 mt-1">
          {restaurants.filter(r => r.actif).length} actif(s) sur {restaurants.length}
        </p>
      </div>
      <RestaurantsManager restaurants={restaurants} />
    </div>
  )
}
