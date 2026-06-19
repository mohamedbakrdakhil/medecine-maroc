export interface EuromedModule {
  id: string
  title: string
  subtitle: string
  description: string
  has3D: boolean
  icon: string
  subModules: string[]
  hasFiles: boolean
}

export interface EuromedSemester {
  semester: number
  label: string
  modules: EuromedModule[]
}

export interface EuromedYear {
  year: number
  label: string
  semesters: EuromedSemester[]
}

export const euromedCurriculum: EuromedYear[] = [
  {
    year: 1,
    label: '1ère Année',
    semesters: [
      {
        semester: 1,
        label: 'Semestre 1',
        modules: [
          {
            id: 'anatomie-1-s1',
            title: 'Anatomie I',
            subtitle: 'Membre supérieur & Thorax',
            description: 'Anatomie du membre supérieur et anatomie thoracique. Travaux pratiques d\'ostéologie.',
            has3D: true,
            icon: '🦴',
            subModules: [
              'I — Anatomie du Membre supérieur',
              'II — Anatomie du Thorax',
              'TP — Ostéologie du Thorax',
            ],
            hasFiles: true,
          },
          {
            id: 'biologie-1-s1',
            title: 'Biologie',
            subtitle: 'Cellulaire · Génétique · Moléculaire',
            description: 'Biologie cellulaire, génétique fondamentale et biologie moléculaire. Bases du vivant au niveau cellulaire.',
            has3D: false,
            icon: '🔬',
            subModules: [
              'I — Biologie cellulaire',
              'II — Génétique fondamentale',
              'III — Biologie Moléculaire',
            ],
            hasFiles: true,
          },
          {
            id: 'chimie-biochimie-1-s1',
            title: 'Chimie & Biochimie',
            subtitle: 'Chimie générale · Biochimie structurale',
            description: 'Chimie générale et biochimie des molécules du vivant : glucides, lipides, protéines, vitamines.',
            has3D: false,
            icon: '⚗️',
            subModules: [
              'I — Chimie générale',
              'II — Biochimie structurale',
            ],
            hasFiles: true,
          },
          {
            id: 'methodologie-1-s1',
            title: 'Méthodologie & Terminologie',
            subtitle: 'Apprentissage · Terminologie médicale',
            description: 'Méthodes d\'apprentissage, raisonnement médical, mémoire, lecture active et terminologie médicale.',
            has3D: false,
            icon: '📚',
            subModules: [
              'I — Méthodologie d\'apprentissage',
              'II — Terminologie médicale',
            ],
            hasFiles: true,
          },
          {
            id: 'sante-publique-1-s1',
            title: 'Santé Publique',
            subtitle: 'Santé communautaire · Biostatistiques',
            description: 'Santé communautaire, hygiène, épidémiologie et biostatistiques appliquées à la médecine.',
            has3D: false,
            icon: '📊',
            subModules: [
              'I — Santé communautaire & Hygiène',
              'I — Épidémiologie',
              'II — Biostatistiques',
            ],
            hasFiles: true,
          },
        ],
      },
      {
        semester: 2,
        label: 'Semestre 2',
        modules: [],
      },
    ],
  },
  {
    year: 2,
    label: '2ème Année',
    semesters: [
      { semester: 3, label: 'Semestre 3', modules: [] },
      { semester: 4, label: 'Semestre 4', modules: [] },
    ],
  },
  {
    year: 3,
    label: '3ème Année',
    semesters: [
      { semester: 5, label: 'Semestre 5', modules: [] },
      { semester: 6, label: 'Semestre 6', modules: [] },
    ],
  },
  {
    year: 4,
    label: '4ème Année',
    semesters: [
      { semester: 7, label: 'Semestre 7', modules: [] },
      { semester: 8, label: 'Semestre 8', modules: [] },
    ],
  },
  {
    year: 5,
    label: '5ème Année',
    semesters: [
      { semester: 9, label: 'Semestre 9', modules: [] },
      { semester: 10, label: 'Semestre 10', modules: [] },
    ],
  },
  {
    year: 6,
    label: '6ème Année',
    semesters: [
      { semester: 11, label: 'Semestre 11', modules: [] },
      { semester: 12, label: 'Semestre 12', modules: [] },
    ],
  },
]
