import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationFrame, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "react-feather";
import { projects, CATEGORIES } from "../data/projects.js";
import { badge } from "../ui.js";

const ARROW =
  "shrink-0 grid place-items-center size-11 rounded-full border border-line bg-white/6 cursor-pointer transition-colors duration-300 hover:border-primary hover:bg-primary/15 max-md:size-[38px]";

const N = projects.length;
const STEP = 360 / N;
const AUTO_SPEED = -7; // degrés par seconde
const TILT = 7; // inclinaison de l'anneau (degrés)
const TILT_SIN = Math.sin((TILT * Math.PI) / 180);
const wrap = (deg) => ((((deg + 180) % 360) + 360) % 360) - 180;

/*
  Carrousel 3D (CSS) : les projets tournent en anneau au centre du bureau.
  Glisser pour tourner, cliquer sur une carte la ramène devant, cliquer sur la carte de devant ouvre le projet.
*/
// paused : une fenêtre est ouverte par-dessus, le carrousel (flouté derrière) arrête de tourner
export default function ProjectCarousel({ navigate, paused = false }) {
  const reduced = useReducedMotion();
  const stageRef = useRef(null);
  const ringRef = useRef(null);
  const cardRefs = useRef([]);
  // Dernière opacité écrite pour chaque carte : on ne touche au style que s'il change
  const cardOpacity = useRef([]);
  const lastRing = useRef("");
  const angle = useRef(0);
  const velocity = useRef(0);
  const target = useRef(null);
  const drag = useRef(null);
  const hovering = useRef(false);
  const suppressClick = useRef(false);
  const [geo, setGeo] = useState({ card: 220, radius: 600 });
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  // Taille des cartes et rayon de l'anneau selon la place disponible
  useLayoutEffect(() => {
    const stage = stageRef.current;
    const update = () => {
      const { width, height } = stage.getBoundingClientRect();
      // Cartes en 4:3 : la carte de devant occupe jusqu'à ~70 % de la hauteur disponible
      const card = Math.max(150, Math.min(460, width * (width < 640 ? 0.72 : 0.32), height * 0.95));
      const radius = (card * 1.15) / (2 * Math.tan(Math.PI / N));
      setGeo({ card, radius });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    // En pause, on ne fait que le premier placement des cartes
    if (paused && lastRing.current) return;
    const dt = Math.min(delta, 50) / 1000;
    if (!drag.current) {
      if (target.current !== null) {
        angle.current += (target.current - angle.current) * (1 - Math.exp(-dt * 7));
        if (Math.abs(target.current - angle.current) < 0.05) target.current = null;
      } else {
        velocity.current *= Math.exp(-dt * 2.5);
        const auto = reduced || hovering.current ? 0 : AUTO_SPEED;
        angle.current += (velocity.current + auto) * dt;
      }
    }

    // L'inclinaison abaisse la carte de devant de R·sin(TILT) et remonte la rangée arrière (vue à mi-taille) :
    // on centre verticalement l'ensemble visible, du haut de la rangée arrière au bas de la carte de devant
    const lift = (geo.radius * TILT_SIN) / 2 + geo.card * 0.094;
    const ring = `translateY(${-lift}px) translateZ(${-geo.radius}px) rotateX(${-TILT}deg) rotateY(${angle.current.toFixed(3)}deg)`;
    if (ringRef.current && ring !== lastRing.current) {
      ringRef.current.style.transform = ring;
      lastRing.current = ring;
    }
    let front = 0;
    let best = Infinity;
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const rel = wrap(i * STEP + angle.current);
      const facing = Math.cos((rel * Math.PI) / 180);
      const opacity = Math.round((0.12 + 0.88 * Math.max(0, facing) ** 1.5) * 100) / 100;
      if (opacity !== cardOpacity.current[i]) {
        cardOpacity.current[i] = opacity;
        card.style.opacity = String(opacity);
        card.style.pointerEvents = facing > 0.2 ? "auto" : "none";
      }
      if (Math.abs(rel) < best) {
        best = Math.abs(rel);
        front = i;
      }
    });
    if (front !== activeRef.current) {
      activeRef.current = front;
      setActive(front);
    }
  });

  const goTo = useCallback((i) => {
    const base = target.current ?? angle.current;
    target.current = base + wrap(-i * STEP - base);
    velocity.current = 0;
  }, []);

  // Glisser (souris ou doigt) : suit le pointeur puis garde de l'inertie
  useEffect(() => {
    const onMove = (e) => {
      const d = drag.current;
      if (!d) return;
      const dx = e.clientX - d.x;
      const now = performance.now();
      const degPerPx = 180 / (Math.PI * geo.radius);
      angle.current += dx * degPerPx;
      velocity.current = ((dx * degPerPx) / Math.max(1, now - d.t)) * 1000;
      d.moved += Math.abs(dx);
      d.x = e.clientX;
      d.t = now;
      if (d.moved > 6) suppressClick.current = true;
    };
    const onUp = () => {
      if (!drag.current) return;
      drag.current = null;
      velocity.current = Math.max(-240, Math.min(240, velocity.current));
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [geo.radius]);

  const project = projects[active];

  return (
    // Mobile : l'enveloppe disparaît (contents), la scène et la légende deviennent des rangées de la grille du bureau
    <div className="h-full flex flex-col max-md:contents">
      <div
        ref={stageRef}
        className="flex-1 min-h-[220px] grid place-items-center overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y select-none max-md:flex-none max-md:min-h-0 max-md:h-[min(calc(72vw+16px),50vh)]"
        style={{ perspective: `${geo.radius * 2}px`, "--card": `${geo.card}px` }}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          drag.current = { x: e.clientX, t: performance.now(), moved: 0 };
          target.current = null;
          suppressClick.current = false;
        }}
        onPointerEnter={(e) => e.pointerType === "mouse" && (hovering.current = true)}
        onPointerLeave={() => (hovering.current = false)}
        onWheel={(e) => {
          target.current = null;
          velocity.current -= (e.deltaX || e.deltaY) * 0.4;
        }}
        onClickCapture={(e) => {
          if (suppressClick.current) {
            e.preventDefault();
            e.stopPropagation();
            suppressClick.current = false;
          }
        }}
      >
        <div ref={ringRef} className="relative w-(--card) h-[calc(var(--card)*0.75)] transform-3d">
          {projects.map((p, i) => (
            <a
              key={p.id}
              ref={(el) => (cardRefs.current[i] = el)}
              href={`#projet-${p.id}`}
              className={`absolute inset-0 rounded-[14px] overflow-hidden border bg-surface-strong transition-[border-color,box-shadow] duration-300 [-webkit-user-drag:none] ${
                i === active
                  ? "border-primary shadow-[0_18px_50px_rgba(83,18,196,0.6),0_0_30px_rgba(165,141,206,0.35)]"
                  : "border-line shadow-[0_18px_40px_rgba(5,3,30,0.55)]"
              }`}
              style={{ transform: `rotateY(${i * STEP}deg) translateZ(${geo.radius}px)` }}
              draggable={false}
              onFocus={() => goTo(i)}
              onClick={(e) => {
                e.preventDefault();
                if (i === activeRef.current) navigate(`projet-${p.id}`);
                else goTo(i);
              }}
              aria-label={`${p.title} — ${CATEGORIES[p.category]}`}
            >
              <img
                src={p.thumb}
                srcSet={p.thumbSet}
                sizes={`${Math.round(geo.card)}px`}
                alt=""
                loading={i < 4 || i > N - 4 ? "eager" : "lazy"}
                draggable={false}
                className="size-full object-cover pointer-events-none"
              />
            </a>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-5 px-4 max-md:gap-2 max-md:self-center">
        <button className={ARROW} onClick={() => goTo(activeRef.current - 1)} aria-label="Projet précédent">
          <ChevronLeft />
        </button>
        <div className="w-[min(480px,100%)] min-h-[7.2rem] text-center max-md:min-h-[5.6rem]" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <span className={`${badge(project.category)} mb-[0.4rem]`}>{CATEGORIES[project.category]}</span>
              <h2 className="text-[1.15rem] leading-[1.3] font-bold">{project.title}</h2>
              <p className="text-muted text-[0.88rem] leading-[1.45] line-clamp-2">{project.summary}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <button className={ARROW} onClick={() => goTo(activeRef.current + 1)} aria-label="Projet suivant">
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
