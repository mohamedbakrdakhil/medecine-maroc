import Link from 'next/link'
import { cities, type City } from '@/lib/cities'

export default function DashboardPage() {
  const publicCities = cities.filter((c) => c.type === 'public')
  const privateCities = cities.filter((c) => c.type === 'private')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-semibold text-gray-900">MedMaroc</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">🇲🇦 Étudiant en médecine</span>
            <Link
              href="/api/auth/signout"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Déconnexion
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 rounded-full px-3 py-1 text-xs font-medium mb-4">
            <span>🏥</span>
            <span>{cities.length} facultés disponibles</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Choisissez votre faculté
          </h1>
          <p className="text-gray-500">
            Accédez au programme officiel de médecine de votre ville avec des cours 3D animés
          </p>
        </div>

        {/* Facultés publiques */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"/>
              Facultés publiques
            </span>
            <div className="flex-1 h-px bg-gray-100"/>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {publicCities.map((city) => (
              <CityCard key={city.id} city={city} />
            ))}
            {['Meknès', 'Béni Mellal'].map((name) => (
              <ComingSoonCard key={name} name={name} />
            ))}
          </div>
        </section>

        {/* Facultés privées */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"/>
              Facultés privées
            </span>
            <div className="flex-1 h-px bg-gray-100"/>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {privateCities.map((city) => (
              <CityCard key={city.id} city={city} />
            ))}
          </div>
        </section>

        {/* Info banner */}
        <div className="bg-gradient-to-r from-red-900 to-red-800 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-full opacity-10">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path fill="white" d="M100 0 L200 100 L100 200 L0 100 Z"/>
            </svg>
          </div>
          <div className="relative z-10 max-w-lg">
            <div className="text-2xl mb-2">🫀</div>
            <h3 className="text-xl font-bold mb-2">Contenus 3D animés — Bientôt</h3>
            <p className="text-red-200 text-sm leading-relaxed">
              Des modèles anatomiques 3D interactifs (cœur, cerveau, os, système nerveux...) seront intégrés
              dans chaque cours. Visualise l&apos;anatomie comme jamais tu ne l&apos;as vu.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

function CityCard({ city }: { city: City }) {
  return (
    <Link
      href={`/dashboard/${city.id}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
    >
      <div className={`h-32 bg-gradient-to-br ${city.gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`p-${city.id}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#p-${city.id})`}/>
          </svg>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl">{city.icon}</span>
        </div>
        <div className="absolute top-3 left-3">
          <span className={`text-white text-xs font-semibold rounded-full px-2 py-0.5 ${city.type === 'private' ? 'bg-blue-500/70' : 'bg-green-600/70'} backdrop-blur-sm`}>
            {city.type === 'private' ? 'Privé' : 'Public'}
          </span>
        </div>
        <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
          <span className="text-white text-xs font-medium">Est. {city.founded}</span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-lg font-bold text-gray-900 group-hover:text-red-700 transition-colors">
            {city.name}
          </h2>
          <span className="text-gray-400 text-sm">{city.nameAr}</span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed mb-3">
          {city.university}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 bg-gray-50 rounded-full px-2 py-0.5">
            {city.univShort}
          </span>
          <div className="flex items-center gap-1 text-red-600 text-xs font-medium">
            <span>Accéder</span>
            <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}

function ComingSoonCard({ name }: { name: string }) {
  return (
    <div className="block bg-white rounded-2xl overflow-hidden border border-dashed border-gray-200 opacity-50">
      <div className="h-32 bg-gray-100 flex items-center justify-center">
        <span className="text-3xl opacity-40">🏗️</span>
      </div>
      <div className="p-5">
        <h2 className="text-lg font-bold text-gray-400 mb-1">{name}</h2>
        <p className="text-xs text-gray-400">Programme en cours de configuration</p>
        <div className="mt-3">
          <span className="text-xs bg-gray-100 text-gray-400 rounded-full px-2 py-0.5">
            Bientôt disponible
          </span>
        </div>
      </div>
    </div>
  )
}
