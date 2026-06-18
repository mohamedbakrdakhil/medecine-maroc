import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCityById } from '@/lib/cities'
import { curriculum } from '@/lib/curriculum'
import { euromedCurriculum } from '@/lib/curriculum-euromed'

interface Props {
  params: Promise<{ city: string }>
}

export default async function CityPage({ params }: Props) {
  const { city: cityId } = await params
  const city = getCityById(cityId)
  if (!city) notFound()

  const isEuromed = cityId === 'fes-euromed'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
            <span className="text-sm">Facultés</span>
          </Link>
          <span className="text-gray-300">/</span>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${city.gradient} flex items-center justify-center text-xs`}>
              {city.icon}
            </div>
            <span className="text-sm font-medium text-gray-700">{city.name}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className={`bg-gradient-to-br ${city.gradient} text-white`}>
        <div className="max-w-7xl mx-auto px-6 py-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="hero-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M30 0 L60 30 L30 60 L0 30 Z" fill="none" stroke="white" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hero-pattern)"/>
            </svg>
          </div>
          <div className="relative z-10">
            <div className="text-5xl mb-4">{city.icon}</div>
            <h1 className="text-3xl font-bold mb-1">{city.university}</h1>
            <p className="text-white/70 text-sm mb-4">{city.univShort} · Fondée en {city.founded}</p>
            <div className="flex flex-wrap gap-3">
              <div className="bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm">
                📚 6 années de programme
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm">
                🫀 Cours 3D animés — En cours
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm">
                {city.type === 'private' ? '🏫 Université privée' : '🏥 Université publique'} · Maroc
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        {isEuromed ? (
          /* Euromed — curriculum par semestre avec vrais modules */
          <>
            {euromedCurriculum.map((year) => (
              <section key={year.year}>
                {/* Year header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${city.gradient} flex items-center justify-center text-white font-bold text-sm`}>
                    {year.year}
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">{year.label}</h2>
                </div>

                {/* Semesters */}
                <div className="space-y-8">
                  {year.semesters.map((sem) => (
                    <div key={sem.semester}>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xs font-semibold text-teal-700 bg-teal-50 rounded-full px-3 py-1">
                          {sem.label}
                        </span>
                        <div className="flex-1 h-px bg-gray-100"/>
                      </div>

                      {sem.modules.length === 0 ? (
                        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-6 text-center">
                          <p className="text-gray-400 text-sm">Contenu en cours d&apos;ajout</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {sem.modules.map((mod) => (
                            <Link
                              key={mod.id}
                              href={`/dashboard/${cityId}/${mod.id}`}
                              className="group bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden block"
                            >
                              {mod.has3D && (
                                <div className="absolute top-3 right-3">
                                  <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full px-2 py-0.5">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"/>
                                    3D
                                  </span>
                                </div>
                              )}

                              <div className="text-2xl mb-3">{mod.icon}</div>
                              <h3 className="font-semibold text-gray-900 text-sm mb-0.5 pr-8">{mod.title}</h3>
                              <p className="text-xs text-teal-600 font-medium mb-2">{mod.subtitle}</p>
                              <p className="text-gray-500 text-xs leading-relaxed mb-3">{mod.description}</p>

                              {/* Sub-modules */}
                              <div className="space-y-1 mb-4">
                                {mod.subModules.map((sub) => (
                                  <div key={sub} className="flex items-center gap-1.5 text-xs text-gray-400">
                                    <span className="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0"/>
                                    {sub}
                                  </div>
                                ))}
                              </div>

                              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">
                                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"/>
                                  Cours disponibles
                                </span>
                                <div className="flex items-center gap-1 text-xs font-medium text-gray-400 group-hover:text-teal-600 transition-colors">
                                  <span>Voir</span>
                                  <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                                  </svg>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </>
        ) : (
          /* Autres facultés — curriculum générique */
          <>
            {curriculum.map((year) => (
              <section key={year.year}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${city.gradient} flex items-center justify-center text-white font-bold text-sm`}>
                    {year.year}
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">{year.label}</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {year.modules.map((mod) => (
                    <Link
                      key={mod.id}
                      href={`/dashboard/${cityId}/${mod.id}`}
                      className="group bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden block"
                    >
                      {mod.has3D && (
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full px-2 py-0.5">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"/>
                            3D
                          </span>
                        </div>
                      )}
                      <div className="text-2xl mb-3">{mod.icon}</div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 pr-8">{mod.title}</h3>
                      <p className="text-gray-500 text-xs leading-relaxed mb-4">{mod.description}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                        <span className="text-xs text-gray-400">{mod.chaptersCount} chapitres</span>
                        <div className="flex items-center gap-1 text-xs font-medium text-gray-400 group-hover:text-red-600 transition-colors">
                          <span>Voir le cours</span>
                          <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </>
        )}

        {/* Bottom CTA */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="text-3xl mb-3">🚀</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Programme complet disponible</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Les contenus 3D animés seront disponibles module par module.
            Abonne-toi pour être notifié dès qu&apos;un nouveau cours 3D est publié.
          </p>
          <button className="mt-5 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:from-red-700 hover:to-red-800 transition-all shadow-sm">
            Me notifier des nouveaux cours
          </button>
        </div>
      </main>
    </div>
  )
}
