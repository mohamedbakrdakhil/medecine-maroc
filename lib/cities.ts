export interface City {
  id: string
  name: string
  nameAr: string
  university: string
  univShort: string
  color: string
  gradient: string
  founded: number
  icon: string
  type: 'public' | 'private'
}

export const cities: City[] = [
  {
    id: 'rabat',
    name: 'Rabat',
    nameAr: 'الرباط',
    university: 'Faculté de Médecine et de Pharmacie de Rabat',
    univShort: 'Université Mohammed V',
    color: '#006233',
    gradient: 'from-green-800 to-green-600',
    founded: 1962,
    icon: '🏛️',
    type: 'public',
  },
  {
    id: 'rabat-uir',
    name: 'Rabat — UIR',
    nameAr: 'الرباط UIR',
    university: 'Faculté des Sciences de la Santé — UIR',
    univShort: 'Université Internationale de Rabat',
    color: '#1d4ed8',
    gradient: 'from-blue-900 to-blue-700',
    founded: 2010,
    icon: '🔬',
    type: 'private',
  },
  {
    id: 'casablanca',
    name: 'Casablanca',
    nameAr: 'الدار البيضاء',
    university: 'Faculté de Médecine et de Pharmacie de Casablanca',
    univShort: 'Université Hassan II',
    color: '#1e40af',
    gradient: 'from-blue-800 to-blue-600',
    founded: 1976,
    icon: '🏙️',
    type: 'public',
  },
  {
    id: 'marrakech',
    name: 'Marrakech',
    nameAr: 'مراكش',
    university: 'Faculté de Médecine et de Pharmacie de Marrakech',
    univShort: 'Université Cadi Ayyad',
    color: '#c1272d',
    gradient: 'from-red-800 to-orange-600',
    founded: 1975,
    icon: '🕌',
    type: 'public',
  },
  {
    id: 'fes',
    name: 'Fès',
    nameAr: 'فاس',
    university: 'Faculté de Médecine et de Pharmacie de Fès',
    univShort: 'Université Sidi Mohamed Ben Abdellah',
    color: '#92400e',
    gradient: 'from-amber-800 to-amber-600',
    founded: 1977,
    icon: '🎓',
    type: 'public',
  },
  {
    id: 'fes-euromed',
    name: 'Fès — Euromed',
    nameAr: 'فاس يورومد',
    university: 'Faculté de Médecine — Université Euro-Méditerranéenne',
    univShort: 'Université Euro-Méditerranéenne de Fès',
    color: '#0f766e',
    gradient: 'from-teal-800 to-teal-600',
    founded: 2012,
    icon: '🌍',
    type: 'private',
  },
  {
    id: 'oujda',
    name: 'Oujda',
    nameAr: 'وجدة',
    university: "Faculté de Médecine et de Pharmacie d'Oujda",
    univShort: 'Université Mohammed Premier',
    color: '#5b21b6',
    gradient: 'from-purple-800 to-purple-600',
    founded: 1984,
    icon: '🏥',
    type: 'public',
  },
  {
    id: 'tanger',
    name: 'Tanger',
    nameAr: 'طنجة',
    university: 'Faculté de Médecine et de Pharmacie de Tanger',
    univShort: 'Université Abdelmalek Essaadi',
    color: '#0e7490',
    gradient: 'from-cyan-800 to-cyan-600',
    founded: 2009,
    icon: '⚓',
    type: 'public',
  },
  {
    id: 'agadir',
    name: 'Agadir',
    nameAr: 'أكادير',
    university: "Faculté de Médecine et de Pharmacie d'Agadir",
    univShort: 'Université Ibn Zohr',
    color: '#be185d',
    gradient: 'from-pink-800 to-rose-600',
    founded: 2015,
    icon: '🌊',
    type: 'public',
  },
]

export function getCityById(id: string): City | undefined {
  return cities.find((c) => c.id === id)
}
