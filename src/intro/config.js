/*
  Réglages de l'intro 3D (vue subjective : on est dans les yeux du personnage, assis au bureau).
  Les modèles viennent de sources/ (exports Blender) et sont optimisés par scripts/modeles.mjs.
*/

const model = (file) => `${import.meta.env.BASE_URL}assets/3d/${file}.glb`;

// Nom donné à l'écran de la télé : il reçoit le code qui défile et sert de cible à la plongée
export const SCREEN_MESH = "Screen";

// Télévision posée sur le bureau (écran = matériau "Black plastic")
export const TV_MODEL = model("tv");
export const TV_SCREEN_MATERIAL = "Black plastic";

// Tasse de café posée à droite du clavier (vapeur = objets NurbsPath.001 à .003)
export const CAFE_MODEL = model("cafe");

// Bureau (plateau + pieds en tréteaux)
export const DESK_MODEL = model("desk");

// Séquence d'entrée (secondes) : lever les yeux vers l'écran, un temps d'arrêt, puis plonger dedans
export const LOOK_UP_DURATION = 1.5;
export const HOLD_DURATION = 0.35;
export const DIVE_DURATION = 2;
// Lancement automatique de la séquence si le visiteur ne clique pas (secondes)
export const AUTO_ENTER_DELAY = 8;

// Yeux du personnage : assis devant le bureau, l'écran en entier et les mains qui tapent en bas de l'image
export const START_CAMERA = { position: [0, 1.22, 0.74], target: [0, 0.94, -0.12], fov: 55 };

// Téléphones et tablettes : rendu allégé (résolution, ombres, écran de code)
export const LOW_POWER =
  typeof window !== "undefined" && window.matchMedia("(pointer: coarse), (max-width: 48rem)").matches;

// Clé sessionStorage : l'intro n'est jouée qu'une fois par visite
export const INTRO_SEEN_KEY = "intro-vue";
