export interface Module {
  id: string
  title: string
  titleFr: string
  description: string
  has3D: boolean
  icon: string
  chaptersCount: number
}

export interface Year {
  year: number
  label: string
  modules: Module[]
}

export const curriculum: Year[] = [
  {
    year: 1,
    label: '1ère Année — PCEM1',
    modules: [
      { id: 'anatomie-1', title: 'Anatomie Générale', titleFr: 'Anatomie', description: 'Étude des structures du corps humain', has3D: true, icon: '🦴', chaptersCount: 12 },
      { id: 'histologie-1', title: 'Histologie & Embryologie', titleFr: 'Histologie', description: 'Étude des tissus et du développement', has3D: false, icon: '🔬', chaptersCount: 10 },
      { id: 'biochimie-1', title: 'Biochimie Structurale', titleFr: 'Biochimie', description: 'Molécules du vivant : protéines, lipides, glucides', has3D: false, icon: '⚗️', chaptersCount: 8 },
      { id: 'physio-1', title: 'Physiologie Générale', titleFr: 'Physiologie', description: 'Fonctions normales de l\'organisme', has3D: false, icon: '💓', chaptersCount: 9 },
      { id: 'biophysique-1', title: 'Biophysique', titleFr: 'Biophysique', description: 'Physique appliquée à la médecine', has3D: false, icon: '⚡', chaptersCount: 7 },
      { id: 'chimie-1', title: 'Chimie Générale & Organique', titleFr: 'Chimie', description: 'Bases chimiques pour la biochimie médicale', has3D: false, icon: '🧪', chaptersCount: 8 },
    ],
  },
  {
    year: 2,
    label: '2ème Année — PCEM2',
    modules: [
      { id: 'anatomie-2', title: 'Anatomie Topographique', titleFr: 'Anatomie', description: 'Membres, tronc, tête et cou', has3D: true, icon: '🦴', chaptersCount: 15 },
      { id: 'physio-2', title: 'Physiologie des Systèmes', titleFr: 'Physiologie', description: 'Cardio-vasculaire, respiratoire, digestif', has3D: true, icon: '❤️', chaptersCount: 14 },
      { id: 'micro-2', title: 'Microbiologie & Virologie', titleFr: 'Microbiologie', description: 'Bactéries, virus et agents infectieux', has3D: false, icon: '🦠', chaptersCount: 11 },
      { id: 'parasito-2', title: 'Parasitologie & Mycologie', titleFr: 'Parasitologie', description: 'Parasites, champignons pathogènes', has3D: false, icon: '🔍', chaptersCount: 9 },
      { id: 'pharma-2', title: 'Pharmacologie Générale', titleFr: 'Pharmacologie', description: 'Mécanismes d\'action des médicaments', has3D: false, icon: '💊', chaptersCount: 10 },
      { id: 'semio-2', title: 'Séméiologie Médicale', titleFr: 'Séméiologie', description: 'Signes et symptômes cliniques', has3D: false, icon: '🩺', chaptersCount: 12 },
    ],
  },
  {
    year: 3,
    label: '3ème Année — DCEM1',
    modules: [
      { id: 'cardio-3', title: 'Cardiologie', titleFr: 'Cardiologie', description: 'Maladies du cœur et des vaisseaux', has3D: true, icon: '❤️', chaptersCount: 16 },
      { id: 'pneumo-3', title: 'Pneumologie', titleFr: 'Pneumologie', description: 'Maladies respiratoires', has3D: false, icon: '🫁', chaptersCount: 12 },
      { id: 'gastro-3', title: 'Gastro-entérologie', titleFr: 'Gastro', description: 'Maladies digestives', has3D: false, icon: '🫀', chaptersCount: 13 },
      { id: 'neuro-3', title: 'Neurologie', titleFr: 'Neurologie', description: 'Système nerveux central et périphérique', has3D: true, icon: '🧠', chaptersCount: 14 },
      { id: 'chir-3', title: 'Chirurgie Générale', titleFr: 'Chirurgie', description: 'Techniques opératoires fondamentales', has3D: false, icon: '🔪', chaptersCount: 10 },
      { id: 'gyneco-3', title: 'Gynécologie-Obstétrique', titleFr: 'Gynéco-Obstétrique', description: 'Santé féminine et obstétrique', has3D: false, icon: '👶', chaptersCount: 11 },
    ],
  },
  {
    year: 4,
    label: '4ème Année — DCEM2',
    modules: [
      { id: 'pedia-4', title: 'Pédiatrie', titleFr: 'Pédiatrie', description: 'Médecine de l\'enfant', has3D: false, icon: '🍼', chaptersCount: 13 },
      { id: 'derma-4', title: 'Dermatologie', titleFr: 'Dermatologie', description: 'Maladies de la peau', has3D: false, icon: '🩹', chaptersCount: 10 },
      { id: 'ophta-4', title: 'Ophtalmologie', titleFr: 'Ophtalmologie', description: 'Maladies des yeux', has3D: true, icon: '👁️', chaptersCount: 9 },
      { id: 'oto-4', title: 'ORL', titleFr: 'ORL', description: 'Oreille, nez, gorge', has3D: false, icon: '👂', chaptersCount: 8 },
      { id: 'ortho-4', title: 'Orthopédie & Traumatologie', titleFr: 'Orthopédie', description: 'Chirurgie osseuse et articulaire', has3D: true, icon: '🦿', chaptersCount: 12 },
      { id: 'nephro-4', title: 'Néphrologie & Urologie', titleFr: 'Néphrologie', description: 'Maladies rénales et voies urinaires', has3D: false, icon: '🫘', chaptersCount: 11 },
    ],
  },
  {
    year: 5,
    label: '5ème Année — DCEM3',
    modules: [
      { id: 'endo-5', title: 'Endocrinologie & Diabétologie', titleFr: 'Endocrinologie', description: 'Hormones et maladies métaboliques', has3D: false, icon: '🔬', chaptersCount: 12 },
      { id: 'hemato-5', title: 'Hématologie', titleFr: 'Hématologie', description: 'Maladies du sang', has3D: false, icon: '🩸', chaptersCount: 10 },
      { id: 'infecto-5', title: 'Maladies Infectieuses', titleFr: 'Infectiologie', description: 'Infections bactériennes, virales, parasitaires', has3D: false, icon: '🦠', chaptersCount: 14 },
      { id: 'onco-5', title: 'Oncologie Médicale', titleFr: 'Oncologie', description: 'Cancers — diagnostic et traitement', has3D: false, icon: '⚕️', chaptersCount: 11 },
      { id: 'urgences-5', title: 'Médecine d\'Urgence', titleFr: 'Urgences', description: 'Prise en charge des urgences vitales', has3D: false, icon: '🚨', chaptersCount: 13 },
      { id: 'psychiatrie-5', title: 'Psychiatrie', titleFr: 'Psychiatrie', description: 'Maladies mentales et troubles du comportement', has3D: false, icon: '🧠', chaptersCount: 10 },
    ],
  },
  {
    year: 6,
    label: '6ème Année — DCEM4 / Externat',
    modules: [
      { id: 'stage-cardio-6', title: 'Stage : Cardiologie', titleFr: 'Stage Cardio', description: 'Stage clinique en cardiologie hospitalière', has3D: false, icon: '🏥', chaptersCount: 4 },
      { id: 'stage-chir-6', title: 'Stage : Chirurgie', titleFr: 'Stage Chirurgie', description: 'Stage en bloc opératoire', has3D: false, icon: '🏥', chaptersCount: 4 },
      { id: 'stage-pediat-6', title: 'Stage : Pédiatrie', titleFr: 'Stage Pédiatrie', description: 'Stage en service de pédiatrie', has3D: false, icon: '🏥', chaptersCount: 4 },
      { id: 'stage-gyneco-6', title: 'Stage : Gynéco-Obstétrique', titleFr: 'Stage Gynéco', description: 'Stage en maternité', has3D: false, icon: '🏥', chaptersCount: 4 },
      { id: 'medecine-legale-6', title: 'Médecine Légale & Éthique', titleFr: 'Médecine Légale', description: 'Droit médical, déontologie, éthique', has3D: false, icon: '⚖️', chaptersCount: 6 },
      { id: 'sante-pub-6', title: 'Santé Publique & Épidémiologie', titleFr: 'Santé Publique', description: 'Organisation du système de santé marocain', has3D: false, icon: '📊', chaptersCount: 8 },
    ],
  },
]
