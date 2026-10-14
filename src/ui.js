// Classes Tailwind des éléments réutilisés dans plusieurs composants

// Bouton principal (dégradé violet) ; small : version compacte
export const cta = (small = false) =>
  [
    "inline-flex items-center justify-center gap-2.5 rounded-full border-2 border-white/30 bg-linear-135 from-violet to-primary",
    "font-bold tracking-[0.5px] text-white no-underline cursor-pointer",
    "transition-[translate,scale,box-shadow,border-color] duration-300 ease-soft active:scale-[0.97]",
    "hover:-translate-y-[3px] hover:scale-[1.03] hover:border-white/80",
    "hover:shadow-[0_20px_45px_rgba(83,18,196,0.7),0_0_40px_rgba(165,141,206,0.6)]",
    small
      ? "px-[1.4rem] py-[0.7rem] text-[0.95rem] shadow-[0_8px_20px_rgba(83,18,196,0.4)]"
      : "px-[2.2rem] py-[0.9rem] shadow-[0_10px_30px_rgba(83,18,196,0.5),0_0_25px_rgba(165,141,206,0.4)]",
  ].join(" ");

// Bouton secondaire des applications ; done : état « copié » (vert)
export const appBtn = (done = false) =>
  [
    "relative inline-flex items-center justify-center gap-[0.45rem] shrink-0 px-[0.85rem] py-[0.45rem] rounded-[10px] border",
    "text-white text-[0.85rem] no-underline cursor-pointer transition-[border-color,background-color] duration-250",
    done ? "bg-success border-success" : "bg-white/6 border-line hover:border-primary hover:bg-primary/15",
  ].join(" ");

export const panel = "p-6 rounded-[14px] border border-line bg-white/4";

// Petit titre en capitales (Description, Propriétés…)
export const appLabel = "mb-3 not-first:mt-6 font-mono text-[0.72rem] font-semibold tracking-[0.12em] uppercase text-primary";

// Barre d'outils collée en haut d'une application
export const appToolbar =
  "sticky top-0 z-2 flex items-center gap-3 px-4 py-[0.6rem] bg-ink backdrop-blur-md border-b border-line";
export const appPath =
  "flex-1 min-w-0 truncate font-mono text-[0.82rem] text-muted [&_span]:text-primary";

// Groupe de petits boutons accolés (grille / liste, précédent / suivant)
export const segmented = "inline-flex items-center shrink-0 p-[3px] rounded-[10px] border border-line bg-white/4";
export const segmentedItem = (active = false) =>
  [
    "grid place-items-center w-[30px] h-7 rounded-[7px] cursor-pointer transition-colors duration-200",
    active ? "bg-primary text-white" : "text-muted hover:bg-white/8 hover:text-white",
  ].join(" ");

// Couleur de chaque catégorie de projet
const CATEGORY_BG = { universitaire: "bg-primary", personnel: "bg-perso", stage: "bg-stage" };
export const badge = (category) =>
  `inline-block rounded-full px-[0.85rem] py-[0.35rem] text-[0.8rem] font-bold text-white ${CATEGORY_BG[category] ?? "bg-primary"}`;
export const dot = (category) => `shrink-0 size-2 rounded-full ${CATEGORY_BG[category] ?? "bg-primary"}`;
