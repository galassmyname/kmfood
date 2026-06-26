'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Restaurant, Plat } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/client'
import clsx from 'clsx'

type RestaurantAvecPlats = Restaurant & { plats: Plat[] }

export default function RestaurantsManager({ restaurants: initial }: { restaurants: RestaurantAvecPlats[] }) {
  const [restaurants, setRestaurants] = useState<RestaurantAvecPlats[]>(initial)
  const [selected, setSelected] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ nom: '', specialite: '', contact: '', horaires: '', adresse: '' })
  const [platForm, setPlatForm] = useState({ nom: '', description: '', prix: '' })
  const supabase = createClient()

  const selectedRest = restaurants.find(r => r.id === selected)

  async function toggleActif(r: RestaurantAvecPlats) {
    const { data, error } = await supabase
      .from('restaurants')
      .update({ actif: !r.actif })
      .eq('id', r.id)
      .select()
      .single()
    if (!error && data) {
      setRestaurants(prev => prev.map(rest => rest.id === r.id ? { ...rest, actif: !rest.actif } : rest))
      toast.success(r.actif ? 'Restaurant désactivé' : 'Restaurant activé')
    }
  }

  async function ajouterRestaurant() {
    if (!form.nom) { toast.error('Nom requis'); return }
    setLoading(true)
    const { data, error } = await supabase
      .from('restaurants')
      .insert(form)
      .select()
      .single()
    if (!error && data) {
      setRestaurants(prev => [...prev, { ...data, plats: [] }])
      setForm({ nom: '', specialite: '', contact: '', horaires: '', adresse: '' })
      setShowForm(false)
      toast.success('Restaurant ajouté !')
    } else {
      toast.error(error?.message || 'Erreur')
    }
    setLoading(false)
  }

  async function ajouterPlat(restaurantId: string) {
    if (!platForm.nom || !platForm.prix) { toast.error('Nom et prix requis'); return }
    const { data, error } = await supabase
      .from('plats')
      .insert({ restaurant_id: restaurantId, nom: platForm.nom, description: platForm.description, prix: parseInt(platForm.prix) })
      .select()
      .single()
    if (!error && data) {
      setRestaurants(prev => prev.map(r =>
        r.id === restaurantId ? { ...r, plats: [...r.plats, data] } : r
      ))
      setPlatForm({ nom: '', description: '', prix: '' })
      toast.success('Plat ajouté !')
    }
  }

  async function togglePlatDispo(plat: Plat) {
    const { error } = await supabase
      .from('plats')
      .update({ disponible: !plat.disponible })
      .eq('id', plat.id)
    if (!error) {
      setRestaurants(prev => prev.map(r => ({
        ...r,
        plats: r.plats.map(p => p.id === plat.id ? { ...p, disponible: !p.disponible } : p)
      })))
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Liste restaurants */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-700">Restaurants</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-medium"
          >
            + Ajouter
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-orange-200 p-4 mb-4 space-y-2">
            <input placeholder="Nom *" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <input placeholder="Spécialité" value={form.specialite} onChange={e => setForm(f => ({ ...f, specialite: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <input placeholder="Contact" value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <input placeholder="Horaires" value={form.horaires} onChange={e => setForm(f => ({ ...f, horaires: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600">Annuler</button>
              <button onClick={ajouterRestaurant} disabled={loading} className="flex-1 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold">
                {loading ? '...' : 'Ajouter'}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {restaurants.map(r => (
            <div
              key={r.id}
              onClick={() => setSelected(r.id === selected ? null : r.id)}
              className={clsx(
                'bg-white rounded-2xl border p-4 cursor-pointer transition-all',
                selected === r.id ? 'border-orange-400 ring-2 ring-orange-200' : 'border-gray-200 hover:border-orange-300',
                !r.actif && 'opacity-60'
              )}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">{r.nom}</h3>
                  <p className="text-sm text-gray-500">{r.specialite}</p>
                  {r.contact && <p className="text-xs text-gray-400 mt-1">📞 {r.contact}</p>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={clsx(
                    'text-xs px-2 py-0.5 rounded-full',
                    r.actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                  )}>
                    {r.actif ? 'Actif' : 'Inactif'}
                  </span>
                  <span className="text-xs text-gray-400">{r.plats.length} plat(s)</span>
                </div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); toggleActif(r) }}
                className={clsx(
                  'mt-3 w-full py-1.5 rounded-lg text-xs font-medium transition-colors',
                  r.actif ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'
                )}
              >
                {r.actif ? 'Désactiver' : 'Activer'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Catalogue plats */}
      <div>
        {selectedRest ? (
          <>
            <h2 className="font-bold text-gray-700 mb-4">
              Menu — {selectedRest.nom}
            </h2>

            {/* Ajouter plat */}
            <div className="bg-white rounded-2xl border border-dashed border-orange-300 p-4 mb-4 space-y-2">
              <p className="text-xs font-semibold text-gray-400">+ Nouveau plat</p>
              <input placeholder="Nom du plat *" value={platForm.nom} onChange={e => setPlatForm(f => ({ ...f, nom: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              <input placeholder="Description (optionnel)" value={platForm.description} onChange={e => setPlatForm(f => ({ ...f, description: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              <input type="number" placeholder="Prix (FCFA) *" value={platForm.prix} onChange={e => setPlatForm(f => ({ ...f, prix: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              <button onClick={() => ajouterPlat(selectedRest.id)}
                className="w-full py-2 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors">
                Ajouter ce plat
              </button>
            </div>

            <div className="space-y-2">
              {selectedRest.plats.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">Aucun plat. Ajoutez-en un ci-dessus.</p>
              ) : (
                selectedRest.plats.map(plat => (
                  <div key={plat.id} className={clsx(
                    'bg-white rounded-xl border p-3 flex justify-between items-center',
                    !plat.disponible && 'opacity-60'
                  )}>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{plat.nom}</p>
                      {plat.description && <p className="text-xs text-gray-400">{plat.description}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-orange-600 text-sm">
                        {plat.prix.toLocaleString('fr-FR')} F
                      </span>
                      <button onClick={() => togglePlatDispo(plat)}
                        className={clsx(
                          'text-xs px-2 py-1 rounded-lg transition-colors',
                          plat.disponible ? 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500' : 'bg-green-50 text-green-600 hover:bg-green-100'
                        )}>
                        {plat.disponible ? 'Désactiver' : 'Activer'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
            <div className="text-center">
              <span className="text-4xl">👆</span>
              <p className="mt-3">Sélectionnez un restaurant<br />pour gérer son menu</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
