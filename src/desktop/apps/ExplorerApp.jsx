import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Folder, Grid, List } from "react-feather";
import SmartImage from "../../components/SmartImage.jsx";
import { projects, CATEGORIES } from "../../data/projects.js";
import { appLabel, appPath, appToolbar, dot, segmented, segmentedItem } from "../../ui.js";

const FOLDERS = [{ id: "tous", label: "Tous les projets" }, ...Object.entries(CATEGORIES).map(([id, label]) => ({ id, label }))];
const count = (id) => (id === "tous" ? projects.length : projects.filter((p) => p.category === id).length);

// Disposition des fichiers selon la vue ; fenêtre étroite (@max-3xl) : dossiers en pastilles au-dessus des fichiers
const FILES = {
  grille:
    "grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 p-5 @max-3xl:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] @max-3xl:gap-2 @max-3xl:p-3 @max-narrow:grid-cols-2",
  liste: "flex flex-col gap-1 p-3",
};
const FILE = {
  grille: "flex-col gap-[0.6rem] p-[0.55rem]",
  liste: "flex-row items-center gap-4 px-[0.6rem] py-[0.45rem]",
};
const THUMB = {
  grille: "",
  liste: "shrink-0 w-[92px] @max-3xl:w-[72px]",
};

function readView() {
  try {
    return localStorage.getItem("explorer-vue") === "liste" ? "liste" : "grille";
  } catch {
    return "grille";
  }
}

// Application « Projets » : explorateur de fichiers (dossiers = catégories, fichiers = projets)
export default function ExplorerApp({ filter, setFilter, navigate }) {
  const [view, setView] = useState(readView);
  const visible = filter === "tous" ? projects : projects.filter((p) => p.category === filter);

  const changeView = (v) => {
    setView(v);
    try {
      localStorage.setItem("explorer-vue", v);
    } catch {
      /* préférence non mémorisée */
    }
  };

  return (
    <div className="grid grid-cols-[220px_minmax(0,1fr)] min-h-full bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_0_219px,var(--color-line)_219px_220px,transparent_220px)] @max-3xl:grid-cols-[minmax(0,1fr)] @max-3xl:grid-rows-[auto_1fr] @max-3xl:bg-none">
      <aside
        className="sticky top-0 self-start flex flex-col gap-[0.2rem] px-3 py-[1.1rem] @max-3xl:static @max-3xl:flex-row @max-3xl:flex-wrap @max-3xl:gap-[0.35rem] @max-3xl:p-3 @max-3xl:border-b @max-3xl:border-line"
        aria-label="Dossiers"
      >
        <p className={`${appLabel} pl-[0.7rem] @max-3xl:hidden`}>Dossiers</p>
        {FOLDERS.map((f) => (
          <button
            key={f.id}
            className={`relative flex items-center gap-[0.6rem] w-full px-[0.7rem] py-[0.55rem] rounded-[10px] text-[0.9rem] text-left cursor-pointer transition-colors duration-200 @max-3xl:w-auto @max-3xl:shrink-0 @max-3xl:border @max-3xl:border-line @max-3xl:rounded-full ${
              filter === f.id ? "text-white" : "text-muted hover:text-white hover:bg-white/5"
            }`}
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
          >
            {filter === f.id && (
              <motion.span
                layoutId="explorer-folder"
                className="absolute inset-0 rounded-[10px] border border-primary/35 bg-primary/16 @max-3xl:rounded-full"
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
              />
            )}
            <Folder size={16} className="relative" />
            <span className="relative whitespace-nowrap">{f.label}</span>
            <span className="relative ml-auto px-[0.45rem] py-[0.05rem] rounded-full bg-white/8 font-mono text-[0.72rem]">{count(f.id)}</span>
          </button>
        ))}
      </aside>

      <div>
        <div className={appToolbar}>
          <span className={appPath}>
            ~/projets{filter !== "tous" && <span>/{filter}</span>}
          </span>
          <span className="font-mono text-xs text-muted whitespace-nowrap @max-3xl:hidden">{visible.length} éléments</span>
          <div className={segmented} role="group" aria-label="Affichage">
            <button className={segmentedItem(view === "grille")} onClick={() => changeView("grille")} aria-label="Grille" aria-pressed={view === "grille"}>
              <Grid size={16} />
            </button>
            <button className={segmentedItem(view === "liste")} onClick={() => changeView("liste")} aria-label="Liste" aria-pressed={view === "liste"}>
              <List size={16} />
            </button>
          </div>
        </div>

        <motion.ul layout className={FILES[view]}>
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((p, i) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.25, delay: Math.min(i, 8) * 0.02 }}
              >
                <a
                  href={`#projet-${p.id}`}
                  className={`group flex h-full rounded-[14px] border border-transparent no-underline transition-[background-color,border-color] duration-250 hover:bg-white/5 hover:border-line ${FILE[view]}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`projet-${p.id}`);
                  }}
                >
                  <span className={`block aspect-[4/3] rounded-[10px] overflow-hidden border border-line bg-black/30 ${THUMB[view]}`}>
                    <SmartImage
                      src={p.thumb}
                      srcSet={p.thumbSet}
                      sizes={view === "liste" ? "92px" : "(max-width: 48rem) 45vw, 230px"}
                      alt=""
                      width={p.width}
                      height={p.height}
                      eager={i < 6}
                      className="size-full object-cover transition-[scale,opacity] duration-500 ease-soft group-hover:scale-105"
                    />
                  </span>
                  <span className="flex flex-1 flex-col gap-[0.2rem] min-w-0 px-[0.15rem]">
                    <span className="text-[0.92rem] leading-[1.3] line-clamp-2">{p.title}</span>
                    <span className="flex items-center gap-[0.4rem] font-mono text-[0.7rem] text-muted">
                      <span className={dot(p.category)} />
                      {CATEGORIES[p.category]} · {p.tags[0]}
                    </span>
                    {view === "liste" && <span className="truncate text-[0.82rem] text-muted">{p.summary}</span>}
                  </span>
                </a>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>
    </div>
  );
}
