import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig } from "motion/react";
import Header from "./components/Header.jsx";
import Aurora from "./components/Aurora.jsx";
import Page from "./components/Page.jsx";
import ScrollProgress from "./components/ScrollProgress.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Projects from "./pages/Projects.jsx";
import ProjectDetail from "./pages/ProjectDetail.jsx";
import Contact from "./pages/Contact.jsx";
import { useHashRoute } from "./useHashRoute.js";
import { getProject } from "./data/projects.js";

export default function App() {
  const [route, navigate] = useHashRoute();
  const [filter, setFilter] = useState("tous");

  // Mémorise la position de scroll de chaque page (retour sur la grille de projets au même endroit)
  const scrollPositions = useRef({});
  const currentKey = useRef(route.key);
  currentKey.current = route.key;

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    const onScroll = () => (scrollPositions.current[currentKey.current] = window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const project = route.page === "projet" ? getProject(route.id) : null;
  useEffect(() => {
    if (route.page === "projet" && !project) navigate("projets");
  }, [route.page, project, navigate]);

  let content;
  switch (route.page) {
    case "a-propos":
      content = <About />;
      break;
    case "projets":
      content = <Projects filter={filter} setFilter={setFilter} navigate={navigate} />;
      break;
    case "contact":
      content = <Contact />;
      break;
    case "projet":
      content = project && <ProjectDetail project={project} navigate={navigate} />;
      break;
    default:
      content = <Home navigate={navigate} />;
  }

  // Les fiches projet restaurent toujours le haut de page
  const restore = route.page === "projet" ? 0 : scrollPositions.current[route.key] ?? 0;

  return (
    <MotionConfig reducedMotion="user">
      <Aurora />
      {(route.page === "projets" || route.page === "projet") && <ScrollProgress />}
      <Header page={route.page === "projet" ? "projets" : route.page} navigate={navigate} />
      <AnimatePresence mode="wait" initial={false}>
        <Page key={route.key} restoreScroll={restore} centered={["accueil", "a-propos", "contact"].includes(route.page)}>
          {content}
        </Page>
      </AnimatePresence>
    </MotionConfig>
  );
}
