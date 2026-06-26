'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Livreur } from '@/lib/supabase/types'
import clsx from 'clsx'

export default function LivreursManager({ livreurs: initial }: { livreurs: Livreur[] }) {
  const [livreurs, setLivreurs] = useState<Livreur[]>(initial)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nom: '', telephone: '', moto: '' })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function toggleDisponible(livreur: Livreur) {
    const res = await fetch(`/api/livreurs/${livreur.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disponible: !livreur.disponible }),
    })
    if (res.ok) {
      setLivreurs(prev => prev.map(l =>
        l.id === livreur.id ? { ...l, disponible: !l.disponible } : l
      ))
      toast.success(livreur.disponible ? 'Livreur mis hors service' : 'Livreur mis en service')
    }
  }

  async function ajouterLivreur() {
    if (!form.nom || !form.telephone) {
      toast.error('Nom et téléphone requis')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/livreurs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setLivreurs(prev => [...prev, json.data])
      setForm({ nom: '', telephone: '', moto: '' })
      setShowForm(false)
      toast.success('Livreur ajouté !')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function supprimerLivreur(id: string) {
    if (!confirm('Supprimer ce livreur ?')) return
    const res = await fetch(`/api/livreurs/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setLivreurs(prev => prev.filter(l => l.id !== id))
      toast.success('Livreur supprimé')
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors"
        >
          + Ajouter un livreur
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-orange-200 p-5 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Nouveau livreur</h3>
          <div className="grid md:grid-cols-3 gap-3">
            <input
              placeholder="Nom complet *"
              value={form.nom}
              onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <input
              placeholder="Téléphone *"
              value={form.telephone}
              onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <input
              placeholder="Moto (modèle, plaque...)"
              value={form.moto}
              onChange={e => setForm(f => ({ ...f, moto: e.target.value }))}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={ajouterLivreur}
              disabled={loading}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-xl text-sm font-bold transition-colors"
            >
              {loading ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {livreurs.map(livreur => (
          <div
            key={livreur.id}
            className={clsx(
              'bg-white rounded-2xl border p-5 transition-all',
              livreur.disponible ? 'border-green-200' : 'border-gray-200 opacity-70'
            )}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-gray-900">{livreur.nom}</h3>
                <a href={`tel:${livreur.telephone}`} className="text-orange-600 text-sm hover:underline">
                  {livreur.telephone}
                </a>
              </div>
              <span className={clsx(
                'text-xs px-2 py-1 rounded-full font-medium',
                livreur.disponible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              )}>
                {livreur.disponible ? '● En service' : '○ Hors service'}
              </span>
            </div>

            {livreur.moto && (
              <p className="text-xs text-gray-400 mb-3">🛵 {livreur.moto}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => toggleDisponible(livreur)}
                className={clsx(
                  'flex-1 py-2 rounded-xl text-sm font-medium transition-colors',
                  livreur.disponible
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                )}
              >
                {livreur.disponible ? 'Mettre hors service' : 'Mettre en service'}
              </button>
              <button
                onClick={() => supprimerLivreur(livreur.id)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                title="Supprimer"
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>

      {livreurs.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <span className="text-4xl">🛵</span>
          <p className="mt-3">Aucun livreur enregistré</p>
        </div>
      )}
    </div>
  )
}
