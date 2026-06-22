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
        modules: [
          {
            id: 'anatomie-2-s2',
            title: 'Anatomie II',
            subtitle: 'Abdomen · Membre inférieur · Ostéologie',
            description: 'Anatomie de l’abdomen, du membre inférieur et travaux pratiques d’ostéologie.',
            has3D: true,
            icon: '🦴',
            subModules: [
              'Anatomie de l’abdomen',
              'Anatomie du membre inférieur',
              'TP — Ostéologie',
            ],
            hasFiles: true,
          },
          {
            id: 'biophysique-s2',
            title: 'Biophysique',
            subtitle: 'Radiobiologie · Circulation · Optique',
            description: 'Rayons X, radiobiologie, compartiments liquidiens, équilibre hydrosodé, circulation et optique.',
            has3D: true,
            icon: '🧲',
            subModules: [
              'Pr Alami',
              'Pr Errachidi',
              'Pr Zekriti',
            ],
            hasFiles: true,
          },
          {
            id: 'histologie-embryologie-1-s2',
            title: 'Histologie & Embryologie 1',
            subtitle: 'Tissus · Embryologie humaine',
            description: 'Histologie générale, tissus fondamentaux, embryologie et supports d’entraînement.',
            has3D: true,
            icon: '🔬',
            subModules: [
              'Histologie',
              'Embryologie',
              'Supports & QROC',
            ],
            hasFiles: true,
          },
          {
            id: 'histoire-psycho-socio-s2',
            title: 'Histoire · Psycho · Socio',
            subtitle: 'Histoire de la médecine · Psychologie · Sociologie',
            description: 'Histoire de la médecine, psychologie médicale, sociologie et sciences humaines.',
            has3D: true,
            icon: '🧠',
            subModules: [
              'Histoire de la médecine',
              'Psychologie',
              'Sociologie',
            ],
            hasFiles: true,
          },
          {
            id: 'techniques-communication-s2',
            title: 'Techniques de communication',
            subtitle: 'Communication médicale · Lecture critique',
            description: 'Techniques de communication, dialogues médecin-patient et lecture critique.',
            has3D: true,
            icon: '💬',
            subModules: [
              'Cours',
              'Dialogues',
              'Contrôle continu',
            ],
            hasFiles: true,
          },
          {
            id: 'cahier-examens-s2',
            title: 'Cahier d’examens S2',
            subtitle: 'Annales · Normal · Rattrapage',
            description: 'Sujets d’examens S2, sessions normales, rattrapages et supports Ataraxie.',
            has3D: false,
            icon: '📝',
            subModules: [
              'Examens 2024',
              'Ataraxie',
            ],
            hasFiles: true,
          },
        ],
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
