/*
  Réglages de l'intro 3D (vue subjective : on est dans les yeux du personnage).

  Pour brancher ta scène Blender :
  1. Exporte en glTF binaire (.glb), avec compression Draco si possible,
     et enregistre-la sous public/assets/3d/intro.glb.
  2. Nomme le mesh de l'écran "Screen" (le code qui défile est appliqué dessus,
     ses UV doivent couvrir tout l'écran de 0 à 1, ratio 16:10 idéalement).
  3. Les animations du fichier (mains qui tapent...) sont jouées en boucle automatiquement.
  4. Place une caméra à hauteur des yeux du personnage, qui regarde le clavier : c'est le plan de départ.
     La suite (lever la tête vers l'écran, puis plonger dedans) est calculée automatiquement.
     Sans caméra, la position des yeux est estimée depuis l'écran (et le mesh "Keyboard" s'il existe).

  Tant que intro.glb n'existe pas, une scène provisoire (PlaceholderDesk) est affichée.
*/

export const INTRO_MODEL = `${import.meta.env.BASE_URL}assets/3d/intro.glb`;
export const DRACO_PATH = `${import.meta.env.BASE_URL}draco/`;
export const SCREEN_MESH = "Screen";
export const KEYBOARD_MESH = "Keyboard";

// Télévision posée sur le bureau de la scène provisoire (écran = matériau "Black plastic")
export const TV_MODEL = `${import.meta.env.BASE_URL}assets/3d/tv.glb`;
export const TV_SCREEN_MATERIAL = "Black plastic";

// Tasse de café posée à droite du clavier (vapeur = objets NurbsPath.001 à .003)
export const CAFE_MODEL = `${import.meta.env.BASE_URL}assets/3d/cafe.glb`;

// Bras + main avec squelette (doigts pliés en code pour taper au clavier)
export const HAND_MODEL = `${import.meta.env.BASE_URL}assets/3d/hand.glb`;

// Bureau (plateau + pieds en tréteaux)
export const DESK_MODEL = `${import.meta.env.BASE_URL}assets/3d/desk.glb`;

// Séquence d'entrée (secondes) : lever les yeux vers l'écran, un temps d'arrêt, puis plonger dedans
export const LOOK_UP_DURATION = 1.5;
export const HOLD_DURATION = 0.35;
export const DIVE_DURATION = 2;
// Lancement automatique de la séquence si le visiteur ne clique pas (secondes)
export const AUTO_ENTER_DELAY = 8;

// Yeux du personnage dans la scène provisoire : assis devant le bureau, regard sur le clavier
export const PLACEHOLDER_CAMERA = { position: [0, 1.2, 0.6], target: [0, 0.8, 0.11], fov: 55 };

// Téléphones et tablettes : rendu allégé (résolution, ombres, écran de code)
export const LOW_POWER =
  typeof window !== "undefined" && window.matchMedia("(pointer: coarse), (max-width: 48rem)").matches;

// Clé sessionStorage : l'intro n'est jouée qu'une fois par visite
export const INTRO_SEEN_KEY = "intro-vue";
