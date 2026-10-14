import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useProgress } from "@react-three/drei";
import { CornerDownLeft, FastForward } from "react-feather";
import IntroScene from "./IntroScene.jsx";
import Loader from "../components/Loader.jsx";
import { cta } from "../ui.js";
import { AUTO_ENTER_DELAY, INTRO_MODEL, INTRO_SEEN_KEY } from "./config.js";

// Utilise intro.glb s'il existe, sinon la scène provisoire
async function modelExists() {
  try {
    const res = await fetch(INTRO_MODEL, { method: "HEAD" });
    return res.ok && !(res.headers.get("content-type") ?? "").includes("text/html");
  } catch {
    return false;
  }
}

// Polices du site (titre, texte, code) chargées avant de lever le rideau, pour éviter tout saut d'affichage
function loadFonts() {
  if (!document.fonts) return Promise.resolve();
  const fonts = ['900 1em "Novaro"', '1em "Aldrich"', '1em "JetBrains Mono"'];
  return Promise.all(fonts.map((f) => document.fonts.load(f).catch(() => null)));
}

// Délai entre la fin du chargement et le fondu de l'écran de chargement (la barre finit de se remplir)
const LOADER_OUTRO = 500;

function markSeen() {
  try {
    sessionStorage.setItem(INTRO_SEEN_KEY, "1");
  } catch {
    /* stockage indisponible : l'intro sera rejouée, sans gravité */
  }
}

/*
  Intro plein écran : scène 3D en attente → plongée dans l'écran → fondu vers le bureau.
  onReveal : le bureau peut s'afficher sous l'intro ; onDone : l'intro peut être démontée.
*/
export default function Intro({ onReveal, onDone }) {
  const [useModel, setUseModel] = useState(null);
  const [setup, setSetup] = useState(null);
  const [fontsReady, setFontsReady] = useState(false);
  const [ready, setReady] = useState(false);
  const [diving, setDiving] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const fadeRef = useRef(null);
  const { progress } = useProgress();

  useEffect(() => {
    let alive = true;
    modelExists().then((exists) => alive && setUseModel(exists));
    loadFonts().then(() => alive && setFontsReady(true));
    return () => {
      alive = false;
    };
  }, []);

  // Tout est prêt (modèles, textures, polices, scène montée) : la barre finit de se remplir, puis on révèle
  const loaded = Boolean(setup) && fontsReady;
  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => setReady(true), LOADER_OUTRO);
    return () => clearTimeout(timer);
  }, [loaded]);

  // Progression : 10 % (code de l'intro) + 80 % (fichiers 3D) + 5 % (polices) + 5 % (scène montée)
  const loadPct = loaded ? 100 : 10 + (useModel === null ? 0 : progress * 0.8) + (fontsReady ? 5 : 0) + (setup ? 5 : 0);
  let loadLabel = "Préparation de la scène";
  if (loaded) loadLabel = "Prêt";
  else if (useModel === null) loadLabel = "Initialisation";
  else if (progress < 100) loadLabel = "Chargement de la scène 3D";
  else if (!fontsReady) loadLabel = "Chargement des polices";

  const enter = useCallback(() => {
    if (!ready || diving || leaving) return;
    markSeen();
    setDiving(true);
  }, [ready, diving, leaving]);

  const leave = useCallback(() => {
    if (leaving) return;
    markSeen();
    setLeaving(true);
    onReveal();
  }, [leaving, onReveal]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        enter();
      } else if (e.key === "Escape") leave();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enter, leave]);

  useEffect(() => {
    if (!ready || diving) return;
    const timer = setTimeout(enter, AUTO_ENTER_DELAY * 1000);
    return () => clearTimeout(timer);
  }, [ready, diving, enter]);

  return (
    <motion.div
      className="fixed inset-0 z-500 bg-bg-deep"
      initial={false}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      onAnimationComplete={() => leaving && onDone()}
    >
      {useModel !== null && (
        <IntroScene
          useModel={useModel}
          setup={setup}
          onSetup={setSetup}
          entering={diving}
          onDiveEnd={leave}
          fadeRef={fadeRef}
          onClick={enter}
        />
      )}
      <div ref={fadeRef} className="absolute inset-0 bg-bg opacity-0 pointer-events-none" />

      <AnimatePresence>
        {!ready && <Loader key="loader" progress={loadPct} label={loadLabel} />}
        {ready && !diving && !leaving && (
          <motion.div
            key="prompt"
            className="absolute left-1/2 bottom-[max(2.5rem,6vh)] -translate-x-1/2 flex flex-col items-center gap-4 text-center pointer-events-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 1, 0.5, 1] }}
          >
            <p className="font-title text-[clamp(1.6rem,5vw,2.6rem)] font-black text-shadow-[0_4px_30px_rgba(10,7,64,0.9)] whitespace-nowrap">
              Adrien <span className="text-primary">Onillon</span>
            </p>
            <button className={`${cta()} pointer-events-auto`} onClick={enter}>
              Entrer <CornerDownLeft size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!leaving && (
        <button
          className="absolute top-5 right-5 inline-flex items-center gap-2 px-4 py-[0.55rem] rounded-full border border-line bg-bg-deep/55 backdrop-blur-sm text-muted text-[0.85rem] cursor-pointer transition-colors duration-300 hover:text-white hover:border-primary"
          onClick={leave}
        >
          Passer l'intro <FastForward size={16} />
        </button>
      )}
    </motion.div>
  );
}
