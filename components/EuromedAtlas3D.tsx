'use client'

import { useMemo, useRef, useState } from 'react'
import Medical3DViewerUniversalPremium from './Medical3DViewerUniversalPremium'

type AtlasModel = {
  id: string
  title: string
  subtitle: string
  modelUrl: string
}

const atlasModelsByModule: Record<string, AtlasModel[]> = {
  'anatomie-2-s2': [
    {
      id: 'abdomen_premium',
      title: 'Atlas abdomen premium',
      subtitle: 'Paroi, viscères, rétro-péritoine, reins, vaisseaux et repères cliniques.',
      modelUrl: '/models/euromed/s1/anatomie/abdomen_premium.glb',
    },
    {
      id: 'membre_inferieur_premium',
      title: 'Atlas membre inférieur premium',
      subtitle: 'Os, muscles, plexus lombo-sacré, nerf sciatique, vaisseaux et pied.',
      modelUrl: '/models/euromed/s1/anatomie/membre_inferieur_premium.glb',
    },
  ],
  'biophysique-s2': [
    {
      id: 'radiologie_rx_premium',
      title: 'Rayons X et radiologie',
      subtitle: 'Tube, électrons, anode, filtration, atténuation patient et détecteur.',
      modelUrl: '/models/euromed/s1/biophysique/radiologie_rx_premium.glb',
    },
    {
      id: 'radiobiologie_premium',
      title: 'Radiobiologie cellulaire',
      subtitle: 'Cellule, ADN, radiations, radicaux libres, lésions et réparation.',
      modelUrl: '/models/euromed/s1/biophysique/radiobiologie_premium.glb',
    },
    {
      id: 'circulation_premium',
      title: 'Circulation et hémodynamique',
      subtitle: 'Pression, débit, continuité, sténose et écoulement laminaire.',
      modelUrl: '/models/euromed/s1/biophysique/circulation_premium.glb',
    },
    {
      id: 'transports_membranaires_premium',
      title: 'Transports membranaires',
      subtitle: 'Bicouche lipidique, canaux, pompes, flux ioniques, diffusion et osmose.',
      modelUrl: '/models/euromed/s1/biophysique/transports_membranaires_premium.glb',
    },
    {
      id: 'compartiments_liquidiens_premium',
      title: 'Compartiments liquidiens',
      subtitle: 'Eau totale, CIC, CEC, plasma, interstitium, sang et traceurs.',
      modelUrl: '/models/euromed/s1/biophysique/compartiments_liquidiens_premium.glb',
    },
    {
      id: 'equilibre_hydrosode_premium',
      title: 'Équilibre hydrosodé',
      subtitle: 'Rein, néphron, ADH, aldostérone, réabsorption eau et sodium.',
      modelUrl: '/models/euromed/s1/biophysique/equilibre_hydrosode_premium.glb',
    },
    {
      id: 'acide_base_premium',
      title: 'Équilibre acido-basique',
      subtitle: 'pH, couples acide/base, tampons et Davenport.',
      modelUrl: '/models/euromed/s1/biophysique/acide_base_premium.glb',
    },
    {
      id: 'oxydoreduction_premium',
      title: 'Oxydo-réduction',
      subtitle: 'Anode, cathode, pont salin, transfert d’électrons et potentiel.',
      modelUrl: '/models/euromed/s1/biophysique/oxydoreduction_premium.glb',
    },
    {
      id: 'optique_vision_audition_premium',
      title: 'Optique, vision et audition',
      subtitle: 'Œil, lentilles, rayons, laser médical et cochlée.',
      modelUrl: '/models/euromed/s1/biophysique/optique_vision_audition_premium.glb',
    },
  ],
  'histologie-embryologie-1-s2': [
    {
      id: 'radiobiologie_premium',
      title: 'Atlas cellule et ADN',
      subtitle: 'Cellule, noyau, ADN et interactions microscopiques utiles au module.',
      modelUrl: '/models/euromed/s1/biophysique/radiobiologie_premium.glb',
    },
    {
      id: 'transports_membranaires_premium',
      title: 'Membrane cellulaire premium',
      subtitle: 'Bicouche, protéines membranaires, canaux, ions et flux.',
      modelUrl: '/models/euromed/s1/biophysique/transports_membranaires_premium.glb',
    },
  ],
  'histoire-psycho-socio-s2': [
    {
      id: 'shs_psy_medicale_premium',
      title: 'SHS et psychologie médicale',
      subtitle: 'Modèle biopsychosocial, relation médecin-malade, émotions et déterminants sociaux.',
      modelUrl: '/models/euromed/s1/shs/shs_psy_medicale_premium.glb',
    },
  ],
  'techniques-communication-s2': [
    {
      id: 'shs_psy_medicale_premium',
      title: 'Relation soignant-soigné',
      subtitle: 'Alliance thérapeutique, information, écoute clinique et interaction sociale.',
      modelUrl: '/models/euromed/s1/shs/shs_psy_medicale_premium.glb',
    },
  ],
}

export function getEuromedAtlasModels(moduleId: string) {
  return atlasModelsByModule[moduleId] ?? null
}

export default function EuromedAtlas3D({ moduleId, title }: { moduleId: string; title: string }) {
  const models = useMemo(() => getEuromedAtlasModels(moduleId), [moduleId])
  const [activeId, setActiveId] = useState(models?.[0]?.id ?? '')
  const rootRef = useRef<HTMLDivElement | null>(null)

  if (!models?.length) return null

  const active = models.find((model) => model.id === activeId) ?? models[0]

  return (
    <section className="mt-10 border-t border-gray-100 pt-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">Atlas 3D premium</p>
          <h2 className="text-base font-bold text-gray-900">{active.title}</h2>
          <p className="text-xs text-gray-400">{active.subtitle} · {title}</p>
        </div>
        <button
          type="button"
          onClick={() => rootRef.current?.requestFullscreen()}
          className="rounded-md bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-black"
        >
          Plein écran
        </button>
      </div>

      {models.length > 1 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {models.map((model) => (
            <button
              key={model.id}
              type="button"
              onClick={() => setActiveId(model.id)}
              className={`shrink-0 rounded-md border px-3 py-2 text-xs font-semibold ${
                active.id === model.id
                  ? 'border-teal-500 bg-teal-500 text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {model.title}
            </button>
          ))}
        </div>
      )}

      <div ref={rootRef} className="overflow-hidden rounded-lg border border-gray-900 bg-gray-950">
        <Medical3DViewerUniversalPremium key={active.id} title={active.title} modelUrl={active.modelUrl} height={760} />
      </div>
    </section>
  )
}
