import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { RotateCw } from "react-feather";

// Recul de la caméra par rapport au cadrage automatique, pour laisser de l'air autour du modèle
const ZOOM_OUT = 1.35;

// Pastilles posées sur la scène (indication de rotation, nom du modèle)
const OVERLAY = "absolute bottom-4 px-[0.85rem] py-[0.35rem] rounded-full bg-bg-deep/60 border border-line text-[0.8rem] pointer-events-none";

// La librairie 3D (lourde) n'est chargée que lorsqu'une fiche contient des modèles 3D
let loader;
const loadModelViewer = () => (loader ??= import("@google/model-viewer"));

export default function ModelGallery({ models }) {
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const current = models[active];
  const viewer = useRef(null);

  useEffect(() => {
    loadModelViewer().then(() => setReady(true));
  }, []);

  useEffect(() => {
    const el = viewer.current;
    if (!el) return;
    const onLoad = () => {
      const { theta, phi, radius } = el.getCameraOrbit();
      el.maxCameraOrbit = "auto auto 1000m";
      el.cameraOrbit = `${theta}rad ${phi}rad ${radius * ZOOM_OUT}m`;
      el.jumpCameraToGoal();
    };
    el.addEventListener("load", onLoad);
    return () => el.removeEventListener("load", onLoad);
  }, [ready, current.src]);

  return (
    <div className="mb-8">
      <div className="relative aspect-[16/10] max-sm:aspect-square rounded-win border border-line overflow-hidden bg-[radial-gradient(circle_at_50%_45%,rgba(83,18,196,0.55)_0%,rgba(10,7,64,0.9)_70%)]">
        {ready ? (
          <model-viewer
            key={current.src}
            ref={viewer}
            className="block size-full bg-transparent outline-none [--poster-color:transparent]"
            src={current.src}
            poster={current.thumb}
            alt={`Modèle 3D : ${current.label}`}
            camera-orbit={current.orbit}
            camera-controls=""
            auto-rotate=""
            auto-rotate-delay="1500"
            rotation-per-second="20deg"
            disable-zoom=""
            interaction-prompt="none"
            touch-action="pan-y"
            environment-image="neutral"
            exposure="1.1"
            shadow-intensity="1"
            shadow-softness="1"
          >
            {/* Pas de barre de chargement : la miniature (poster) s'affiche pendant le chargement */}
            <div slot="progress-bar" />
          </model-viewer>
        ) : (
          <img src={current.thumb} alt={current.label} className="size-full object-contain p-[10%]" />
        )}
        <span className={`${OVERLAY} right-4 flex items-center gap-[0.4rem] text-muted max-sm:hidden`}>
          <RotateCw size={14} /> Faites glisser pour pivoter
        </span>
        <span className={`${OVERLAY} left-4 text-[0.95rem]`}>{current.label}</span>
      </div>

      <div
        className="grid grid-cols-[repeat(auto-fill,minmax(84px,1fr))] gap-3 mt-4 max-sm:grid-cols-[repeat(auto-fill,minmax(64px,1fr))] max-sm:gap-2"
        role="listbox"
        aria-label="Choisir un modèle"
      >
        {models.map((m, i) => (
          <button
            key={m.src}
            role="option"
            aria-selected={i === active}
            className="relative aspect-square p-2 border border-line rounded-xl bg-surface cursor-pointer transition-[translate,border-color] duration-300 ease-soft hover:-translate-y-[3px] hover:border-primary"
            onClick={() => setActive(i)}
            title={m.label}
          >
            {i === active && (
              <motion.span
                layoutId="model-thumb"
                className="absolute -inset-px rounded-xl border-2 border-primary bg-primary/15"
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
              />
            )}
            <img src={m.thumb} alt={m.label} loading="lazy" width="360" height="360" className="relative size-full object-contain" />
          </button>
        ))}
      </div>
    </div>
  );
}
