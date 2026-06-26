// Page publique pour afficher les QR codes de paiement
// Accessible depuis le dashboard lors de la création d'une commande

export default function PaiementPage({
  searchParams,
}: {
  searchParams: { montant?: string; commande?: string }
}) {
  const montant = searchParams.montant || '0'
  const numero = searchParams.commande || ''

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <span className="text-4xl">🍔</span>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-2">KM FOOD</h1>
          {numero && (
            <p className="text-gray-500 mt-1">Commande {numero}</p>
          )}
        </div>

        {montant !== '0' && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-center mb-6">
            <p className="text-gray-600">Montant à payer</p>
            <p className="text-4xl font-extrabold text-orange-600 mt-1">
              {parseInt(montant).toLocaleString('fr-FR')} FCFA
            </p>
          </div>
        )}

        <div className="space-y-4">
          {/* Wave */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">W</div>
              <h2 className="text-xl font-bold text-gray-800">Payer avec Wave</h2>
            </div>
            {/* Placeholder QR code - à remplacer par le vrai QR code KM FOOD */}
            <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl mx-auto flex items-center justify-center text-gray-400 text-sm">
              <div className="text-center">
                <span className="text-4xl">📱</span>
                <p className="mt-2">QR Code Wave</p>
                <p className="text-xs">à configurer</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              1. Ouvrez l'app Wave<br />
              2. Scannez le QR code<br />
              3. Entrez le montant et confirmez
            </p>
          </div>

          {/* Orange Money */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">OM</div>
              <h2 className="text-xl font-bold text-gray-800">Orange Money</h2>
            </div>
            {/* Placeholder QR code - à remplacer par le vrai QR code KM FOOD */}
            <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl mx-auto flex items-center justify-center text-gray-400 text-sm">
              <div className="text-center">
                <span className="text-4xl">📱</span>
                <p className="mt-2">QR Code Orange Money</p>
                <p className="text-xs">à configurer</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              1. Ouvrez l'app Orange Money<br />
              2. Scannez le QR code<br />
              3. Entrez le montant et confirmez
            </p>
          </div>

          {/* Cash */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            <span className="text-4xl">💵</span>
            <h2 className="text-xl font-bold text-gray-800 mt-2">Paiement en espèces</h2>
            <p className="text-gray-500 text-sm mt-2">
              Préparez la somme exacte et remettez-la à votre livreur à la réception de votre commande.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          KM FOOD · Keur Massar, Dakar
        </p>
      </div>
    </div>
  )
}
