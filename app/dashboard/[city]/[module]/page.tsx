'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { getCityById } from '@/lib/cities'
import { euromedCurriculum } from '@/lib/curriculum-euromed'
import { curriculum } from '@/lib/curriculum'
import type { Chapter } from '@/lib/content/types'
import Thorax3D from '@/components/Thorax3D'
import GLBModelViewer from '@/components/GLBModelViewer'
import MembreSuperieur3DViewerV4 from '@/components/MembreSuperieur3DViewerV4'

function ChapterContent({ chapter, gradient }: { chapter: Chapter; gradient: string }) {
  return (
    <article className="max-w-6xl mx-auto px-4 sm:px-6 py-8 select-none">
      {/* Header */}
      <div className="mb-8 max-w-3xl mx-auto">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">{chapter.professor}</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{chapter.title}</h1>

        {/* Key points — like bibmath's résumé bullets */}
        <div className={`bg-gradient-to-br ${gradient} bg-opacity-5 rounded-2xl p-5 mb-8`}>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Points clés</p>
          <ul className="space-y-2">
            {chapter.keyPoints.map((kp, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-teal-500 flex-shrink-0"/>
                <span className="text-sm text-gray-800 leading-relaxed">{kp.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-8 max-w-3xl mx-auto">
        {chapter.sections.map((sec, i) => (
          <section key={i}>
            <h2 className="text-base font-bold text-teal-700 border-b border-teal-100 pb-2 mb-4">
              {sec.heading}
            </h2>
            <div className="prose prose-sm max-w-none">
              {sec.body.split('\n').map((line, j) => {
                if (!line.trim()) return <div key={j} className="h-3"/>

                // Bold blocks like **text**
                const parts = line.split(/(\*\*[^*]+\*\*)/)
                const rendered = parts.map((p, k) =>
                  p.startsWith('**') && p.endsWith('**')
                    ? <strong key={k} className="font-semibold text-gray-900">{p.slice(2, -2)}</strong>
                    : <span key={k}>{p}</span>
                )

                // Bullet lines starting with •
                if (line.trimStart().startsWith('•')) {
                  return (
                    <div key={j} className="flex items-start gap-2 py-0.5">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0"/>
                      <p className="text-sm text-gray-700 leading-relaxed">{rendered}</p>
                    </div>
                  )
                }

                // Numbered lines like 1. 2. 3.
                if (/^\d+\./.test(line.trim())) {
                  const num = line.trim().match(/^(\d+)\./)?.[1]
                  return (
                    <div key={j} className="flex items-start gap-3 py-0.5">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{num}</span>
                      <p className="text-sm text-gray-700 leading-relaxed">{rendered}</p>
                    </div>
                  )
                }

                // Formula lines (contain = or → or ⁺ etc)
                if (/[=→⇌⁺⁻⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(line) && line.length < 120 && !line.includes(' ')) {
                  return (
                    <div key={j} className="my-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 font-mono text-sm text-center text-gray-800">
                      {line}
                    </div>
                  )
                }

                return (
                  <p key={j} className="text-sm text-gray-700 leading-relaxed py-0.5">{rendered}</p>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      {chapter.models3D?.map((model) => (
        model.viewer === 'membre-superieur-v4' ? (
          <section key={model.src} className="mt-10 border-t border-gray-100 pt-8">
            <div className="mb-5">
              <h2 className="text-base font-bold text-teal-700 mb-1">{model.title}</h2>
              {model.description && <p className="text-xs text-gray-400">{model.description}</p>}
            </div>
            <MembreSuperieur3DViewerV4 modelUrl={model.src} height={860} />
          </section>
        ) : (
          <GLBModelViewer
            key={model.src}
            title={model.title}
            description={model.description}
            src={model.src}
          />
        )
      ))}

      {chapter.model3D === 'thorax' && <Thorax3D/>}

      {chapter.sourcePages && chapter.sourcePages.length > 0 && (
        <section className="mt-10 max-w-3xl mx-auto">
          <div className="border-t border-gray-100 pt-8 mb-5">
            <h2 className="text-base font-bold text-teal-700 mb-1">{chapter.sourcePagesTitle ?? 'Cours complet'}</h2>
            <p className="text-xs text-gray-400">
              {chapter.sourcePagesSubtitle ?? `${chapter.sourcePages.length} pages du support original`}
            </p>
          </div>
          <div className="space-y-5">
            {chapter.sourcePages.map((page, index) => (
              <figure key={page.imageUrl} className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
                <Image
                  src={page.imageUrl}
                  alt={page.alt}
                  width={1440}
                  height={810}
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="w-full h-auto"
                  priority={index === 0}
                />
                <figcaption className="border-t border-gray-50 px-3 py-2 text-[11px] font-medium text-gray-400">
                  Page {index + 1}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}

export default function ModulePage() {
  const params = useParams()
  const cityId = params.city as string
  const moduleId = params.module as string
  const city = getCityById(cityId)
  const [activeChapterIdx, setActiveChapterIdx] = useState(0)
  const [chapterLoad, setChapterLoad] = useState<{
    moduleId: string
    chapters: Chapter[]
    error: boolean
  } | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch(`/api/module-chapters/${moduleId}`, { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('Impossible de charger les chapitres')
        return response.json() as Promise<{ chapters: Chapter[] }>
      })
      .then((data) => {
        if (!cancelled) setChapterLoad({ moduleId, chapters: data.chapters, error: false })
      })
      .catch(() => {
        if (!cancelled) setChapterLoad({ moduleId, chapters: [], error: true })
      })

    return () => {
      cancelled = true
    }
  }, [moduleId])

  if (!city) return null

  const isEuromed = cityId === 'fes-euromed'
  let moduleData: { title: string; subtitle?: string; description: string; icon: string; has3D: boolean; subModules?: string[] } | null = null
  let semesterLabel = ''

  if (isEuromed) {
    for (const year of euromedCurriculum) {
      for (const sem of year.semesters) {
        const found = sem.modules.find((m) => m.id === moduleId)
        if (found) { moduleData = found; semesterLabel = sem.label; break }
      }
    }
  } else {
    for (const year of curriculum) {
      const found = year.modules.find((m) => m.id === moduleId)
      if (found) { moduleData = { ...found }; break }
    }
  }

  if (!moduleData) return null

  const loadedModule = chapterLoad?.moduleId === moduleId ? chapterLoad : null
  const chapters = loadedModule?.chapters ?? null
  const loadError = loadedModule?.error ?? false
  const activeChapter = chapters?.[activeChapterIdx] ?? null

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-full px-6 h-14 flex items-center gap-4">
          <Link href={`/dashboard/${cityId}`} className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
            <span className="text-sm hidden sm:block">{city.name}</span>
          </Link>
          <span className="text-gray-300">/</span>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-medium text-gray-700 truncate">{moduleData.title}</span>
            {semesterLabel && <span className="text-xs text-gray-400 hidden sm:block flex-shrink-0">· {semesterLabel}</span>}
          </div>
          <div className="ml-auto flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
          </div>
        </div>
      </nav>

      {chapters === null ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-12">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Chargement des cours</h3>
            <p className="text-gray-500 text-sm">Les chapitres du module arrivent.</p>
          </div>
        </div>
      ) : chapters.length > 0 ? (
        <div className="flex flex-1 overflow-hidden max-md:flex-col" style={{ height: 'calc(100vh - 56px)' }}>
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0 bg-gray-50 border-r border-gray-100 flex flex-col overflow-hidden max-md:w-full max-md:max-h-72 max-md:border-r-0 max-md:border-b">
            {/* Module header */}
            <div className={`bg-gradient-to-br ${city.gradient} p-4 text-white`}>
              <div className="text-2xl mb-1">{moduleData.icon}</div>
              <h2 className="font-bold text-sm">{moduleData.title}</h2>
              <p className="text-white/60 text-xs mt-0.5">{chapters.length} chapitres</p>
            </div>

            {/* Chapter list */}
            <div className="flex-1 overflow-y-auto py-3">
              {/* Group by professor */}
              {Array.from(new Set(chapters.map(c => c.professor))).map(prof => (
                <div key={prof} className="mb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 mb-1">{prof}</p>
                  {chapters.filter(c => c.professor === prof).map((ch) => {
                    const idx = chapters.indexOf(ch)
                    return (
                      <button
                        key={ch.id}
                        onClick={() => setActiveChapterIdx(idx)}
                        className={`w-full text-left px-4 py-2.5 text-xs transition-all ${
                          activeChapterIdx === idx
                            ? 'bg-teal-600 text-white font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {ch.title}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Nav footer */}
            <div className="border-t border-gray-100 p-3 flex justify-between">
              <button
                onClick={() => setActiveChapterIdx(Math.max(0, activeChapterIdx - 1))}
                disabled={activeChapterIdx === 0}
                className="text-xs text-gray-400 disabled:opacity-30 hover:text-teal-600 transition-colors px-2 py-1"
              >
                ← Précédent
              </button>
              <span className="text-xs text-gray-300">{activeChapterIdx + 1}/{chapters.length}</span>
              <button
                onClick={() => setActiveChapterIdx(Math.min(chapters.length - 1, activeChapterIdx + 1))}
                disabled={activeChapterIdx === chapters.length - 1}
                className="text-xs text-gray-400 disabled:opacity-30 hover:text-teal-600 transition-colors px-2 py-1"
              >
                Suivant →
              </button>
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto bg-white">
            {activeChapter ? (
              <ChapterContent chapter={activeChapter} gradient={city.gradient}/>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                Sélectionne un chapitre
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-12">
              <div className="text-5xl mb-4">📝</div>
            <h3 className="text-base font-bold text-gray-900 mb-2">
              {loadError ? 'Erreur de chargement' : 'Contenu en cours d&apos;ajout'}
            </h3>
            <p className="text-gray-500 text-sm">
              {loadError ? 'Recharge la page pour relancer le chargement des cours.' : 'Ce module sera disponible prochainement.'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
