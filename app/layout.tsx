import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MedMaroc — Études de Médecine au Maroc',
  description: 'Plateforme de cours de médecine pour les étudiants marocains avec contenus 3D animés',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full bg-white">{children}</body>
    </html>
  )
}
