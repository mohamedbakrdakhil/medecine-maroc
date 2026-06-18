export interface CourseFile {
  name: string
  url: string
  ext: 'pdf' | 'pptx' | 'docx'
  section: string
  sectionLabel: string
}

export const euromedFiles: Record<string, CourseFile[]> = {
  'biophysique-s2': [
    { name: 'Rayons X et Radiologie', url: '/courses/euromed/s2/biophysique-s2/alami/2- Radiobiologie.pdf', ext: 'pdf', section: 'alami', sectionLabel: 'Pr Alami' },
    { name: 'Compartiments liquidiens', url: "/courses/euromed/s2/biophysique-s2/errachidi/1-Compartiments liquidiens de l'organisme.pdf", ext: 'pdf', section: 'errachidi', sectionLabel: 'Pr Errachidi' },
    { name: 'Équilibre hydrosodé', url: '/courses/euromed/s2/biophysique-s2/errachidi/2- Équilibre hydrosodé.pdf', ext: 'pdf', section: 'errachidi', sectionLabel: 'Pr Errachidi' },
    { name: 'Propriétés acido-basiques', url: '/courses/euromed/s2/biophysique-s2/errachidi/3-Propriétés acido-basiques des solutions.pdf', ext: 'pdf', section: 'errachidi', sectionLabel: 'Pr Errachidi' },
    { name: 'Biophysique de la Circulation', url: '/courses/euromed/s2/biophysique-s2/errachidi/4-BIOPHYSIQUE DE LA CIRCULATION.pdf', ext: 'pdf', section: 'errachidi', sectionLabel: 'Pr Errachidi' },
    { name: 'Oxydoréduction', url: '/courses/euromed/s2/biophysique-s2/errachidi/5-Oxydoréduction .pdf', ext: 'pdf', section: 'errachidi', sectionLabel: 'Pr Errachidi' },
    { name: 'Transports transmembranaires', url: '/courses/euromed/s2/biophysique-s2/errachidi/6-Transports transmembranaires.pdf', ext: 'pdf', section: 'errachidi', sectionLabel: 'Pr Errachidi' },
    { name: 'Cours avec correction (Optique)', url: '/courses/euromed/s2/biophysique-s2/zekriti/Cours avec correction des exercices .pdf', ext: 'pdf', section: 'zekriti', sectionLabel: 'Pr Zekriti' },
  ],
  'histologie-embryo-s2': [
    { name: 'Cours Histologie — Pr Sekal', url: '/courses/euromed/s2/histologie-embryo-s2/histologie-sekal/Cours.pdf', ext: 'pdf', section: 'histologie-sekal', sectionLabel: 'Histologie — Pr Sekal' },
    { name: 'Cours Embryologie', url: '/courses/euromed/s2/histologie-embryo-s2/embryologie/Cours du prof.pdf', ext: 'pdf', section: 'embryologie', sectionLabel: 'Embryologie' },
  ],
  'histoire-psycho-socio-s2': [
    { name: 'Médecine médiévale', url: '/courses/euromed/s2/histoire-psycho-socio-s2/histoire/2)History of the medieval medicine.pdf', ext: 'pdf', section: 'histoire', sectionLabel: 'Histoire de la médecine' },
    { name: 'La rationalité — Descartes', url: '/courses/euromed/s2/histoire-psycho-socio-s2/histoire/7)La rationalité Descartes pdf.pdf', ext: 'pdf', section: 'histoire', sectionLabel: 'Histoire de la médecine' },
    { name: 'Éthique & Codes médicaux', url: '/courses/euromed/s2/histoire-psycho-socio-s2/histoire/8)Ethique Codes Nur Hels Bioeth Pricipes ethique pdf.pdf', ext: 'pdf', section: 'histoire', sectionLabel: 'Histoire de la médecine' },
    { name: 'Code de déontologie médicale — Maroc', url: '/courses/euromed/s2/histoire-psycho-socio-s2/histoire/9)Code deontologie Profession medicale maroc pdf.pdf', ext: 'pdf', section: 'histoire', sectionLabel: 'Histoire de la médecine' },
    { name: "Déclaration des droits de l'Homme", url: '/courses/euromed/s2/histoire-psycho-socio-s2/histoire/10)Déclaration des droits de l Homme pdf.pdf', ext: 'pdf', section: 'histoire', sectionLabel: 'Histoire de la médecine' },
    { name: 'Psychologie médicale — Partie 1', url: '/courses/euromed/s2/histoire-psycho-socio-s2/psychologie/4-Psycho Médicale -Partie1-.pdf', ext: 'pdf', section: 'psychologie', sectionLabel: 'Psychologie' },
  ],
  'techniques-communication-s2': [
    { name: 'Chapitre 1', url: '/courses/euromed/s2/techniques-communication-s2/cours/Chapitre 1.pptx', ext: 'pptx', section: 'cours', sectionLabel: 'Cours' },
    { name: 'Chapitre 2', url: '/courses/euromed/s2/techniques-communication-s2/cours/Chapitre 2.pptx', ext: 'pptx', section: 'cours', sectionLabel: 'Cours' },
    { name: 'Chapitre 3', url: '/courses/euromed/s2/techniques-communication-s2/cours/Chapitre 3.pptx', ext: 'pptx', section: 'cours', sectionLabel: 'Cours' },
    { name: 'Chapitre 4', url: '/courses/euromed/s2/techniques-communication-s2/cours/Chapitre 4.pptx', ext: 'pptx', section: 'cours', sectionLabel: 'Cours' },
    { name: 'Chapitre 5', url: '/courses/euromed/s2/techniques-communication-s2/cours/Chapitre 5.pptx', ext: 'pptx', section: 'cours', sectionLabel: 'Cours' },
    { name: 'Chapitre 6', url: '/courses/euromed/s2/techniques-communication-s2/cours/Chapitre 6.pptx', ext: 'pptx', section: 'cours', sectionLabel: 'Cours' },
    { name: 'Chapitre 7', url: '/courses/euromed/s2/techniques-communication-s2/cours/Chapitre 7.pptx', ext: 'pptx', section: 'cours', sectionLabel: 'Cours' },
    { name: 'Lecture critique — article scientifique', url: '/courses/euromed/s2/techniques-communication-s2/cours/Exemple d_article scientifique  la lecture critique en médecine.pdf', ext: 'pdf', section: 'cours', sectionLabel: 'Cours' },
    { name: 'Dialogues médecin-patient', url: '/courses/euromed/s2/techniques-communication-s2/cours/médecin - patient  dialogues 1 & 2.pdf', ext: 'pdf', section: 'cours', sectionLabel: 'Cours' },
    { name: 'Dialogues médecin-famille', url: '/courses/euromed/s2/techniques-communication-s2/cours/médecin-famille du patient dialogues 1 &2.pdf', ext: 'pdf', section: 'cours', sectionLabel: 'Cours' },
  ],
  'anatomie-2-s2': [
    { name: 'Anatomie du Membre Inférieur — Partie 2', url: '/courses/euromed/s2/anatomie-2-s2/membre-inf/ANATOMIE DU MEMB INF-PARTIE2-.pdf', ext: 'pdf', section: 'membre-inf', sectionLabel: 'Membre inférieur' },
  ],
}
