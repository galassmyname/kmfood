import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'KM FOOD - Livraison de repas à Keur Massar',
  description: 'Commandez vos repas préférés et faites-les livrer à domicile à Keur Massar, Dakar.',
  keywords: 'livraison repas, Keur Massar, Dakar, food delivery, commande en ligne',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
