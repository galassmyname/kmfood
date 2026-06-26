import Link from 'next/link'

export default function SuiviNotFound() {
  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="text-center">
        <span className="text-6xl">🔍</span>
        <h1 className="text-2xl font-extrabold text-gray-900 mt-4">Commande introuvable</h1>
        <p className="text-gray-500 mt-2">
          Le numéro de commande saisi n'existe pas ou est incorrect.
        </p>
        <div className="mt-6 space-y-3">
          <Link
            href="/suivi"
            className="block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-colors"
          >
            Réessayer
          </Link>
          <a
            href="https://wa.me/221772886689"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold transition-colors"
          >
            Contacter KM FOOD
          </a>
        </div>
      </div>
    </div>
  )
}
