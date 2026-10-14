import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { User, Folder, Mail, FileText, Monitor, Image } from "react-feather";
import Window from "./Window.jsx";
import ProjectCarousel from "./ProjectCarousel.jsx";
import Typed from "../components/Typed.jsx";
import ProfileApp from "./apps/ProfileApp.jsx";
import ExplorerApp from "./apps/ExplorerApp.jsx";
import ViewerApp from "./apps/ViewerApp.jsx";
import TerminalApp from "./apps/TerminalApp.jsx";
import { getProject } from "../data/projects.js";
import { CV_URL, ROLES } from "./profile.js";

// Icônes qui ouvrent une fenêtre (l'id correspond à l'URL : #a-propos, #projets, #contact)
export const APPS = [
  { id: "a-propos", label: "À propos", icon: User },
  { id: "projets", label: "Projets", icon: Folder },
  { id: "contact", label: "Contact", icon: Mail },
];
// Fenêtre de fiche projet (#projet-<id>), ouverte depuis l'explorateur ou le carrousel
const VIEWER = "projet";
const WINDOW_IDS = [...APPS.map((a) => a.id), VIEWER];
const isWindow = (id) => WINDOW_IDS.includes(id);

function Clock() {
  const format = () => new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const [time, setTime] = useState(format);
  useEffect(() => {
    const timer = setInterval(() => setTime(format()), 10000);
    return () => clearInterval(timer);
  }, []);
  return <span className="tabular-nums max-md:hidden">{time}</span>;
}

// Icône de la barre (dock sur mobile) ; file : tuile en verre pour le CV, open : point sous l'icône
function DockIcon({ icon: Icon, label, open = false, file = false, ...props }) {
  return (
    <motion.a
      className={`group relative flex flex-col items-center gap-1 w-[74px] py-[0.35rem] rounded-[14px] no-underline transition-colors duration-300 hover:text-white hover:bg-white/6 max-md:flex-1 max-md:w-auto max-md:min-w-0 ${
        open
          ? "text-white after:absolute after:-bottom-0.5 after:size-[5px] after:rounded-full after:bg-primary after:content-['']"
          : "text-muted"
      }`}
      {...props}
    >
      <span
        className={`grid place-items-center size-11 rounded-xl transition-transform duration-300 ease-soft group-hover:-translate-y-[3px] group-hover:scale-[1.06] max-md:size-10 max-md:rounded-[11px] max-md:[&_svg]:size-[19px] ${
          file
            ? "bg-white/8 border border-primary/45 text-primary"
            : "bg-linear-135 from-violet to-primary text-white shadow-[0_6px_18px_rgba(83,18,196,0.45)]"
        }`}
      >
        <Icon size={22} />
      </span>
      <span className="text-xs whitespace-nowrap max-md:text-[0.68rem]">{label}</span>
    </motion.a>
  );
}

const drop = (i) => ({
  initial: { opacity: 0, y: -16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: 0.15 + i * 0.06, ease: [0.25, 1, 0.5, 1] },
});

export default function Desktop({ route, navigate, filter, setFilter, onReplayIntro }) {
  // Fenêtres ouvertes, de la plus ancienne à celle au premier plan
  const [open, setOpen] = useState(() => (isWindow(route.page) ? [route.page] : []));
  // Dernier projet affiché dans la visionneuse
  const [projectId, setProjectId] = useState(route.page === VIEWER ? route.id : null);
  const project = projectId ? getProject(projectId) : null;
  const layerRef = useRef(null);
  const barRef = useRef(null);
  // Hauteur de la barre : les fenêtres peuvent passer dessus, mais s'ouvrent et s'agrandissent en dessous
  const [barHeight, setBarHeight] = useState(0);

  useLayoutEffect(() => {
    const bar = barRef.current;
    const update = () => setBarHeight(bar.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);

  // L'URL pilote la fenêtre au premier plan (liens directs, bouton retour du navigateur)
  useEffect(() => {
    const { page } = route;
    if (page === VIEWER) setProjectId(route.id);
    if (isWindow(page)) setOpen((w) => [...w.filter((id) => id !== page), page]);
    else setOpen([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.key]);

  const hashFor = (id) => (id === VIEWER ? `projet-${projectId}` : id);
  const focus = (id) => setOpen((w) => (w[w.length - 1] === id ? w : [...w.filter((x) => x !== id), id]));
  const close = (id) => {
    const rest = open.filter((x) => x !== id);
    setOpen(rest);
    navigate(rest.length ? hashFor(rest[rest.length - 1]) : "accueil");
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape" || !open.length || document.querySelector("[data-lightbox]")) return;
      close(open[open.length - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const windows = {
    "a-propos": { title: "À propos", icon: User, content: <ProfileApp navigate={navigate} /> },
    projets: {
      title: "Projets",
      icon: Folder,
      content: <ExplorerApp filter={filter} setFilter={setFilter} navigate={navigate} />,
    },
    contact: { title: "Contact — terminal", icon: Mail, content: <TerminalApp /> },
    [VIEWER]: project && {
      title: `${project.title}`,
      icon: Image,
      scrollKey: `projet-${project.id}`,
      content: <ViewerApp key={project.id} project={project} navigate={navigate} />,
    },
  };

  return (
    <motion.main
      className="fixed inset-0 flex flex-col overflow-hidden max-md:[--dock-h:calc(100px+env(safe-area-inset-bottom))]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      style={{ "--bar-h": `${barHeight}px` }}
    >
      {/* Effet écran : lignes de balayage + vignette */}
      <div
        className="absolute inset-0 z-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.018)_0_1px,transparent_1px_3px),radial-gradient(ellipse_at_center,transparent_55%,rgba(5,3,30,0.55)_100%)]"
        aria-hidden="true"
      />

      {/* Mobile : seul le bouton « revoir l'intro » reste en haut, les icônes forment un dock fixe en bas */}
      <header
        ref={barRef}
        className="relative z-2 grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-3 bg-linear-to-b from-bg-deep/70 to-bg-deep/0 max-md:absolute max-md:top-0 max-md:right-0 max-md:block max-md:p-0 max-md:pt-[calc(0.75rem+env(safe-area-inset-top))] max-md:pr-3 max-md:bg-none"
      >
        <motion.a
          href="#accueil"
          className="text-xl font-black no-underline whitespace-nowrap max-lg:hidden"
          onClick={(e) => {
            e.preventDefault();
            navigate("accueil");
          }}
          {...drop(0)}
        >
          Adrien Onillon
        </motion.a>

        <nav
          className="col-start-2 flex items-center gap-2 px-[0.6rem] py-[0.45rem] rounded-[22px] bg-bg-deep/35 border border-white/7 shadow-[0_10px_30px_rgba(5,3,30,0.35)] backdrop-blur-[10px] max-md:fixed max-md:left-1/2 max-md:bottom-[calc(0.6rem+env(safe-area-inset-bottom))] max-md:-translate-x-1/2 max-md:w-[min(420px,calc(100%-1.5rem))] max-md:justify-around max-md:gap-0 max-md:p-[0.4rem] max-md:bg-bg-deep/72 max-md:border-line"
          aria-label="Navigation"
        >
          {APPS.map((app, i) => (
            <DockIcon
              key={app.id}
              href={`#${app.id}`}
              icon={app.icon}
              label={app.label}
              open={open.includes(app.id)}
              onClick={(e) => {
                e.preventDefault();
                navigate(app.id);
              }}
              {...drop(i + 1)}
            />
          ))}
          {/* Le CV se télécharge : tuile « fichier » distincte des fenêtres */}
          <DockIcon href={CV_URL} icon={FileText} label="CV" file download {...drop(APPS.length + 1)} />
        </nav>

        <motion.div className="col-start-3 justify-self-end flex items-center gap-3 text-muted" {...drop(APPS.length + 2)}>
          <Clock />
          {onReplayIntro && (
            <button
              className="grid place-items-center size-[38px] rounded-full border border-line bg-white/6 text-muted cursor-pointer transition-colors duration-300 hover:text-white hover:border-primary max-md:size-9"
              onClick={onReplayIntro}
              title="Revoir l'intro"
              aria-label="Revoir l'intro"
            >
              <Monitor size={18} />
            </button>
          )}
        </motion.div>
      </header>

      <div className="relative z-1 flex-1 min-h-0 flex">
        {/* Quand une fenêtre est ouverte, le fond du bureau s'efface.
            Mobile : trois rangées — nom (centré entre le haut et le carrousel), carrousel,
            légende + flèches (centrées entre le carrousel et le dock) */}
        <section
          className={`flex-1 min-w-0 flex flex-col items-center px-4 pt-[clamp(0.75rem,3vh,2rem)] pb-5 transition-[opacity,filter] duration-400 ease-soft max-md:grid max-md:grid-rows-[1fr_auto_1fr] max-md:justify-items-stretch max-md:px-0 max-md:pt-[env(safe-area-inset-top)] max-md:pb-(--dock-h) ${
            open.length ? "opacity-35 blur-[3px] max-md:invisible" : ""
          }`}
        >
          <motion.div className="flex flex-col items-center gap-[0.4rem] text-center max-md:self-center max-md:px-14" {...drop(2)}>
            <h1 className="font-title text-[clamp(1.8rem,4.5vw,3rem)] font-black leading-[1.15] max-md:text-[clamp(2.2rem,10vw,2.8rem)]">
              Adrien <span className="text-primary">Onillon</span>
            </h1>
            <p className="text-[clamp(1rem,2.2vw,1.4rem)] min-h-[1.6em] text-muted max-md:text-[1.2rem]">
              <Typed words={ROLES} />
            </p>
          </motion.div>
          <motion.div
            className="flex-1 min-h-0 w-full max-md:contents"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 1, 0.5, 1] }}
          >
            <ProjectCarousel navigate={navigate} paused={open.length > 0} />
          </motion.div>
        </section>
      </div>

      {/* Couche des fenêtres : couvre tout le bureau, barre de navigation comprise */}
      <div ref={layerRef} className="absolute inset-0 z-3 pointer-events-none">
        <AnimatePresence>
          {/* Attend la mesure de la barre pour placer les fenêtres dessous */}
          {barHeight > 0 &&
            open.map((id, z) => {
              const win = windows[id];
              if (!win) return null;
              return (
                <Window
                  key={id}
                  id={id}
                  title={win.title}
                  icon={win.icon}
                  index={WINDOW_IDS.indexOf(id)}
                  scrollKey={win.scrollKey}
                  z={z + 1}
                  focused={z === open.length - 1}
                  onFocus={() => focus(id)}
                  onClose={() => close(id)}
                  layerRef={layerRef}
                  topInset={barHeight}
                >
                  {win.content}
                </Window>
              );
            })}
        </AnimatePresence>
      </div>
    </motion.main>
  );
}
