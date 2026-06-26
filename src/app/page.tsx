import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Restaurant, Plat } from '@/lib/supabase/types'
import MobileNav from '@/components/client/MobileNav'
import { CONFIG } from '@/lib/config'

async function getRestaurantsAvecPlats() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('restaurants')
      .select('*, plats(*)')
      .eq('actif', true)
      .order('nom')
    if (error) return []
    return data as (Restaurant & { plats: Plat[] })[]
  } catch {
    return []
  }
}

export default async function HomePage() {
  const restaurants = await getRestaurantsAvecPlats()
  const fallback = [
    { id: '1', nom: 'Claire de Lune', specialite: 'Tout type', contact: '77 134 54 78', actif: true, adresse: null, horaires: null, fiabilite: 5, notes: null, created_at: '', updated_at: '', plats: [] },
    { id: '2', nom: 'Rajab', specialite: 'Tout type', contact: '77 694 76 78', actif: true, adresse: null, horaires: null, fiabilite: 5, notes: null, created_at: '', updated_at: '', plats: [] },
  ]
  const displayRestaurants = restaurants.length > 0 ? restaurants : fallback

  return (
    <div className="min-h-screen bg-white">

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-orange-100 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🍔</span>
            <span className="text-xl font-bold text-orange-600">{CONFIG.NOM}</span>
          </Link>
          <div className="hidden md:flex items-center gap-5 text-sm font-medium text-gray-600">
            <a href="#menu" className="hover:text-orange-600 transition-colors">Menu</a>
            <a href="#comment-ca-marche" className="hover:text-orange-600 transition-colors">Comment ça marche</a>
            <a href="#zone" className="hover:text-orange-600 transition-colors">Zone</a>
            <a href="#paiement" className="hover:text-orange-600 transition-colors">Paiement</a>
            <a href="#contact" className="hover:text-orange-600 transition-colors">Contact</a>
            <Link href="/suivi" className="bg-orange-100 text-orange-700 hover:bg-orange-200 px-3 py-1.5 rounded-full transition-colors">
              📦 Suivi commande
            </Link>
          </div>
          <div className="hidden md:block">
            <a href={CONFIG.WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-2">
              <WhatsAppIcon /> Commander
            </a>
          </div>
          <MobileNav whatsappUrl={CONFIG.WHATSAPP_URL} />
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-20 bg-gradient-to-br from-orange-50 to-amber-50 min-h-screen flex items-center">
        <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block bg-orange-100 text-orange-700 text-sm font-semibold px-3 py-1 rounded-full mb-4">
              🚀 Livraison rapide à Keur Massar
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
              Vos repas préférés,{' '}
              <span className="text-orange-500">livrés chez vous</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              {CONFIG.NOM} commande pour vous dans les meilleurs restaurants de Keur Massar
              et vous livre directement à domicile. Simple, rapide, fiable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href={CONFIG.WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105 flex items-center justify-center gap-3 shadow-lg shadow-orange-200">
                <WhatsAppIcon className="w-6 h-6" />
                Commander sur WhatsApp
              </a>
              <Link href="/suivi"
                className="border-2 border-orange-300 text-orange-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-orange-50 transition-colors text-center flex items-center justify-center gap-2">
                📦 Suivre ma commande
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-4 text-sm text-gray-500">
              {['⚡ Livraison rapide', '💳 Wave & Orange Money', '📍 Keur Massar', '🔄 Suivi temps réel'].map(b => (
                <span key={b}>{b}</span>
              ))}
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <div className="relative">
              <div className="w-80 h-80 bg-orange-400 rounded-full opacity-10 absolute top-0 left-0" />
              <div className="relative z-10 text-center">
                <span className="text-9xl">🍽️</span>
                <div className="mt-4 bg-white rounded-2xl shadow-xl p-5 inline-block text-left">
                  <p className="font-bold text-gray-800 text-sm">Frais de livraison</p>
                  <p className="text-3xl font-extrabold text-orange-500 mt-1">
                    {CONFIG.FRAIS_LIVRAISON.toLocaleString('fr-FR')} FCFA
                  </p>
                  <p className="text-xs text-gray-400 mt-1">partout à Keur Massar</p>
                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 space-y-1">
                    <p>✅ Wave & Orange Money</p>
                    <p>✅ Cash à la livraison</p>
                    <p>✅ Suivi en temps réel</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section id="comment-ca-marche" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Comment ça marche ?</h2>
            <p className="text-gray-500">Aussi simple que d'envoyer un message</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { emoji: '📱', num: '1', title: 'Contactez-nous', desc: 'Envoyez un message WhatsApp à KM FOOD' },
              { emoji: '🍽️', num: '2', title: 'Choisissez', desc: 'On vous envoie le menu et vous choisissez' },
              { emoji: '📍', num: '3', title: 'Localisez-vous', desc: 'Partagez votre géolocalisation ou adresse' },
              { emoji: '🛵', num: '4', title: 'Recevez', desc: 'Votre livreur arrive rapidement chez vous' },
            ].map((step) => (
              <div key={step.num} className="text-center p-5 rounded-2xl bg-orange-50 hover:bg-orange-100 transition-colors">
                <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-3">{step.num}</div>
                <span className="text-3xl block mb-2">{step.emoji}</span>
                <h3 className="font-bold text-gray-800 mb-1 text-sm md:text-base">{step.title}</h3>
                <p className="text-xs md:text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <a href={CONFIG.WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105">
              <WhatsAppIcon className="w-6 h-6" />
              Je commande maintenant
            </a>
          </div>
        </div>
      </section>

      {/* MENU */}
      <section id="menu" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Nos restaurants partenaires</h2>
            <p className="text-gray-500">Les meilleurs établissements de Keur Massar</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {displayRestaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r as Restaurant & { plats: Plat[] }} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <a href={CONFIG.WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105">
              <WhatsAppIcon className="w-6 h-6" />
              Commander maintenant
            </a>
          </div>
        </div>
      </section>

      {/* ZONE */}
      <section id="zone" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Zone de livraison</h2>
              <p className="text-gray-600 mb-6">Nous couvrons l'ensemble de <strong>Keur Massar</strong> et ses environs.</p>
              <div className="space-y-2">
                {['Keur Massar Nord', 'Keur Massar Sud', 'Tivaouane Peulh', 'Malika', 'Yeumbeul'].map((q) => (
                  <div key={q} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                    <span className="text-gray-700">{q}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-5 bg-orange-50 rounded-2xl border border-orange-200">
                <p className="font-semibold text-orange-700 text-sm">📍 Frais de livraison fixes</p>
                <p className="text-3xl font-extrabold text-orange-600 mt-1">
                  {CONFIG.FRAIS_LIVRAISON.toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl p-8 text-center border border-orange-100">
              <span className="text-7xl">🗺️</span>
              <p className="mt-4 text-gray-600 font-medium">Partagez votre localisation</p>
              <a href={CONFIG.WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors">
                <WhatsAppIcon className="w-4 h-4" />
                Envoyer ma position
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SUIVI */}
      <section className="py-20 bg-orange-500 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-5xl">📦</span>
          <h2 className="text-3xl font-extrabold mt-4 mb-3">Suivez votre commande</h2>
          <p className="text-orange-100 text-lg mb-8">Suivez votre commande en temps réel grâce à votre numéro de commande.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/suivi"
              className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105 shadow-xl">
              📦 Suivre ma commande
            </Link>
            <a href={CONFIG.WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
              className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/50 px-8 py-4 rounded-2xl font-bold text-lg transition-colors flex items-center justify-center gap-2">
              <WhatsAppIcon className="w-5 h-5" />
              Demander sur WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* PAIEMENT */}
      <section id="paiement" className="py-20 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold mb-3">Modes de paiement</h2>
            <p className="text-gray-400">Payez comme vous voulez</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              { emoji: '🔵', label: 'Wave', desc: 'Scannez le QR code Wave de KM FOOD', badge: 'Recommandé' },
              { emoji: '🟠', label: 'Orange Money', desc: 'Scannez le QR code Orange Money', badge: null },
              { emoji: '💵', label: 'Cash à la livraison', desc: 'Payez en espèces à la réception', badge: null },
            ].map((p) => (
              <div key={p.label} className="bg-gray-800 rounded-2xl p-6 hover:bg-gray-700 transition-colors relative">
                {p.badge && <span className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{p.badge}</span>}
                <span className="text-4xl">{p.emoji}</span>
                <h3 className="text-xl font-bold mt-3 mb-2">{p.label}</h3>
                <p className="text-gray-400 text-sm">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/paiement"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
              Voir les QR codes →
            </Link>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Nous contacter</h2>
          <p className="text-gray-500 text-lg mb-10">Une question ? On est là sur WhatsApp !</p>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <a href={CONFIG.WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
              className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-2xl p-6 text-center transition-colors">
              <span className="text-4xl">💬</span>
              <h3 className="font-bold text-gray-800 mt-3 mb-1">WhatsApp</h3>
              <p className="text-green-700 font-semibold text-sm">{CONFIG.TELEPHONE}</p>
            </a>
            <a href={CONFIG.INSTAGRAM} target="_blank" rel="noopener noreferrer"
              className="bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-2xl p-6 text-center transition-colors">
              <span className="text-4xl">📸</span>
              <h3 className="font-bold text-gray-800 mt-3 mb-1">Instagram</h3>
              <p className="text-pink-600 font-semibold text-sm">@kmfood</p>
            </a>
            <a href={CONFIG.FACEBOOK} target="_blank" rel="noopener noreferrer"
              className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-2xl p-6 text-center transition-colors">
              <span className="text-4xl">👍</span>
              <h3 className="font-bold text-gray-800 mt-3 mb-1">Facebook</h3>
              <p className="text-blue-600 font-semibold text-sm">{CONFIG.NOM}</p>
            </a>
          </div>
          <a href={CONFIG.WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-10 py-5 rounded-2xl font-extrabold text-xl transition-all hover:scale-105 shadow-xl shadow-orange-200">
            <WhatsAppIcon className="w-7 h-7" />
            Commander sur WhatsApp
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🍔</span>
                <span className="text-white font-extrabold text-xl">{CONFIG.NOM}</span>
              </div>
              <p className="text-sm text-gray-500">Livraison de repas à {CONFIG.ZONE}.</p>
              <div className="flex gap-3 mt-4">
                <a href={CONFIG.INSTAGRAM} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center transition-colors">📸</a>
                <a href={CONFIG.FACEBOOK} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center transition-colors">👍</a>
                <a href={CONFIG.TIKTOK} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center transition-colors">🎵</a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Navigation</h4>
              <ul className="space-y-2 text-sm">
                {[
                  { href: '#menu', label: 'Menu' },
                  { href: '#comment-ca-marche', label: 'Comment ça marche' },
                  { href: '#zone', label: 'Zone de livraison' },
                  { href: '#paiement', label: 'Paiement' },
                  { href: '#contact', label: 'Contact' },
                ].map(l => (
                  <li key={l.href}><a href={l.href} className="hover:text-orange-400 transition-colors">{l.label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Services</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/suivi" className="hover:text-orange-400 transition-colors">📦 Suivre ma commande</Link></li>
                <li><Link href="/paiement" className="hover:text-orange-400 transition-colors">💳 Payer ma commande</Link></li>
                <li><a href={CONFIG.WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">💬 Commander sur WhatsApp</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2"><span>📞</span><a href={`tel:${CONFIG.WHATSAPP_NUMBER}`} className="hover:text-orange-400">{CONFIG.TELEPHONE}</a></li>
                <li className="flex gap-2"><span>📍</span><span>{CONFIG.ZONE}</span></li>
                <li className="flex gap-2"><span>🕐</span><span>Tous les jours</span></li>
              </ul>
              <div className="mt-4">
                <Link href="/admin" className="text-xs text-gray-700 hover:text-gray-500 transition-colors">Espace administration</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-600">
            © 2026 {CONFIG.NOM} — Tous droits réservés · {CONFIG.ZONE}
          </div>
        </div>
      </footer>

      {/* BARRE FIXE MOBILE */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 p-3 flex gap-3 z-40 shadow-2xl">
        <a href={CONFIG.WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
          <WhatsAppIcon className="w-4 h-4" />
          Commander
        </a>
        <Link href="/suivi"
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
          📦 Suivre
        </Link>
      </div>
      <div className="h-20 md:hidden" />
    </div>
  )
}

function RestaurantCard({ restaurant }: { restaurant: Restaurant & { plats: Plat[] } }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="bg-gradient-to-r from-orange-400 to-amber-400 h-2" />
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{restaurant.nom}</h3>
            <p className="text-gray-500 text-sm mt-0.5">{restaurant.specialite || 'Cuisine locale'}</p>
          </div>
          <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">● Disponible</span>
        </div>
        {restaurant.plats && restaurant.plats.length > 0 ? (
          <div className="space-y-1 mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menu</p>
            {restaurant.plats.slice(0, 5).map((plat) => (
              <div key={plat.id} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-gray-700 text-sm">{plat.nom}</span>
                <span className="font-bold text-orange-600 text-sm ml-3 whitespace-nowrap">{plat.prix.toLocaleString('fr-FR')} F</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm italic mb-4">Menu disponible sur WhatsApp</p>
        )}
        <a href={`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=Bonjour%20${encodeURIComponent(CONFIG.NOM)}%2C%20je%20voudrais%20commander%20chez%20${encodeURIComponent(restaurant.nom)}%20!`}
          target="_blank" rel="noopener noreferrer"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
          <WhatsAppIcon className="w-4 h-4" />
          Commander chez {restaurant.nom}
        </a>
      </div>
    </div>
  )
}

function WhatsAppIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}