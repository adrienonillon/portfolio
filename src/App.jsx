import { lazy, Suspense, useEffect, useState } from "react";
import { AnimatePresence, MotionConfig } from "motion/react";
import Aurora from "./components/Aurora.jsx";
import Loader from "./components/Loader.jsx";
import Desktop from "./desktop/Desktop.jsx";
import { useHashRoute } from "./useHashRoute.js";
import { getProject } from "./data/projects.js";
import { INTRO_SEEN_KEY } from "./intro/config.js";

// L'intro 3D (Three.js) n'est téléchargée que si elle est jouée
const Intro = lazy(() => import("./intro/Intro.jsx"));

function hasWebGL() {
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
}

// Intro jouée à la première arrivée sur l'accueil, une fois par visite
function shouldPlayIntro(page) {
  if (page !== "accueil") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    if (sessionStorage.getItem(INTRO_SEEN_KEY)) return false;
  } catch {
    /* stockage indisponible */
  }
  return hasWebGL();
}

export default function App() {
  const [route, navigate] = useHashRoute();
  const [filter, setFilter] = useState("tous");
  // intro → reveal (le bureau apparaît sous l'intro qui s'efface) → done
  const [introPhase, setIntroPhase] = useState(() => (shouldPlayIntro(route.page) ? "intro" : "done"));

  const project = route.page === "projet" ? getProject(route.id) : null;
  useEffect(() => {
    if (route.page === "projet" && !project) navigate("projets");
  }, [route.page, project, navigate]);

  const showDesktop = introPhase !== "intro";

  return (
    <MotionConfig reducedMotion="user">
      <Aurora />

      {/* Tout le site est un bureau : les pages sont des fenêtres (#a-propos, #projets, #contact, #projet-<id>) */}
      <AnimatePresence initial={false}>
        {showDesktop && (
          <Desktop
            key="desktop"
            route={route}
            navigate={navigate}
            filter={filter}
            setFilter={setFilter}
            onReplayIntro={hasWebGL() ? () => setIntroPhase("intro") : undefined}
          />
        )}
      </AnimatePresence>

      {introPhase !== "done" && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-500 bg-bg-deep">
              <Loader progress={0} label="Initialisation" />
            </div>
          }
        >
          <Intro onReveal={() => setIntroPhase("reveal")} onDone={() => setIntroPhase("done")} />
        </Suspense>
      )}
    </MotionConfig>
  );
}
