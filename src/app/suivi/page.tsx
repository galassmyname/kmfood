'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CONFIG } from '@/lib/config'

export default function SuiviSearchPage() {
  const [numero, setNumero] = useState('')
  const router = useRouter()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const clean = numero.trim().toUpperCase()
    if (clean) router.push(`/suivi/${clean}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex flex-col">
      <div className="bg-white border-b border-orange-100 px-4 py-4">
        <div className="max-w-lg mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🍔</span>
            <span className="font-extrabold text-orange-600">KM FOOD</span>
          </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <span className="text-6xl">📦</span>
            <h1 className="text-2xl font-extrabold text-gray-900 mt-4">Suivre ma commande</h1>
            <p className="text-gray-500 mt-2">
              Entrez votre numéro de commande (ex: KMF-20260401-001)
            </p>
          </div>

          <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <input
              type="text"
              value={numero}
              onChange={e => setNumero(e.target.value)}
              placeholder="KMF-XXXXXXXX-XXX"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center font-mono text-lg focus:outline-none focus:ring-2 focus:ring-orange-400 uppercase"
              autoFocus
            />
            <button
              type="submit"
              disabled={!numero.trim()}
              className="w-full mt-4 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-3 rounded-xl font-bold transition-colors"
            >
              Suivre ma commande
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-400">
            Votre numéro de commande vous a été communiqué par KM FOOD sur WhatsApp
          </p>

          <div className="text-center mt-4">
            <a
              href={CONFIG.WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 text-sm font-medium hover:underline"
            >
              Besoin d'aide ? Contactez-nous →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
