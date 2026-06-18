import type { Chapter } from './euromed-s2-biophysique'

export const anatomieS1Chapters: Chapter[] = [
  {
    id: 'membre-superieur-introduction',
    title: 'Anatomie du membre supérieur',
    professor: 'Pr Chakour',
    sourceUrl: '/courses/euromed/s1/anatomie-1-s1/chakour/anatomie-du-membre-superieur.pdf',
    sourceLabel: 'Document original',
    keyPoints: [
      { text: 'Cours d\'Anatomie I, Semestre 1, consacré au membre supérieur' },
      { text: 'Organisation générale : anatomie de surface, squelette, innervation, topographie et vascularisation' },
      { text: 'Le membre supérieur comprend l\'épaule, le bras, le coude, l\'avant-bras, le poignet et la main' },
      { text: 'L\'étude se fait par régions anatomiques, avec des vues antérieures, postérieures et des plans de dissection' },
      { text: 'Les rappels de topographie servent de base aux questions d\'examen et aux travaux pratiques' },
    ],
    sections: [
      {
        heading: 'Objectif du cours',
        body: `Ce cours introduit l'anatomie morphologique et topographique du membre supérieur. Il sert de support à l'identification des reliefs de surface, des éléments osseux, des régions anatomiques et des principaux rapports vasculo-nerveux.\n\nL'approche suit une progression région par région : surface, squelette, innervation, creux axillaire, région scapulaire, bras, coude, avant-bras et main.`,
      },
      {
        heading: 'Organisation générale',
        body: `Le membre supérieur est étudié selon plusieurs niveaux :\n\n• Anatomie de surface : repérage des reliefs visibles et palpables\n• Ostéologie : clavicule, scapula, humérus, radius, ulna et squelette de la main\n• Topographie : régions axillaire, scapulaire, brachiale, cubitale, antébrachiale et palmaire\n• Vascularisation et innervation : trajets principaux et rapports anatomiques`,
      },
    ],
  },
  {
    id: 'anatomie-surface-squelette',
    title: 'Anatomie de surface et squelette',
    professor: 'Pr Chakour',
    keyPoints: [
      { text: 'L\'anatomie de surface permet de reconnaître les limites et reliefs du membre supérieur' },
      { text: 'Le squelette du membre supérieur comprend la ceinture scapulaire et le membre libre' },
      { text: 'La ceinture scapulaire est formée par la clavicule et la scapula' },
      { text: 'Le membre libre comprend l\'humérus, le radius, l\'ulna, les os du carpe, les métacarpiens et les phalanges' },
      { text: 'Les vues antérieures et postérieures facilitent l\'orientation anatomique' },
    ],
    sections: [
      {
        heading: 'Anatomie de surface',
        body: `L'étude de surface commence par les vues antérieure et postérieure du membre supérieur. Elle permet de situer l'épaule, le bras, le coude, l'avant-bras et la main avant de passer aux plans profonds.\n\nLes repères de surface sont indispensables pour comprendre les limites des régions et préparer l'analyse des coupes ou des dissections.`,
      },
      {
        heading: 'Squelette du membre supérieur',
        body: `Le squelette est présenté en vue antérieure, puis complété par des vues de l'avant-bras et de la main.\n\n• Ceinture scapulaire : clavicule et scapula\n• Bras : humérus\n• Avant-bras : radius et ulna\n• Main : carpe, métacarpe et phalanges\n\nCes éléments osseux servent de support aux insertions musculaires, aux articulations et aux rapports vasculo-nerveux.`,
      },
    ],
  },
  {
    id: 'innervation-membre-superieur',
    title: 'Innervation du membre supérieur',
    professor: 'Pr Chakour',
    keyPoints: [
      { text: 'L\'innervation du membre supérieur dépend principalement du plexus brachial' },
      { text: 'Les nerfs du membre supérieur accompagnent les axes vasculaires et traversent plusieurs régions topographiques' },
      { text: 'La compréhension des trajets nerveux aide à expliquer les déficits moteurs et sensitifs' },
      { text: 'Les rapports nerveux sont étudiés avec les régions axillaire, brachiale, antébrachiale et palmaire' },
    ],
    sections: [
      {
        heading: 'Vue d\'ensemble',
        body: `Le cours introduit l'innervation du membre supérieur après l'étude ostéologique. Cette partie sert à relier les régions anatomiques aux grands axes nerveux.\n\nL'objectif est de comprendre où cheminent les nerfs, quels plans ils traversent et pourquoi leur atteinte peut donner des signes moteurs ou sensitifs localisés.`,
      },
      {
        heading: 'Intérêt topographique',
        body: `L'innervation est à apprendre avec la topographie : le creux axillaire, le bras, le coude, l'avant-bras et la main sont autant de régions où les rapports nerveux deviennent importants.\n\nCette logique prépare l'étude des plans de dissection et des questions d'examen associées.`,
      },
    ],
  },
  {
    id: 'region-axillaire',
    title: 'Région axillaire',
    professor: 'Pr Chakour',
    keyPoints: [
      { text: 'La région axillaire est une zone de passage majeure entre le thorax, le cou et le membre supérieur' },
      { text: 'Elle est décrite par son sommet, ses parois et son contenu' },
      { text: 'Les parois antérieure, latérale et postérieure sont abordées séparément' },
      { text: 'Les vues de dissection montrent les rapports entre muscles, vaisseaux et nerfs' },
      { text: 'La coupe sagittale du creux axillaire aide à comprendre les limites profondes' },
    ],
    sections: [
      {
        heading: 'Limites et parois',
        body: `La topographie du membre supérieur commence par la région axillaire. Le cours distingue le sommet, la paroi antérieure, la paroi latérale et la paroi postérieure.\n\nChaque paroi est étudiée à partir de vues anatomiques et de vues après dissection afin de passer progressivement de la surface aux plans profonds.`,
      },
      {
        heading: 'Contenu du creux axillaire',
        body: `La région axillaire contient des éléments importants de passage vers le membre supérieur : axes vasculaires, éléments nerveux et tissus environnants.\n\nLa coupe sagittale du creux axillaire est utile pour visualiser les rapports entre les limites musculaires et le contenu profond.`,
      },
    ],
  },
  {
    id: 'region-scapulaire',
    title: 'Région scapulaire',
    professor: 'Pr Chakour',
    keyPoints: [
      { text: 'La région scapulaire est étudiée en vue postérieure de l\'épaule' },
      { text: 'L\'anatomie de surface précède les plans musculaires de dissection' },
      { text: 'Le plan musculaire profond précise les rapports autour de la scapula' },
      { text: 'Les schémas explicatifs servent à synthétiser les rapports régionaux' },
    ],
    sections: [
      {
        heading: 'Approche régionale',
        body: `La région scapulaire est abordée à partir de la vue postérieure de l'épaule. L'étude commence par les reliefs de surface, puis progresse vers les plans de dissection.\n\nCette région permet de relier la scapula, les muscles de l'épaule et les rapports profonds de la face postérieure.`,
      },
      {
        heading: 'Plans musculaires',
        body: `Le cours distingue les plans visibles après dissection et le plan musculaire profond. Cette organisation facilite la mémorisation des couches anatomiques et des rapports autour de la scapula.\n\nLe schéma explicatif sert de résumé visuel pour replacer les éléments dans leur contexte topographique.`,
      },
    ],
  },
  {
    id: 'bras-coude',
    title: 'Bras et coude',
    professor: 'Pr Chakour',
    keyPoints: [
      { text: 'Le bras est étudié par régions antérieure et postérieure' },
      { text: 'La région antérieure du bras est mise en relation avec le pli du coude' },
      { text: 'Les plans de dissection progressent de la peau vers l\'aponévrose puis les muscles' },
      { text: 'La région postérieure du bras est décrite par ses plans cutané, sous-cutané et musculaire' },
      { text: 'Le squelette du bras et du coude sert de repère pour comprendre les insertions et rapports' },
    ],
    sections: [
      {
        heading: 'Région antérieure du bras',
        body: `L'étude du bras commence par la région antérieure et le coude. Les vues successives montrent la surface, la dissection cutanée, le squelette puis les plans profonds après ouverture de l'aponévrose.\n\nLe pli du coude est une zone de rapports importants, à connaître avec les éléments musculaires, vasculaires et nerveux qui le traversent.`,
      },
      {
        heading: 'Région postérieure du bras',
        body: `La région postérieure du bras est présentée par plans. La progression part de la vue de surface, puis montre la dissection de la peau et le plan musculaire.\n\nCette méthode permet d'apprendre les rapports postérieurs sans les isoler du reste du membre supérieur.`,
      },
    ],
  },
  {
    id: 'avant-bras',
    title: 'Avant-bras',
    professor: 'Pr Chakour',
    keyPoints: [
      { text: 'L\'avant-bras est étudié en régions antérieure et postérieure' },
      { text: 'La région antérieure est divisée en plans superficiel, moyen et profond' },
      { text: 'Les vues antérieures et postérieures permettent de comparer les compartiments' },
      { text: 'La compréhension des plans musculaires aide à organiser les rapports tendineux et vasculo-nerveux' },
    ],
    sections: [
      {
        heading: 'Région antérieure',
        body: `La région antérieure de l'avant-bras est organisée en plusieurs plans : superficiel, moyen et profond. Cette séparation est importante pour classer les muscles et comprendre leur trajet vers le poignet et la main.\n\nLes vues successives permettent d'identifier les rapports entre les structures superficielles et les éléments plus profonds.`,
      },
      {
        heading: 'Région postérieure',
        body: `La vue postérieure complète l'étude de l'avant-bras en montrant l'autre compartiment anatomique. Elle doit être mise en parallèle avec la région antérieure pour comprendre l'organisation globale du segment antébrachial.`,
      },
    ],
  },
  {
    id: 'main-vascularisation',
    title: 'Main et vascularisation',
    professor: 'Pr Chakour',
    keyPoints: [
      { text: 'La main est étudiée par ses régions dorsale et palmaire' },
      { text: 'La région dorsale de la main est abordée avant la région palmaire' },
      { text: 'La vascularisation artérielle du membre supérieur constitue un axe de synthèse du cours' },
      { text: 'Les questions d\'examen portent souvent sur les rapports topographiques et les vues de dissection' },
    ],
    sections: [
      {
        heading: 'Régions de la main',
        body: `La fin du cours aborde l'anatomie de la main en distinguant deux régions :\n\n• Région dorsale de la main\n• Région palmaire de la main\n\nCette division permet d'organiser les tendons, les plans superficiels et profonds, ainsi que les rapports vasculo-nerveux.`,
      },
      {
        heading: 'Vascularisation artérielle',
        body: `La vascularisation artérielle du membre supérieur est présentée comme une synthèse après l'étude de l'avant-bras et de la main.\n\nElle doit être apprise en suivant le trajet des axes artériels depuis les régions proximales vers les régions distales, en gardant les rapports topographiques comme repères.`,
      },
    ],
  },
]
