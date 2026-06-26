'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Restaurant, Plat, Livreur } from '@/lib/supabase/types'

export default function NouvelleCommandeBtn() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors flex items-center gap-2"
      >
        <span className="text-lg">+</span> Nouvelle commande
      </button>
      {open && <NouvelleCommandeModal onClose={() => setOpen(false)} />}
    </>
  )
}

function NouvelleCommandeModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const supabase = createClient()

  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [plats, setPlats] = useState<Plat[]>([])
  const [livreurs, setLivreurs] = useState<Livreur[]>([])
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    client_nom: '',
    client_telephone: '',
    client_adresse: '',
    client_geoloc: '',
    restaurant_id: '',
    plat_id: '',
    plat_nom: '',
    plat_prix: '',
    details_plat: '',
    livreur_id: '',
    mode_paiement: 'cash',
    notes: '',
  })

  useEffect(() => {
    async function load() {
      const [{ data: rests }, { data: livs }] = await Promise.all([
        supabase.from('restaurants').select('*').eq('actif', true).order('nom'),
        supabase.from('livreurs').select('*').eq('disponible', true).order('nom'),
      ])
      setRestaurants(rests || [])
      setLivreurs(livs || [])
    }
    load()
  }, [supabase])

  useEffect(() => {
    if (!form.restaurant_id) { setPlats([]); return }
    supabase
      .from('plats')
      .select('*')
      .eq('restaurant_id', form.restaurant_id)
      .eq('disponible', true)
      .then(({ data }) => setPlats(data || []))
  }, [form.restaurant_id, supabase])

  function handlePlatChange(platId: string) {
    const plat = plats.find(p => p.id === platId)
    setForm(f => ({
      ...f,
      plat_id: platId,
      plat_nom: plat?.nom || '',
      plat_prix: plat?.prix?.toString() || '',
    }))
  }

  async function handleSubmit() {
    if (!form.plat_nom || !form.plat_prix) {
      toast.error('Le nom et le prix du plat sont requis')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/commandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success(`Commande ${json.data.numero} créée !`)
      onClose()
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Nouvelle commande</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="p-5 space-y-4">
          {/* Client */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Client (WhatsApp)</p>
            <input
              placeholder="Nom du client"
              value={form.client_nom}
              onChange={e => setForm(f => ({ ...f, client_nom: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <input
              placeholder="Téléphone"
              value={form.client_telephone}
              onChange={e => setForm(f => ({ ...f, client_telephone: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <input
              placeholder="Adresse / quartier"
              value={form.client_adresse}
              onChange={e => setForm(f => ({ ...f, client_adresse: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <input
              placeholder="Lien Google Maps (géolocalisation)"
              value={form.client_geoloc}
              onChange={e => setForm(f => ({ ...f, client_geoloc: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Commande */}
          <div className="space-y-3 pt-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Commande</p>
            <select
              value={form.restaurant_id}
              onChange={e => setForm(f => ({ ...f, restaurant_id: e.target.value, plat_id: '', plat_nom: '', plat_prix: '' }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
            >
              <option value="">— Sélectionner un restaurant —</option>
              {restaurants.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
            </select>

            {plats.length > 0 ? (
              <select
                value={form.plat_id}
                onChange={e => handlePlatChange(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              >
                <option value="">— Sélectionner un plat —</option>
                {plats.map(p => (
                  <option key={p.id} value={p.id}>{p.nom} — {p.prix.toLocaleString('fr-FR')} FCFA</option>
                ))}
              </select>
            ) : (
              <input
                placeholder="Nom du plat (saisie libre)"
                value={form.plat_nom}
                onChange={e => setForm(f => ({ ...f, plat_nom: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            )}

            <input
              type="number"
              placeholder="Prix du plat (FCFA)"
              value={form.plat_prix}
              onChange={e => setForm(f => ({ ...f, plat_prix: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />

            <textarea
              placeholder="Détails / personnalisation (ex: avec piment, sans oignon...)"
              value={form.details_plat}
              onChange={e => setForm(f => ({ ...f, details_plat: e.target.value }))}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>

          {/* Livreur & Paiement */}
          <div className="space-y-3 pt-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Livraison & Paiement</p>
            <select
              value={form.livreur_id}
              onChange={e => setForm(f => ({ ...f, livreur_id: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
            >
              <option value="">— Assigner un livreur (optionnel) —</option>
              {livreurs.map(l => <option key={l.id} value={l.id}>{l.nom} · {l.telephone}</option>)}
            </select>

            <select
              value={form.mode_paiement}
              onChange={e => setForm(f => ({ ...f, mode_paiement: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
            >
              <option value="cash">💵 Cash à la livraison</option>
              <option value="wave">🔵 Wave</option>
              <option value="orange_money">🟠 Orange Money</option>
            </select>
          </div>

          {/* Récap montant */}
          {form.plat_prix && (
            <div className="bg-orange-50 rounded-xl p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Prix plat</span>
                <span>{parseInt(form.plat_prix).toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-gray-500">Livraison</span>
                <span>1 000 FCFA</span>
              </div>
              <div className="flex justify-between mt-2 font-bold text-orange-600 text-base">
                <span>Total</span>
                <span>{(parseInt(form.plat_prix) + 1000).toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          )}

          <textarea
            placeholder="Notes internes (optionnel)"
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          />
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-3 rounded-xl font-bold transition-colors"
          >
            {loading ? 'Enregistrement...' : 'Créer la commande'}
          </button>
        </div>
      </div>
    </div>
  )
}
