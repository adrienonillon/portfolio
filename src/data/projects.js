const asset = (file) => `${import.meta.env.BASE_URL}assets/${file}`;

export const CATEGORIES = {
  stage: "Stage",
  universitaire: "Universitaire",
  personnel: "Personnel",
};

// Modèle 3D (.glb dans public/assets/3d) + sa miniature (public/assets/3d/thumbs)
const model = (file, label, orbit = "0deg 85deg auto") => ({
  src: asset(`3d/${file}.glb`),
  thumb: asset(`3d/thumbs/${file}.webp`),
  label,
  orbit,
});
// Image de galerie
const shot = (file, width, height, label) => ({ image: asset(file), width, height, label });

const CERAMIQUE = [
  ["chercheur", "Chercheur"],
  ["emailleur", "Émailleur"],
  ["enfourneur", "Enfourneur"],
  ["mouleur", "Mouleur"],
  ["retoucheur", "Retoucheur"],
  ["sculteur", "Sculpteur"],
  ["mosaiste", "Mosaïste"],
  ["inspecteurqualite", "Inspecteur qualité"],
  ["aviateur", "Aviateur"],
  ["construteur", "Constructeur"],
  ["macons", "Maçons"],
  ["dentiste", "Dentiste"],
  ["prothesiste", "Prothésiste"],
  ["enseignant", "Enseignant"],
  ["enseignants", "Enseignants"],
  ["etudiant", "Étudiant"],
  ["etudiant-2", "Étudiant"],
].map(([file, label]) => shot(`projets/ceramique/${file}.webp`, 990, 1400, label));

const SIDE = "-90deg 85deg auto";
const THREE_QUARTER = "30deg 75deg auto";

/*
  Pour ajouter un projet : copier un bloc ci-dessous.
  - image / width / height : la vignette (width/height = dimensions réelles, évite les sauts de mise en page)
  - gallery : images supplémentaires affichées en grille sur la page détail (optionnel)
    galleryColumns : nombre de colonnes de cette grille (2 par défaut)
    showCover: false : n'affiche pas la vignette en grand sur la page détail
  - models : modèles 3D affichés dans une visionneuse interactive sur la page détail (optionnel)
  - duration / context : optionnels
*/
export const projects = [
  {
    id: "voom-site",
    category: "stage",
    title: "Site web VOOM",
    detailTitle: "Site web VOOM - Concession 2 roues électriques",
    summary: "Création du site vitrine d'une concession de scooters et motos électriques à Limoges.",
    image: asset("projets/voom-site.webp"),
    width: 2000,
    height: 1500,
    tags: ["WordPress", "Web Design", "UI/UX", "Intégration"],
    context: "Stage chez VOOM (Limoges)",
    description:
      "Conception et réalisation du site internet de VOOM, concession spécialisée dans les scooters et motos électriques à Limoges. Le site présente le catalogue des véhicules par catégorie (scooters 50cc, 125cc, motos) et par marque, met en avant les modèles les plus vendus ainsi que les avis clients, et permet de réserver un essai gratuit en ligne. Réalisé sous WordPress avec le thème GeneratePress.",
    links: [{ label: "Visiter le site", url: "https://voom2roues.fr/" }],
  },
  {
    id: "voom-vitrophanie",
    category: "stage",
    title: "Vitrophanie VOOM",
    detailTitle: "Vitrophanie de la boutique VOOM",
    summary: "Habillage complet de la vitrine du magasin : messages clés, illustrations et horaires.",
    image: asset("projets/voom-vitrophanie.webp"),
    width: 2000,
    height: 1210,
    tags: ["Illustrator", "Print", "Signalétique", "Illustration"],
    context: "Stage chez VOOM (Limoges)",
    description:
      "Création de la vitrophanie de la boutique VOOM. L'habillage met en avant les arguments clés de l'électrique (« Économique », « Batterie amovible », « 100% électrique », « Rechargeable à domicile ») accompagnés d'illustrations au trait d'une moto et d'un scooter, en reprenant les couleurs de l'identité VOOM. La porte d'entrée regroupe les horaires d'ouverture, les contacts et les réseaux sociaux pour réserver un essai.",
    links: [],
  },
  {
    id: "voom-kakemono",
    category: "stage",
    title: "Kakemono Ultraviolette × VOOM",
    detailTitle: "Kakemono Ultraviolette F77 Mach 2 × VOOM",
    summary: "Roll-up promotionnel pour la moto électrique Ultraviolette F77 Mach 2.",
    image: asset("projets/voom-kakemono.webp"),
    width: 1600,
    height: 2057,
    tags: ["Photoshop", "Illustrator", "Print", "Mise en page"],
    context: "Stage chez VOOM (Limoges)",
    description:
      "Conception d'un kakemono (roll-up) pour présenter la moto électrique Ultraviolette F77 Mach 2 en partenariat avec VOOM. La composition s'appuie sur l'univers graphique de la marque (rouge et noir, découpes angulaires) et met en valeur la moto ainsi que ses caractéristiques clés : vitesse maximale de 155 km/h, puissance de 30 kW et autonomie de 231 km.",
    links: [],
  },
  {
    id: "impact-fast-fashion",
    category: "universitaire",
    title: "Impact Fast Fashion",
    detailTitle: "Impact Fast Fashion - Acheter, Jeter, Polluer",
    summary: "Site de sensibilisation animé avec GSAP sur les problématiques de la fast fashion.",
    image: asset("projets/impact-fast-fashion.webp"),
    width: 2000,
    height: 1448,
    tags: ["GSAP", "HTML/CSS/JS", "Animation web", "Data storytelling"],
    context: "SAE 3.03 - Projet en binôme avec Apolline Thierry",
    description:
      "Création d'un site web de sensibilisation « Acheter, Jeter, Polluer » pour comprendre l'impact de la mode. Les animations réalisées avec GSAP accompagnent la lecture et mettent en scène les chiffres clés de la fast fashion : conditions de travail, consommation d'eau (7 000 litres pour un seul jean), drame du Rana Plaza, recyclage textile et habitudes de consommation en France. Le site se termine par des conseils pour prolonger la durée de vie de ses vêtements.",
    links: [{ label: "Visiter le site", url: "https://adrienonillon.github.io/SAE3.03_Apolline-Thierry_Adrien-Onillon/" }],
  },
  {
    id: "silksong-3d",
    category: "universitaire",
    title: "Assets 3D - Boutique Silksong",
    detailTitle: "Assets 3D pour une boutique intégrée à Silksong",
    summary: "Modélisation des produits 3D d'un site marchand intégré à l'univers du jeu Silksong.",
    image: asset("projets/silksong-mockup.webp"),
    width: 2000,
    height: 1500,
    tags: ["Blender", "Modélisation 3D", "Texturing", "glTF"],
    context: "SAE - Site marchand intégré au jeu Hollow Knight: Silksong",
    description:
      "Dans le cadre d'une SAE, nous devions créer un site marchand intégré à l'univers du jeu Hollow Knight: Silksong. Je me suis chargé de la création des assets 3D des produits vendus sur la boutique : une collection de pin's inspirés des lieux et personnages du jeu, un masque, le cylindre de Psalm, un dé magnétique et une bobine. Les modèles ont été réalisés et texturés sous Blender puis exportés en glTF pour être affichés en 3D sur le web. Vous pouvez les faire pivoter dans la visionneuse ci-dessus.",
    models: [
      model("fracturn-mask", "Masque Fracturn", THREE_QUARTER),
      model("psalm-cylinder", "Cylindre de Psalm", THREE_QUARTER),
      model("magnetic-dice", "Dé magnétique", THREE_QUARTER),
      model("bobine", "Bobine", THREE_QUARTER),
      model("bell-pins", "Pin's Bell", SIDE),
      model("bench-pins", "Pin's Bench", SIDE),
      model("elevator-pins", "Pin's Elevator", SIDE),
      model("merchant-pins", "Pin's Merchant", SIDE),
      model("bench-pins-v2", "Pin's Bench (v2)"),
      model("hot-spring-pins", "Pin's Hot Spring"),
      model("jiji-pins", "Pin's Jiji"),
      model("lifeblood-pins", "Pin's Lifeblood"),
      model("stag-pins", "Pin's Stag"),
      model("tram-pins", "Pin's Tram"),
      model("warriors-grave-pins", "Pin's Warrior's Grave"),
      model("whispering-root-pins", "Pin's Whispering Root"),
    ],
    links: [],
  },
  {
    id: "hiero-flyers",
    category: "universitaire",
    title: "Flyers Fédération Hiero",
    detailTitle: "Flyers concerts 2026 - Fédération Hiero",
    summary: "Création des flyers trimestriels présentant le programme des concerts de l'année 2026.",
    image: asset("projets/hiero/hiero-mockup.webp"),
    width: 2000,
    height: 1500,
    tags: ["Photoshop", "Illustration", "Print", "Mise en page"],
    context: "Fédération Hiero (Limoges)",
    description:
      "La Fédération Hiero à Limoges édite un flyer tous les trois mois pour présenter le programme des concerts à venir. L'association a fait appel à moi pour les éditions de l'année 2026. Réalisés sous Photoshop, les quatre flyers partagent la même identité (rose, logo Hiero, typographie forte) et se distinguent chacun par une illustration aux motifs colorés et psychédéliques. Le recto met en avant l'illustration et la période, le verso détaille le programme des concerts (dates, artistes, tarifs) et les informations pratiques.",
    gallery: [1, 2, 3, 4].map((n) => shot(`projets/hiero/flyer-${n}.webp`, 1800, 1800, `Flyer ${n} - recto / verso`)),
    links: [],
  },
  {
    id: "ceramique-personnages",
    category: "universitaire",
    title: "Kit de personnages - Métiers de la céramique",
    detailTitle: "Kit d'illustrations - Parcours des métiers de la céramique",
    summary: "Kit d'illustrations de personnages en activité pour l'office de tourisme de Limoges.",
    image: asset("projets/ceramique-mockup.webp"),
    width: 2000,
    height: 1500,
    tags: ["Illustration", "Character design", "Kit graphique", "Identité visuelle"],
    context: "Office de tourisme de Limoges - « Parcours des métiers de la céramique »",
    description:
      "L'office de tourisme de Limoges lance une nouvelle offre touristique, le « Parcours des métiers de la céramique », qui fait découvrir les métiers actuels de la céramique à travers la visite d'ateliers de création, d'entreprises et de laboratoires de recherche. La demande : réaliser un kit d'illustrations de personnages en activité (créateur, chercheur, technicien…), sans décor, que le service communication pourra réutiliser en interne pour enrichir et homogénéiser tous ses supports : guide papier, flyer, slides, affiche, réseaux sociaux ou motion design. J'ai conçu 17 personnages dans un style commun (silhouettes stylisées, dégradés et trames de lignes) avec une couleur propre à chaque métier.",
    gallery: CERAMIQUE,
    galleryColumns: 4,
    links: [],
  },
  {
    id: "proj-bal",
    category: "universitaire",
    title: "Médiation Vidéo - BAL Limoges",
    detailTitle: "Médiation Vidéo - Musée des Beaux-Arts de Limoges",
    summary: "Motion design et sound design pour la présentation d'une œuvre du musée.",
    image: asset("vidéo-collection.jpg"),
    width: 958,
    height: 1400,
    tags: ["After Effects", "Davinci Resolve", "Sound Design", "Motion Design"],
    duration: "2.5 jours",
    description:
      "Dans le cadre d'un projet de groupe pour le Musée des Beaux-Arts de Limoges, j'ai réalisé la partie Motion Design visant à présenter une œuvre aux visiteurs internationaux. J'ai conçu les maquettes animatiques, les écrans clés de la collection ainsi que l'animation finale. J'ai également géré l'intégralité du sound design sur DaVinci Resolve pour offrir une meilleure expérience aux touristes anglophones.",
    links: [{ label: "Voir la vidéo", url: "https://youtube.com/shorts/1ZAJP-VxxQk" }],
  },
  {
    id: "proj-motion",
    category: "universitaire",
    title: "Affiche Motion Design",
    detailTitle: "Motion Design Showreel",
    summary: "Animation graphique et effets visuels d'une affiche.",
    image: asset("affiche-motion.jpg"),
    width: 2000,
    height: 2000,
    tags: ["After Effects", "Motion Design", "Autonomie", "Créativité"],
    duration: "Environ 10 heures",
    description:
      "Animation d'une affiche statique en utilisant After Effects. C'était mon premier projet sur ce logiciel, l'objectif était de donner vie aux éléments graphiques avec une liberté créative totale. Réalisé en parallèle des cours en 2ème année.",
    links: [{ label: "Voir la vidéo", url: "https://youtu.be/7pt2nna7VFY" }],
  },
  {
    id: "proj-affiche",
    category: "personnel",
    title: "Affiche Fabio Quartararo",
    detailTitle: "Affiche Créative - Fabio Quartararo",
    summary: "Conception graphique d'une affiche pour mettre en avant Fabio Quartararo.",
    image: asset("affiche-fabio.jpg"),
    width: 935,
    height: 1400,
    tags: ["Photoshop", "Illustrator", "Détourage", "Composition"],
    duration: "1 jour",
    description:
      "Création graphique mettant à l'honneur l'athlète Fabio Quartararo. La composition joue sur la dualité entre l'action (course) et la victoire.",
    links: [],
  },
  {
    id: "proj-dating",
    category: "universitaire",
    title: "Application de rencontre",
    detailTitle: "Application de rencontre UI/UX",
    summary: "Conception UX/UI complète d'une application de rencontre sportive sur Figma.",
    image: asset("Mycrew.jpg"),
    width: 933,
    height: 1400,
    tags: ["Figma", "UI Design", "UX Research", "Mobile First"],
    duration: "2 mois (en parallèle)",
    description:
      "Conception UI/UX complète d'une application de rencontre centrée sur le sport. Projet réalisé en 2ème année à partir d'une charte graphique et de logos imposés.",
    links: [
      {
        label: "Voir le prototype",
        url: "https://www.figma.com/proto/TPt8gRGQDhQzeZH6KdU9Cd/Adrien-Onillon---mycrew--Copy-?page-id=4005%3A5&node-id=4124-791&viewport=242%2C138%2C0.4&t=Yfl2GQe0PM9AqGMa-1&scaling=scale-down&content-scaling=fixed",
      },
    ],
  },
  {
    id: "proj-podcast",
    category: "universitaire",
    title: "Vignette Podcast",
    detailTitle: "Vignette Podcast Universitaire",
    summary: "Création visuelle pour l'identité d'un podcast.",
    image: asset("vignette-podcast.jpg"),
    width: 1600,
    height: 1600,
    tags: ["Photoshop", "Identité Visuelle", "Storytelling", "Graphisme"],
    duration: "1 jour",
    description: "Conception de l'identité visuelle d'un podcast sur le thème de l'enquête et de la vérité.",
    links: [],
  },
  {
    id: "proj-1",
    category: "universitaire",
    title: "Prototype page Behance",
    detailTitle: "Prototype page Behance",
    summary: "Réalisation d'un prototype de page Behance.",
    image: asset("Behance.jpg"),
    width: 1800,
    height: 1260,
    tags: ["Figma", "Web Design", "Pixel Perfect", "Analyse"],
    duration: "1 semaine",
    description:
      "Reproduction fidèle d'une page projet Behance (Pixel Perfect). Exercice pédagogique de 1ère année pour maîtriser l'interface de Figma.",
    links: [
      {
        label: "Voir le prototype",
        url: "https://www.figma.com/proto/YoBh7IDv461G4lTq2hMRQO/SAE-101?node-id=2209-374&t=wdg5WnOhF2okBX6L-0",
      },
    ],
  },
  {
    id: "proj-5",
    category: "universitaire",
    title: "Start up fictive - Loc'sur",
    detailTitle: "Start up fictive - Loc'sur",
    summary: "Site Onepage, responsive et accessible avec développement dynamique JS.",
    image: asset("loc'sur.jpg"),
    width: 1800,
    height: 1374,
    tags: ["HTML5", "CSS3", "JavaScript", "Intégration Web"],
    duration: "2 semaines",
    description:
      "Développement complet du site vitrine de 'Loc'sur', une start-up fictive. Premier projet d'envergure intégrant HTML, CSS et JavaScript.",
    links: [{ label: "Visiter le site", url: "https://www.a-onillon.mmi-limoges.fr/" }],
  },
  {
    id: "proj-6",
    category: "universitaire",
    title: "Applications de Sport Héméra",
    detailTitle: "Applications de sport pour Héméra",
    summary: "Prototypage Figma et réalisation vidéo publicitaire.",
    image: asset("SAE2.02.jpg"),
    width: 1800,
    height: 1200,
    tags: ["Davinci Resolve", "Figma", "Tournage", "Travail d'équipe"],
    duration: "2 semaines",
    description:
      "Projet de groupe visant à inciter les coworkers d'Héméra à faire du sport. Réalisation d'un prototype d'application et d'une publicité vidéo.",
    links: [
      { label: "Voir la vidéo", url: "https://www.youtube.com/watch?v=fVRYDqP8nDo" },
      {
        label: "Voir le prototype Figma",
        url: "https://www.figma.com/proto/OyGiLCARjgZ28nqUMcIkJg/SAE202?page-id=96%3A3090&node-id=96-3157&viewport=-117%2C109%2C0.33&t=LALeDM5hbhSWASuB-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=96%3A3091",
      },
    ],
  },
  {
    id: "proj-7",
    category: "universitaire",
    title: "Site de Streaming",
    detailTitle: "Site de Streaming",
    summary: "Développement complet back-end et front-end.",
    image: asset("site-streaming.jpg"),
    width: 1800,
    height: 1182,
    tags: ["PHP", "MySQL", "HTML/CSS", "Base de données"],
    duration: "2 semaines",
    description:
      "Développement Back-End et Front-End d'une plateforme de streaming vidéo (1ère année). Gestion de base de données MySQL et PHP.",
    links: [{ label: "Visiter le site", url: "https://onillon-sae203.mmi-limoges.fr/" }],
  },
  {
    id: "proj-8",
    category: "universitaire",
    title: "Olive Oil",
    detailTitle: "Olive Oil - E-commerce",
    summary: "Prototype pour un site de vente d'huile d'olive.",
    image: asset("olive-oil.jpg"),
    width: 1800,
    height: 1350,
    tags: ["Figma", "Auto-Layout", "E-commerce", "UI Design"],
    duration: "3 semaines",
    description:
      "Conception d'une maquette pour un site e-commerce d'huile d'olive haut de gamme. Projet axé sur l'apprentissage approfondi de l'Auto-Layout sur Figma.",
    links: [
      {
        label: "Version Mobile",
        url: "https://www.figma.com/proto/uiHQmV8bEWey9ryPOhwOgB/Adrien-Onillon---Olea--Copy-?page-id=2002%3A5&node-id=2291-144&viewport=1279%2C206%2C0.05&t=2OUxQWu9gaFnDHV3-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=2291%3A144",
      },
      {
        label: "Version Desktop",
        url: "https://www.figma.com/proto/uiHQmV8bEWey9ryPOhwOgB/Adrien-Onillon---Olea--Copy-?page-id=2563%3A81&node-id=2563-82&viewport=776%2C22%2C0.25&t=flpkExwG5cGBjZZo-1&scaling=scale-down&content-scaling=fixed",
      },
    ],
  },
];

export const getProject = (id) => projects.find((p) => p.id === id);
