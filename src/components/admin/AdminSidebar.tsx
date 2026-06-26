'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import clsx from 'clsx'

const navItems = [
  { href: '/admin', label: 'Dashboard', emoji: '📊' },
  { href: '/admin/commandes', label: 'Commandes', emoji: '📦' },
  { href: '/admin/livreurs', label: 'Livreurs', emoji: '🛵' },
  { href: '/admin/restaurants', label: 'Restaurants', emoji: '🍽️' },
  { href: '/admin/revenus', label: 'Revenus', emoji: '💰' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
async function handleLogout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  // Effacer tous les cookies manuellement au cas où
  document.cookie.split(';').forEach(cookie => {
    const name = cookie.split('=')[0].trim()
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  })
  window.location.href = '/admin/login'
}

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-gray-900 text-white flex-col z-40">
        
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🍔</span>
            <div>
              <p className="font-extrabold text-white">KM FOOD</p>
              <p className="text-xs text-gray-400">Administration</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                )}
              >
                <span className="text-lg">{item.emoji}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          
          {/* FIX ICI */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
          >
            <span>🌐</span> Voir le site
          </a>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-all text-left"
          >
            <span>🚪</span> Déconnexion
          </button>
        </div>

      </aside>

      {/* Bottom nav mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 text-white z-40 flex border-t border-gray-800">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex-1 flex flex-col items-center py-3 text-xs transition-colors',
                isActive ? 'text-orange-400' : 'text-gray-500'
              )}
            >
              <span className="text-xl">{item.emoji}</span>
              <span className="mt-0.5 leading-none">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}