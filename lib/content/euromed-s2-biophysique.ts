export interface KeyPoint { text: string }
export interface ContentSection { heading: string; body: string }
export interface CoursePage { imageUrl: string; alt: string }
export interface Chapter {
  id: string
  title: string
  professor: string
  sourceUrl?: string
  sourceLabel?: string
  sourcePages?: CoursePage[]
  sourcePagesTitle?: string
  sourcePagesSubtitle?: string
  model3D?: 'thorax'
  keyPoints: KeyPoint[]
  sections: ContentSection[]
}

export const biophysiqueChapters: Chapter[] = [
  {
    id: 'compartiments-liquidiens',
    title: 'Compartiments liquidiens de l\'organisme',
    professor: 'Pr Errachidi',
    keyPoints: [
      { text: 'L\'eau représente 60% du poids corporel chez l\'adulte' },
      { text: 'Compartiment intracellulaire (LIC) : 40% du poids — compartiment extracellulaire (LEC) : 20%' },
      { text: 'LEC = plasma (5%) + liquide interstitiel (15%)' },
      { text: 'Méthode de mesure : dilution d\'un traceur de référence' },
      { text: 'Régulation par ADH (antidiuretic hormone) et aldostérone' },
    ],
    sections: [
      {
        heading: 'Composition et répartition',
        body: `L'organisme humain est composé à environ 60% d'eau chez l'adulte (50% chez la femme, 70% chez le nouveau-né). Cette eau est répartie en deux grands compartiments :\n\n• **Liquide intracellulaire (LIC)** : 40% du poids corporel, contenu à l'intérieur des cellules. Riche en K⁺, Mg²⁺, phosphates et protéines.\n\n• **Liquide extracellulaire (LEC)** : 20% du poids corporel, subdivisé en plasma (5%) et liquide interstitiel (15%). Riche en Na⁺, Cl⁻ et HCO₃⁻.`,
      },
      {
        heading: 'Mesure des volumes liquidiens',
        body: `La méthode de référence est la **dilution d'un traceur** : on injecte une quantité connue Q d'une substance, on attend la distribution, puis on mesure la concentration C obtenue.\n\nVolume = Q / C\n\n• Volume plasmatique : bleu Evans ou albumine marquée ¹²⁵I\n• Volume LEC : inuline, mannitol, thiocyanate\n• Volume total : eau tritiée (³H₂O) ou eau lourde (D₂O)`,
      },
      {
        heading: 'Régulation',
        body: `Les échanges entre compartiments sont régulés par :\n\n• **Pression osmotique** : déterminée principalement par la concentration en Na⁺ dans le LEC et en protéines intracellulaires\n• **ADH (Hormone antidiurétique)** : sécrétée par l'hypophyse, augmente la réabsorption d'eau au niveau du tubule collecteur rénal\n• **Aldostérone** : sécrétée par le cortex surrénalien, favorise la réabsorption de Na⁺ (et donc d'eau) au niveau du tubule rénal`,
      },
    ],
  },
  {
    id: 'equilibre-hydrosode',
    title: 'Équilibre hydrosodé',
    professor: 'Pr Errachidi',
    keyPoints: [
      { text: 'La natrémie normale est de 135–145 mmol/L' },
      { text: 'Hyponatrémie < 135 mmol/L → risque d\'œdème cérébral' },
      { text: 'Hypernatrémie > 145 mmol/L → déshydratation cellulaire' },
      { text: 'Le bilan sodé est équilibré par les reins (90% d\'excrétion rénale)' },
      { text: 'Système rénine-angiotensine-aldostérone : principal régulateur' },
    ],
    sections: [
      {
        heading: 'Le sodium et son rôle',
        body: `Le sodium (Na⁺) est le principal cation du liquide extracellulaire. Il détermine l'osmolalité plasmatique et donc la distribution de l'eau entre les compartiments.\n\n**Valeurs normales :**\n• Natrémie : 135–145 mmol/L\n• Bilan sodé quotidien : apports ≈ pertes ≈ 150–200 mmol/j\n\nLes reins assurent 90% de l'excrétion du Na⁺, le reste étant éliminé par la sueur et les selles.`,
      },
      {
        heading: 'Troubles de la natrémie',
        body: `**Hyponatrémie (Na⁺ < 135 mmol/L) :**\nExcès d'eau par rapport au sodium. Clinique : nausées, céphalées, confusion, convulsions, coma dans les formes sévères.\nCauses : SIADH, insuffisance cardiaque, cirrhose, insuffisance rénale.\n\n**Hypernatrémie (Na⁺ > 145 mmol/L) :**\nDéficit en eau par rapport au sodium. Clinique : soif intense, sécheresse des muqueuses, tachycardie, fièvre.\nCauses : déshydratation, diabète insipide, apports sodés excessifs.`,
      },
      {
        heading: 'Système Rénine-Angiotensine-Aldostérone (SRAA)',
        body: `C'est le principal système de régulation de la volémie et de la pression artérielle :\n\n1. Baisse de la pression de perfusion rénale → sécrétion de **rénine** par les cellules juxta-glomérulaires\n2. Rénine convertit l'angiotensinogène en **angiotensine I**\n3. L'enzyme de conversion (ECA) transforme l'angiotensine I en **angiotensine II**\n4. Angiotensine II → vasoconstriction + stimulation de la sécrétion d'**aldostérone**\n5. Aldostérone → réabsorption de Na⁺ et excrétion de K⁺ au tubule rénal`,
      },
    ],
  },
  {
    id: 'proprietes-acido-basiques',
    title: 'Propriétés acido-basiques des solutions',
    professor: 'Pr Errachidi',
    keyPoints: [
      { text: 'pH = -log[H⁺] ; pH normal du sang : 7,38–7,42' },
      { text: 'Acide de Brønsted : donneur de proton H⁺' },
      { text: 'Base de Brønsted : accepteur de proton H⁺' },
      { text: 'Équation de Henderson-Hasselbalch : pH = pKa + log [A⁻]/[AH]' },
      { text: 'Systèmes tampons : bicarbonate (principal), phosphate, protéines, hémoglobine' },
    ],
    sections: [
      {
        heading: 'Définitions et échelle de pH',
        body: `**Acide de Brønsted-Lowry** : toute espèce capable de céder un proton H⁺\n**Base de Brønsted-Lowry** : toute espèce capable d'accepter un proton H⁺\n\nLe pH est défini par : **pH = -log[H⁺]**\n\nÀ 37°C, l'eau pure a un pH de 6,81. Le pH sanguin normal est de **7,38–7,42** (légèrement basique). Une acidose correspond à pH < 7,38 ; une alcalose à pH > 7,42.`,
      },
      {
        heading: 'Équation de Henderson-Hasselbalch',
        body: `Pour un couple acide-base AH/A⁻ :\n\n**pH = pKa + log ([A⁻]/[AH])**\n\nApplication au système bicarbonate (système tampon principal du sang) :\n\n**pH = 6,1 + log ([HCO₃⁻] / [CO₂ dissous])**\n\nAvec [HCO₃⁻] normale = 24 mmol/L et [CO₂] = 1,2 mmol/L (PCO₂ = 40 mmHg)\n→ pH = 6,1 + log(24/1,2) = 6,1 + 1,3 = **7,4**`,
      },
      {
        heading: 'Systèmes tampons de l\'organisme',
        body: `**1. Système bicarbonate/CO₂** (extracellulaire) — le plus important en clinique\nHCO₃⁻ + H⁺ ⇌ H₂CO₃ ⇌ H₂O + CO₂\n\n**2. Système phosphate** (surtout intracellulaire et urinaire)\nH₂PO₄⁻ ⇌ HPO₄²⁻ + H⁺ ; pKa = 6,8\n\n**3. Protéines plasmatiques** : groupements NH₂ et COOH tamponnent les variations de pH\n\n**4. Hémoglobine** : tampon érythrocytaire majeur grâce aux résidus histidine`,
      },
    ],
  },
  {
    id: 'biophysique-circulation',
    title: 'Biophysique de la circulation',
    professor: 'Pr Errachidi',
    keyPoints: [
      { text: 'Loi de Poiseuille : Q = πr⁴ΔP / 8ηL' },
      { text: 'Résistance vasculaire : R = 8ηL / πr⁴' },
      { text: 'Pression artérielle moyenne ≈ PAD + (PAS-PAD)/3' },
      { text: 'Débit cardiaque = Volume d\'éjection × Fréquence cardiaque (≈ 5 L/min au repos)' },
      { text: 'Viscosité du sang : 3–4 fois celle de l\'eau, dépend de l\'hématocrite' },
    ],
    sections: [
      {
        heading: 'Loi de Poiseuille et résistance vasculaire',
        body: `L'écoulement du sang dans les vaisseaux est régi par la **loi de Poiseuille** :\n\n**Q = πr⁴ΔP / 8ηL**\n\nOù Q = débit, r = rayon du vaisseau, ΔP = différence de pression, η = viscosité, L = longueur.\n\nLa résistance vasculaire est : **R = 8ηL / πr⁴**\n\n⚠️ Le rayon est élevé à la puissance 4 : diviser le rayon par 2 → résistance multipliée par 16. C'est pourquoi les artérioles (vaisseau résistance) contrôlent finement la distribution du débit sanguin.`,
      },
      {
        heading: 'Pression artérielle et débit cardiaque',
        body: `**Pression artérielle systolique (PAS)** : 120 mmHg (normale)\n**Pression artérielle diastolique (PAD)** : 80 mmHg (normale)\n**Pression artérielle moyenne (PAM)** ≈ PAD + (PAS-PAD)/3 ≈ 93 mmHg\n\n**Débit cardiaque (Qc)** = Volume d'éjection systolique (VES) × Fréquence cardiaque (FC)\n= 70 mL × 70 bpm ≈ **5 L/min** au repos\n\nPouvant atteindre 20–25 L/min à l'effort chez un athlète.`,
      },
      {
        heading: 'Viscosité sanguine',
        body: `La viscosité du sang est 3–4 fois supérieure à celle de l'eau. Elle dépend principalement de :\n\n• **L'hématocrite** (proportion de globules rouges) : principal déterminant\n• La déformabilité des globules rouges\n• La fibrinogène et les protéines plasmatiques\n\n**Effet Fahraeus-Lindqvist** : dans les petits vaisseaux (< 300 µm), la viscosité apparente diminue car les GR se concentrent au centre du vaisseau (effet skimming).`,
      },
    ],
  },
  {
    id: 'oxydoreduction',
    title: 'Oxydoréduction',
    professor: 'Pr Errachidi',
    keyPoints: [
      { text: 'Oxydation = perte d\'électrons ; Réduction = gain d\'électrons (mnémotechnique : OIL RIG)' },
      { text: 'Potentiel standard d\'oxydoréduction E° : mesuré par rapport à l\'électrode standard à hydrogène' },
      { text: 'ΔG° = –nFΔE° : réaction spontanée si ΔE° > 0 (et ΔG° < 0)' },
      { text: 'Chaîne respiratoire mitochondriale : série de couples redox transférant les électrons vers l\'O₂' },
      { text: 'NAD⁺/NADH (E° = –0,32 V) → Complexes I→II→III→IV → O₂/H₂O (E° = +0,82 V)' },
    ],
    sections: [
      {
        heading: 'Définitions et notions fondamentales',
        body: `Une **réaction d'oxydoréduction** (rédox) implique le transfert d'électrons entre deux espèces chimiques.

• **Oxydant** (accepteur d'électrons) : espèce qui se réduit — elle gagne des électrons
• **Réducteur** (donneur d'électrons) : espèce qui s'oxyde — elle perd des électrons
• Toute réaction rédox associe un couple oxydant/réducteur (couple rédox) noté Ox/Red

**Exemple biologique majeur :**
O₂ + 4H⁺ + 4e⁻ → 2H₂O (O₂ est l'oxydant terminal de la chaîne respiratoire)`,
      },
      {
        heading: 'Potentiel standard d\'oxydoréduction E°',
        body: `Le **potentiel standard d'oxydoréduction E°** (en Volts) mesure l'affinité d'un couple pour les électrons, par rapport à l'électrode standard à hydrogène (H⁺/H₂, E° = 0 V par convention).

• Plus E° est positif → meilleur oxydant (forte affinité pour les électrons)
• Plus E° est négatif → meilleur réducteur (tend à céder ses électrons)

**Couples biologiques importants :**
• NAD⁺/NADH : E° = –0,32 V
• FAD/FADH₂ : E° = –0,18 V
• Cytochrome c (Fe³⁺/Fe²⁺) : E° = +0,25 V
• O₂/H₂O : E° = +0,82 V`,
      },
      {
        heading: 'Énergie libre et spontanéité des réactions rédox',
        body: `La relation entre le potentiel rédox et l'énergie libre de Gibbs est :

**ΔG° = –nFΔE°**

Où n = nombre d'électrons échangés, F = constante de Faraday (96 485 C/mol), ΔE° = E°(oxydant) – E°(réducteur)

• Si ΔE° > 0 → ΔG° < 0 → réaction **spontanée** (exergonique)
• Si ΔE° < 0 → ΔG° > 0 → réaction **non spontanée** (endergonique, nécessite de l'énergie)

**Application à la chaîne respiratoire :**
ΔE° = E°(O₂/H₂O) – E°(NAD⁺/NADH) = 0,82 – (–0,32) = **1,14 V**
ΔG° = –2 × 96 485 × 1,14 ≈ **–220 kJ/mol** → énergie utilisée pour synthétiser l'ATP`,
      },
      {
        heading: 'Chaîne respiratoire mitochondriale',
        body: `La chaîne respiratoire est une série de **couples rédox** dont le potentiel augmente progressivement, assurant le transfert des électrons de NADH et FADH₂ vers l'oxygène.

**Complexes de la chaîne :**
• **Complexe I** (NADH déshydrogénase) : oxyde NADH, transfère les e⁻ à l'ubiquinone (CoQ)
• **Complexe II** (Succinate déshydrogénase) : oxyde FADH₂, transfère les e⁻ au CoQ
• **Complexe III** (Cytochrome bc1) : transfère les e⁻ du CoQ au cytochrome c
• **Complexe IV** (Cytochrome c oxydase) : transfère les e⁻ au dioxygène → H₂O

**ATP synthase (Complexe V) :** utilise le gradient de protons créé par les complexes I, III, IV pour synthétiser l'ATP (phosphorylation oxydative).`,
      },
    ],
  },
  {
    id: 'transports-transmembranaires',
    title: 'Transports transmembranaires',
    professor: 'Pr Errachidi',
    keyPoints: [
      { text: 'Diffusion simple : passive, gradient de concentration, pas de protéine' },
      { text: 'Diffusion facilitée : passive, nécessite un transporteur ou canal' },
      { text: 'Transport actif primaire : pompe Na⁺/K⁺ ATPase, consomme ATP' },
      { text: 'Transport actif secondaire : co-transport, utilise le gradient Na⁺' },
      { text: 'Osmose : déplacement d\'eau selon gradient osmotique à travers membrane semi-perméable' },
    ],
    sections: [
      {
        heading: 'Transports passifs',
        body: `**Diffusion simple** : mouvement de molécules du compartiment concentré vers le moins concentré, sans énergie ni protéine. Concerne les petites molécules liposolubles (O₂, CO₂, alcool) et l'eau.\n\n**Diffusion facilitée** : nécessite un transporteur protéique (canal ou carrier) mais reste passive (pas d'ATP). Exemples : glucose (GLUT), ions (canaux Na⁺, K⁺, Ca²⁺).\n\n**Osmose** : diffusion de l'eau à travers une membrane semi-perméable du milieu hypotonique vers le milieu hypertonique.`,
      },
      {
        heading: 'Transports actifs',
        body: `**Transport actif primaire** : utilise directement l'énergie de l'hydrolyse de l'ATP.\nExemple majeur : **Pompe Na⁺/K⁺ ATPase** — expulse 3 Na⁺ et fait entrer 2 K⁺ par cycle → maintient le potentiel de repos membranaire (-70 mV).\n\n**Transport actif secondaire** : utilise le gradient électrochimique créé par le transport actif primaire.\n• **Co-transport (symport)** : Na⁺ et glucose entrent ensemble (intestin, tubule rénal)\n• **Échange (antiport)** : Na⁺ entre et H⁺ sort (Na⁺/H⁺ échangeur)`,
      },
      {
        heading: 'Endocytose et exocytose',
        body: `Pour les macromolécules qui ne peuvent pas traverser la membrane :

**Endocytose** : la membrane se replie et englobe la substance pour former une vésicule intracellulaire.
• Phagocytose : ingestion de particules solides (bactéries) par les macrophages
• Pinocytose : ingestion de liquide extracellulaire
• Endocytose médiée par récepteur : LDL, transferrine, insuline

**Exocytose** : fusion d'une vésicule intracellulaire avec la membrane plasmique → libération du contenu (neurotransmetteurs, hormones, enzymes digestives).`,
      },
    ],
  },

  // ─── Pr Zekriti ───────────────────────────────────────────────
  {
    id: 'optique-zekriti',
    title: 'Optique & Biophysique de la vision',
    professor: 'Pr Zekriti',
    keyPoints: [
      { text: 'Loi de Snell-Descartes : n₁ sin θ₁ = n₂ sin θ₂' },
      { text: 'Vergence d\'une lentille : V = 1/f (dioptries, D) ; relation conjugaison : 1/v – 1/u = 1/f' },
      { text: 'L\'œil est un système optique convergent : cornée (~43 D) + cristallin (~20 D) = ~63 D total' },
      { text: 'Accommodation : variation du pouvoir du cristallin pour focaliser à différentes distances' },
      { text: 'Défauts visuels : myopie (image en avant de la rétine), hypermétropie (en arrière), astigmatisme (surface irrégulière)' },
    ],
    sections: [
      {
        heading: 'Propriétés de la lumière et réflexion/réfraction',
        body: `La lumière est un **rayonnement électromagnétique** de longueur d'onde λ comprise entre 380 nm (violet) et 780 nm (rouge) dans le spectre visible.

**Loi de la réflexion :** l'angle d'incidence = l'angle de réflexion (θᵢ = θᵣ), les deux rayons et la normale étant coplanaires.

**Loi de Snell-Descartes (réfraction) :**
n₁ sin θ₁ = n₂ sin θ₂

Où n₁ et n₂ sont les indices de réfraction des deux milieux. Quand la lumière passe d'un milieu moins dense (n₁ < n₂) à un milieu plus dense, elle se rapproche de la normale.

**Réflexion totale interne :** si θ₁ > θc (angle critique), tout le rayon est réfléchi. Utilisé dans les fibres optiques employées en endoscopie médicale.`,
      },
      {
        heading: 'Lentilles convergentes et relation conjugaison',
        body: `Une **lentille mince convergente** fait converger les rayons parallèles en un foyer image F'.

**Relation de conjugaison (convention algébrique) :**
1/v – 1/u = 1/f = V

Où u = distance objet (négative si objet à gauche), v = distance image, f = focale, V = vergence (dioptries D).

• V > 0 : lentille convergente
• V < 0 : lentille divergente

**Grandissement :**
G = v/u = taille image / taille objet

Si G < 0 → image renversée ; si |G| < 1 → image réduite.`,
      },
      {
        heading: 'L\'œil comme système optique',
        body: `L'œil humain est un système optique convergent centré sur la fovéa (zone de la macula, vision fine).

**Éléments réfractants :**
• **Cornée** : puissance ~43 D (surface la plus réfractante)
• **Humeur aqueuse** : n ≈ 1,336
• **Cristallin** : puissance variable 15–25 D selon l'accommodation
• **Corps vitré** : n ≈ 1,336

**Puissance totale de l'œil normal (emmétrope) :** ≈ 60–63 D

**Accommodation :** le cristallin change de courbure grâce aux muscles ciliaires. Au repos → vision lointaine (cristallin plat). En tension → vision de près (cristallin bombé, puissance augmentée).

**Défauts visuels et correction :**
• Myopie : foyer en avant de la rétine → correction par lentille divergente (V < 0)
• Hypermétropie : foyer en arrière → correction par lentille convergente (V > 0)
• Astigmatisme : surface cornéenne irrégulière → correction par lentille torique
• Presbytie : perte d'accommodation liée à l'âge → verres progressifs`,
      },
    ],
  },

  // ─── Pr Alami ─────────────────────────────────────────────────
  {
    id: 'rayons-x-radiologie',
    title: 'Rayons X et Radiologie',
    professor: 'Pr Alami',
    keyPoints: [
      { text: 'Les rayons X sont des rayonnements électromagnétiques de longueur d\'onde 0,01–10 nm, produits par freinage d\'électrons (Bremsstrahlung)' },
      { text: 'Loi d\'atténuation de Beer-Lambert : I = I₀ × e^(–μx), μ = coefficient d\'atténuation linéaire' },
      { text: 'Coefficient d\'atténuation μ varie selon Z⁴/E³ : os (Z élevé) atténuent plus que les tissus mous' },
      { text: 'Dose absorbée : Gray (Gy) = J/kg ; dose efficace : Sievert (Sv) = dose × facteur de pondération' },
      { text: 'Tomodensitométrie (TDM/Scanner) : mesure coefficient d\'atténuation en unités Hounsfield (UH)' },
    ],
    sections: [
      {
        heading: 'Production des rayons X',
        body: `Les rayons X sont des **rayonnements électromagnétiques ionisants** de haute énergie (longueur d'onde 0,01–10 nm, énergie 0,1–100 keV).

**Tube à rayons X :**
1. Un filament chauffé (cathode) émet des électrons par effet thermoïonique
2. Une haute tension accélère les électrons (30–150 kV en radiodiagnostic)
3. Les électrons percutent l'anode (tungstène, Z = 74)

**Deux mécanismes de production :**
• **Rayonnement de freinage (Bremsstrahlung) :** ralentissement des électrons dans le champ coulombien des noyaux → spectre continu
• **Rayonnement caractéristique :** éjection d'un électron d'une couche interne → transition électronique → émission à une énergie spécifique (raies K, L)`,
      },
      {
        heading: 'Interaction des rayons X avec la matière',
        body: `Trois effets principaux selon l'énergie des photons :

**1. Effet photoélectrique** (prédominant < 100 keV en radiodiagnostic)
Le photon X transfère toute son énergie à un électron qui est éjecté. Probabilité ∝ Z⁴/E³ → explique le contraste entre os (Z élevé ≈ 13) et tissus mous (Z ≈ 7).

**2. Effet Compton** (prédominant 100 keV – 10 MeV)
Diffusion du photon sur un électron libre → photon dévié + électron Compton. Contribue au rayonnement diffusé (flou en radiographie).

**3. Création de paires** (> 1,02 MeV)
Conversion du photon en électron + positron. Utilisé en TEP (Tomographie par Émission de Positons).`,
      },
      {
        heading: 'Atténuation et loi de Beer-Lambert',
        body: `L'intensité d'un faisceau monochromatique traversant un milieu homogène suit la loi :

I = I₀ × e^(–μx)

Où I₀ = intensité incidente, μ = coefficient d'atténuation linéaire (cm⁻¹), x = épaisseur traversée (cm).

**Coefficient d'atténuation massique :** μ/ρ (cm²/g) — indépendant de l'état physique.

**Valeurs approximatives (en UH, unités Hounsfield) :**
• Air : –1000 UH
• Graisse : –100 à –50 UH
• Eau : 0 UH (référence)
• Tissu mou : +20 à +80 UH
• Os compact : +400 à +1000 UH`,
      },
      {
        heading: 'Dosimétrie des rayonnements',
        body: `**Dose absorbée (D) :** énergie déposée par unité de masse
Unité : **Gray (Gy)** = 1 J/kg

**Dose équivalente (H) :** prend en compte l'efficacité biologique relative (EBR) du rayonnement
H = D × wR
Unité : **Sievert (Sv)**
• Rayons X, γ : wR = 1
• Neutrons : wR = 5–20 selon l'énergie
• Particules α : wR = 20

**Dose efficace (E) :** pondérée selon la radiosensibilité des organes
E = Σ wT × HT
(wT = facteur de pondération tissulaire : gonades 0,20 ; moelle osseuse 0,12 ; poumon 0,12…)

**Radioprotection — principe ALARA :**
As Low As Reasonably Achievable — minimiser la dose par la distance, la durée et l'écran.`,
      },
    ],
  },
  {
    id: 'radiobiologie',
    title: 'Radiobiologie',
    professor: 'Pr Alami',
    keyPoints: [
      { text: 'Effets déterministes (seuil) : apparaissent au-dessus d\'une dose seuil — cataracte, érythème, stérilité' },
      { text: 'Effets stochastiques (aléatoires, sans seuil) : cancer, mutations génétiques — probabilité ∝ dose' },
      { text: 'La cellule la plus radiosensible est celle qui se divise le plus rapidement (tissu hématopoïétique, épithélium intestinal)' },
      { text: 'Courbe de survie cellulaire : modèle linéaire-quadratique SF = e^(–αD–βD²)' },
      { text: 'Facteurs des 5 R de la radiobiologie : Réparation, Repopulation, Redistribution, Réoxygénation, Radiosensibilité' },
    ],
    sections: [
      {
        heading: 'Interactions rayonnement–cellule',
        body: `Les rayonnements ionisants provoquent des dommages biologiques par deux mécanismes :

**1. Effet direct** (20% des dommages)
Le rayonnement frappe directement les molécules biologiques (ADN principalement) → ionisation directe → cassure de liaison covalente.

**2. Effet indirect** (80% des dommages)
Le rayonnement ionise l'eau (radiolyse) → production de radicaux libres (OH•, H•, e⁻aq) → lésions de l'ADN à distance.

**Lésions de l'ADN :**
• Cassures simple brin (SSB) — souvent réparées
• Cassures double brin (DSB) — les plus dangereuses, peuvent entraîner mort cellulaire ou mutation
• Modifications de bases, pontages ADN-protéines`,
      },
      {
        heading: 'Classification des effets biologiques',
        body: `**Effets déterministes (ou tissulaires) :**
• Apparaissent **au-dessus d'une dose seuil**
• Sévérité proportionnelle à la dose
• Dus à la mort d'un grand nombre de cellules
• Exemples : érythème cutané (> 2 Gy), cataracte (> 2 Gy sur le cristallin), stérilité temporaire (> 0,15 Gy sur les gonades), syndrome aigu d'irradiation (> 1 Gy corps entier)

**Effets stochastiques (aléatoires) :**
• **Pas de dose seuil** — tout niveau de dose comporte un risque
• Probabilité proportionnelle à la dose
• Gravité indépendante de la dose
• Exemples : cancers radio-induits (leucémies, cancers solides), mutations héréditaires`,
      },
      {
        heading: 'Radiosensibilité tissulaire et loi de Bergonié-Tribondeau',
        body: `**Loi de Bergonié et Tribondeau (1906) :**
Les cellules sont d'autant plus radiosensibles qu'elles sont :
1. Plus indifférenciées (peu différenciées)
2. À activité mitotique plus élevée
3. Ayant un long avenir prolifératif

**Tisus classés par radiosensibilité décroissante :**
• Très radiosensibles : moelle osseuse hématopoïétique, épithélium intestinal, gonades, lymphocytes
• Radiosensibles : épiderme, épithélium respiratoire, cristallin
• Radiorésistants : muscle, tissu nerveux, os mature, cartilage

**Facteurs modulant la radiosensibilité :**
• **Oxygène** : effet radiosensibilisant majeur (OER = Oxygen Enhancement Ratio ≈ 2,5–3)
• **Température** : hyperthermie potentialise les effets des rayonnements
• **Radioprotecteurs** : thiols (cysteamine) captent les radicaux libres`,
      },
      {
        heading: 'Courbe de survie cellulaire',
        body: `La **survie cellulaire** après irradiation est représentée en coordonnées semi-logarithmiques.

**Modèle linéaire-quadratique (LQ) :**
SF = e^(–αD – βD²)

Où SF = fraction de cellules survivantes, D = dose, α = composante linéaire (dommages létaux directs), β = composante quadratique (dommages sublétaux combinés).

**Rapport α/β :**
• Tissus à réponse précoce (tumeurs, muqueuses) : α/β élevé (8–15 Gy) → courbe linéaire
• Tissus à réponse tardive (moelle épinière, rein) : α/β bas (1–4 Gy) → courbe avec épaulement

**Application en radiothérapie :**
La radiothérapie fractionnée (2 Gy × 25 fractions = 50 Gy total) exploite la meilleure capacité de réparation des tissus sains (α/β bas) par rapport aux tumeurs.`,
      },
    ],
  },
]
