import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { RotateCw } from "react-feather";

// Recul de la caméra par rapport au cadrage automatique, pour laisser de l'air autour du modèle
const ZOOM_OUT = 1.35;

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
    <div className="model-gallery">
      <div className="model-gallery__stage">
        {ready ? (
          <model-viewer
            key={current.src}
            ref={viewer}
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
          <img src={current.thumb} alt={current.label} className="model-gallery__poster" />
        )}
        <span className="model-gallery__hint">
          <RotateCw size={14} /> Faites glisser pour pivoter
        </span>
        <span className="model-gallery__label">{current.label}</span>
      </div>

      <div className="model-gallery__thumbs" role="listbox" aria-label="Choisir un modèle">
        {models.map((m, i) => (
          <button
            key={m.src}
            role="option"
            aria-selected={i === active}
            className={`model-gallery__thumb${i === active ? " is-active" : ""}`}
            onClick={() => setActive(i)}
            title={m.label}
          >
            {i === active && (
              <motion.span layoutId="model-thumb" className="model-gallery__ring" transition={{ type: "spring", stiffness: 420, damping: 36 }} />
            )}
            <img src={m.thumb} alt={m.label} loading="lazy" width="360" height="360" />
          </button>
        ))}
      </div>
    </div>
  );
}
