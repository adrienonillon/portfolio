import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Maximize2, Minimize2, X } from "react-feather";

// Position de défilement de chaque fenêtre (retour depuis une fiche projet au même endroit)
const scrollMemory = {};
// Position, taille et ancrage de chaque fenêtre, retrouvés quand on la rouvre
const frameMemory = {};

// Taille à l'ouverture et taille minimale (en dessous, le contenu ne tient plus) de chaque fenêtre
const SIZES = {
  "a-propos": { open: [1000, 680], min: [480, 360] },
  projets: { open: [1180, 800], min: [540, 380] },
  contact: { open: [860, 600], min: [420, 320] },
  projet: { open: [1120, 880], min: [480, 360] },
};
const DEFAULT_SIZE = { open: [900, 640], min: [420, 320] };
const MARGIN = 16;
// Part de la barre de titre toujours visible, pour pouvoir rattraper la fenêtre
const KEEP_X = 140;
const KEEP_Y = 46;
// Distance au bord gauche / droit qui ancre la fenêtre sur la moitié de l'écran
const SNAP_EDGE = 12;
// Poignées de redimensionnement : bords et coins
const EDGES = {
  n: "top-0 inset-x-2.5 h-1.5 cursor-ns-resize",
  s: "bottom-0 inset-x-2.5 h-1.5 cursor-ns-resize",
  e: "right-0 inset-y-2.5 w-1.5 cursor-ew-resize",
  w: "left-0 inset-y-2.5 w-1.5 cursor-ew-resize",
  ne: "top-0 right-0 size-3.5 cursor-nesw-resize",
  sw: "bottom-0 left-0 size-3.5 cursor-nesw-resize",
  nw: "top-0 left-0 size-3.5 cursor-nwse-resize",
  se: "bottom-0 right-0 size-3.5 cursor-nwse-resize",
};
const WINDOW_BTN = "grid place-items-center size-8 rounded-lg text-muted cursor-pointer transition-colors duration-200 hover:text-white";

// Même seuil que le préfixe Tailwind md: (48rem)
const isDesktop = () => window.matchMedia("(min-width: 48rem)").matches;

// Ouverture : léger zoom sur ordinateur ; sur mobile glissement + fondu, sans zoom
// (un zoom oblige Chrome Android à redessiner tout le contenu de la fenêtre pendant l'animation)
const OPEN_DESKTOP = {
  initial: { opacity: 0, scale: 0.92, y: 30 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.94, y: 20, transition: { duration: 0.2 } },
  transition: { type: "spring", stiffness: 380, damping: 32 },
};
const OPEN_MOBILE = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 30, transition: { duration: 0.18 } },
  transition: { duration: 0.28, ease: [0.25, 1, 0.5, 1] },
};
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

/*
  area : tout le bureau (la fenêtre peut passer sur la barre de navigation) ;
  area.top : hauteur de la barre, sous laquelle les fenêtres s'ouvrent.
*/
function clampFrame(f, area) {
  const w = Math.min(f.w, area.w);
  const h = Math.min(f.h, area.h);
  return { w, h, x: clamp(f.x, KEEP_X - w, area.w - KEEP_X), y: clamp(f.y, 0, area.h - KEEP_Y) };
}

// Fenêtres centrées sous la barre, légèrement décalées en cascade
function initialFrame(size, index, area) {
  const workH = area.h - area.top;
  const w = Math.min(size.open[0], area.w - MARGIN * 2);
  const h = Math.min(size.open[1], workH - MARGIN * 2);
  const offset = (index - 1.5) * 28;
  return clampFrame({ x: (area.w - w) / 2 + offset, y: area.top + (workH - h) / 2 + offset / 2, w, h }, area);
}

// Plein écran et moitiés couvrent tout le bureau, barre de navigation comprise
function snapFrame(snap, area) {
  if (snap === "max") return { x: 0, y: 0, w: area.w, h: area.h };
  const w = Math.round(area.w / 2);
  return { x: snap === "left" ? 0 : area.w - w, y: 0, w, h: area.h };
}

// Suit le pointeur jusqu'au relâchement (capturé : le geste continue au-dessus des vidéos et iframes)
function track(e, onMove, onEnd) {
  const el = e.currentTarget;
  el.setPointerCapture(e.pointerId);
  const end = () => {
    el.removeEventListener("pointermove", onMove);
    el.removeEventListener("pointerup", end);
    el.removeEventListener("pointercancel", end);
    onEnd();
  };
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerup", end);
  el.addEventListener("pointercancel", end);
}

/*
  Fenêtre de « bureau ». Sur grand écran : déplaçable par sa barre de titre (y compris au-dessus de la barre
  de navigation), redimensionnable par ses bords jusqu'à une taille minimale, mise en plein écran par
  double-clic ou par son bouton, ancrée sur une moitié d'écran en la glissant contre un côté.
  Passe au premier plan au clic. Sur mobile elle occupe tout l'écran au-dessus du dock.
*/
export default function Window({ id, title, icon: Icon, index, scrollKey = id, z, focused, onFocus, onClose, layerRef, topInset, children }) {
  const size = SIZES[id] ?? DEFAULT_SIZE;
  const [desktop] = useState(isDesktop);
  const bodyRef = useRef(null);
  const [area, setArea] = useState(null);
  const [frame, setFrame] = useState(() => frameMemory[id]?.frame ?? null);
  const [snap, setSnap] = useState(() => frameMemory[id]?.snap ?? null);
  const [preview, setPreview] = useState(null);
  const [action, setAction] = useState(null); // "moving" | "resizing" pendant un geste
  const [animating, setAnimating] = useState(false);

  // Taille du bureau, suivie quand le navigateur est redimensionné
  useLayoutEffect(() => {
    const layer = layerRef.current;
    const update = () => {
      const next = { w: layer.clientWidth, h: layer.clientHeight, top: topInset };
      setArea(next);
      setFrame((f) => clampFrame(f ?? initialFrame(size, index, next), next));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(layer);
    return () => observer.disconnect();
  }, [layerRef, topInset, size, index]);

  useEffect(() => {
    if (frame) frameMemory[id] = { frame, snap };
  }, [id, frame, snap]);

  // Transition douce lors d'un agrandissement / ancrage
  useEffect(() => {
    if (!animating) return;
    const timer = setTimeout(() => setAnimating(false), 280);
    return () => clearTimeout(timer);
  }, [animating]);

  useLayoutEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = scrollMemory[scrollKey] ?? 0;
  }, [scrollKey]);

  useEffect(() => {
    if (focused) bodyRef.current?.focus({ preventScroll: true });
  }, [focused]);

  const changeSnap = (next) => {
    setAnimating(true);
    setSnap(next);
  };
  const toggleMax = () => changeSnap(snap === "max" ? null : "max");

  const startMove = (e) => {
    if (e.button !== 0 || !area || !isDesktop() || e.target.closest("button")) return;
    const layer = layerRef.current.getBoundingClientRect();
    const start = { x: e.clientX, y: e.clientY };
    let base = frame;
    let moved = false;
    let nextSnap = null;

    track(
      e,
      (ev) => {
        const dx = ev.clientX - start.x;
        const dy = ev.clientY - start.y;
        if (!moved) {
          if (Math.hypot(dx, dy) < 4) return;
          moved = true;
          setAction("moving");
          // Une fenêtre agrandie ou ancrée reprend sa taille, sous le curseur, au même endroit de sa barre
          if (snap) {
            const current = snapFrame(snap, area);
            const ratio = (start.x - layer.left - current.x) / current.w;
            base = { ...frame, x: start.x - layer.left - ratio * frame.w, y: current.y };
            setSnap(null);
          }
        }
        const px = ev.clientX - layer.left;
        nextSnap = px <= SNAP_EDGE ? "left" : px >= area.w - SNAP_EDGE ? "right" : null;
        setPreview(nextSnap);
        setFrame(clampFrame({ ...base, x: base.x + dx, y: base.y + dy }, area));
      },
      () => {
        setAction(null);
        setPreview(null);
        if (nextSnap) changeSnap(nextSnap);
      }
    );
  };

  const startResize = (edge) => (e) => {
    if (e.button !== 0 || !area) return;
    e.stopPropagation();
    const start = { x: e.clientX, y: e.clientY };
    const base = frame;
    const [minW, minH] = size.min.map((m, i) => Math.min(m, i ? area.h : area.w));
    setAction("resizing");

    track(
      e,
      (ev) => {
        const dx = ev.clientX - start.x;
        const dy = ev.clientY - start.y;
        let { x, y, w, h } = base;
        if (edge.includes("e")) w = clamp(base.w + dx, minW, area.w - base.x);
        if (edge.includes("s")) h = clamp(base.h + dy, minH, area.h - base.y);
        if (edge.includes("w")) {
          x = clamp(base.x + dx, Math.min(0, base.x), base.x + base.w - minW);
          w = base.x + base.w - x;
        }
        if (edge.includes("n")) {
          y = clamp(base.y + dy, 0, base.y + base.h - minH);
          h = base.y + base.h - y;
        }
        setFrame({ x, y, w, h });
      },
      () => setAction(null)
    );
  };

  const shown = area && frame && (snap ? snapFrame(snap, area) : frame);
  const previewFrame = preview && area && snapFrame(preview, area);
  // Position / taille : variables --x --y --w --h ; mobile : plein écran au-dessus du dock
  const classes = [
    "absolute left-[var(--x,1rem)] top-[var(--y,1rem)] w-[var(--w,min(880px,calc(100%-2rem)))] h-[var(--h,min(640px,calc(100%-2rem)))]",
    "flex flex-col border bg-ink backdrop-blur-[18px] overflow-hidden pointer-events-auto",
    "max-md:left-0 max-md:top-0 max-md:w-full max-md:h-[calc(100%-var(--dock-h))] max-md:rounded-t-none max-md:rounded-b-win max-md:border-t-0",
    // Plein écran sur mobile : fond opaque plutôt qu'un flou d'arrière-plan (coûteux pendant le défilement)
    "max-md:backdrop-blur-none max-md:bg-[#0d0a33]",
    focused ? "border-primary/35" : "border-line",
    snap ? "rounded-none" : "rounded-win",
    action ? "select-none" : "",
    action === "moving" ? "shadow-[0_40px_100px_rgba(5,3,30,0.8)]" : "shadow-[0_30px_80px_rgba(5,3,30,0.7)]",
    animating ? "transition-[left,top,width,height,border-radius] duration-250 ease-soft" : "",
  ];

  return (
    <>
      {previewFrame && (
        <div
          className="absolute rounded-win border border-primary/60 bg-primary/12 backdrop-blur-[4px] pointer-events-none animate-snap-in max-md:hidden"
          style={{ zIndex: z, left: previewFrame.x, top: previewFrame.y, width: previewFrame.w, height: previewFrame.h }}
          aria-hidden="true"
        />
      )}
      <motion.section
        className={classes.filter(Boolean).join(" ")}
        style={{
          zIndex: z,
          ...(shown && { "--x": `${shown.x}px`, "--y": `${shown.y}px`, "--w": `${shown.w}px`, "--h": `${shown.h}px` }),
        }}
        role="dialog"
        aria-label={title}
        onPointerDown={onFocus}
        {...(desktop ? OPEN_DESKTOP : OPEN_MOBILE)}
      >
        <header
          className="shrink-0 flex items-center justify-between pl-4 pr-[0.6rem] py-[0.55rem] bg-white/5 border-b border-line cursor-grab active:cursor-grabbing select-none touch-none max-md:cursor-default max-md:pt-[calc(0.55rem+env(safe-area-inset-top))]"
          onPointerDown={startMove}
          onDoubleClick={(e) => isDesktop() && !e.target.closest("button") && toggleMax()}
        >
          <span className="min-w-0 inline-flex items-center gap-2 text-muted text-[0.9rem]">
            {Icon && <Icon size={16} />} <span className="truncate">{title}</span>
          </span>
          <span className="flex items-center gap-[0.15rem] shrink-0">
            <button
              className={`${WINDOW_BTN} hover:bg-white/8 max-md:hidden`}
              onClick={toggleMax}
              aria-label={`${snap === "max" ? "Restaurer" : "Agrandir"} ${title}`}
              title={snap === "max" ? "Restaurer" : "Agrandir"}
            >
              {snap === "max" ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
            <button className={`${WINDOW_BTN} hover:bg-stage`} onClick={onClose} aria-label={`Fermer ${title}`} title="Fermer">
              <X size={18} />
            </button>
          </span>
        </header>
        <div
          ref={bodyRef}
          className={`@container flex-1 min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain [scrollbar-width:thin] [scrollbar-color:rgba(165,141,206,0.4)_transparent] focus:outline-none max-md:pb-[env(safe-area-inset-bottom)] ${
            action ? "pointer-events-none" : ""
          }`}
          tabIndex={-1}
          onScroll={(e) => (scrollMemory[scrollKey] = e.currentTarget.scrollTop)}
        >
          {children}
        </div>
        {!snap &&
          Object.entries(EDGES).map(([edge, place]) => (
            <span key={edge} className={`absolute z-3 touch-none max-md:hidden ${place}`} onPointerDown={startResize(edge)} aria-hidden="true" />
          ))}
      </motion.section>
    </>
  );
}
