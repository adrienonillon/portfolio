import { useCallback, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, Maximize2 } from "react-feather";
import SmartImage from "../../components/SmartImage.jsx";
import ModelGallery from "../../components/ModelGallery.jsx";
import Lightbox from "../../components/Lightbox.jsx";
import { projects, CATEGORIES } from "../../data/projects.js";
import { appBtn, appLabel, appPath, appToolbar, badge, cta, panel, segmented, segmentedItem } from "../../ui.js";

const PAGER_LINK =
  "flex items-center gap-4 px-5 py-4 rounded-[14px] border border-line bg-white/4 no-underline transition-colors duration-300 hover:border-primary hover:bg-primary/10 [&_svg]:shrink-0 [&_svg]:text-primary";
const PAGER_SMALL = "block font-mono text-[0.72rem] text-muted";

const reveal = (delay) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.25, 1, 0.5, 1] },
});

// Application « Projet » : visionneuse de fichier, ouverte depuis l'explorateur ou le carrousel
export default function ViewerApp({ project, navigate }) {
  const index = projects.indexOf(project);
  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];
  const cover = project.showCover === false ? null : { image: project.image, width: project.width, height: project.height, label: project.title };
  const gallery = project.gallery ?? [];
  // Toutes les images de la fiche, dans l'ordre d'affichage, pour la visionneuse plein écran
  const viewable = [...(cover ? [cover] : []), ...gallery];
  const [lightbox, setLightbox] = useState(null);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  const go = (e, hash) => {
    e.preventDefault();
    navigate(hash);
  };

  const props = [
    ["Catégorie", CATEGORIES[project.category]],
    ["Contexte", project.context],
    ["Durée", project.duration],
  ].filter(([, v]) => v);

  return (
    <article>
      <div className={appToolbar}>
        <a href="#projets" className={appBtn()} onClick={(e) => go(e, "projets")}>
          <ArrowLeft size={16} /> <span>Projets</span>
        </a>
        <span className={appPath}>
          ~/projets/{project.category}/<span>{project.id}</span>
        </span>
        <div className={segmented}>
          <a className={segmentedItem()} href={`#projet-${prev.id}`} onClick={(e) => go(e, `projet-${prev.id}`)} aria-label={`Projet précédent : ${prev.title}`}>
            <ChevronLeft size={16} />
          </a>
          <span className="px-[0.35rem] font-mono text-xs text-muted">
            {index + 1}/{projects.length}
          </span>
          <a className={segmentedItem()} href={`#projet-${next.id}`} onClick={(e) => go(e, `projet-${next.id}`)} aria-label={`Projet suivant : ${next.title}`}>
            <ChevronRight size={16} />
          </a>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-[clamp(1rem,3vw,2.25rem)] pt-7 pb-10" key={project.id}>
        <motion.header className="mb-6" {...reveal(0)}>
          <span className={`${badge(project.category)} mb-3`}>{CATEGORIES[project.category]}</span>
          <h1 className="mt-[0.15rem] mb-2 font-title text-[clamp(1.6rem,3.6vw,2.4rem)] leading-[1.15] font-bold">
            {project.detailTitle ?? project.title}
          </h1>
          <p className="text-muted">{project.summary}</p>
        </motion.header>

        {cover && (
          <motion.button
            className="group relative flex justify-center w-full mb-6 rounded-[14px] border border-line overflow-hidden bg-black/30 cursor-zoom-in"
            onClick={() => setLightbox(0)} aria-label="Agrandir l'image" {...reveal(0.08)}>
            <SmartImage
              src={cover.image}
              alt={project.title}
              width={cover.width}
              height={cover.height}
              eager
              className="w-auto h-auto max-h-[62vh] object-contain transition-opacity duration-500"
            />
            <span
              className="absolute top-[0.85rem] right-[0.85rem] flex p-2 rounded-full bg-bg-deep/60 border border-line opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
              aria-hidden="true"
            >
              <Maximize2 size={16} />
            </span>
          </motion.button>
        )}

        {project.models && (
          <motion.div {...reveal(0.12)}>
            <ModelGallery models={project.models} />
          </motion.div>
        )}

        {gallery.length > 0 && (
          // Colonnes choisies par projet (--cols), réduites quand la fenêtre est étroite
          <div
            className="grid grid-cols-[repeat(var(--cols),minmax(0,1fr))] gap-4 mb-6 @max-5xl:grid-cols-[repeat(min(var(--cols),3),minmax(0,1fr))] @max-3xl:grid-cols-[repeat(min(var(--cols),2),minmax(0,1fr))] @max-3xl:gap-[0.6rem]"
            style={{ "--cols": project.galleryColumns ?? 2 }}
          >
            {gallery.map((img) => (
              <button
                key={img.image}
                className="group relative block overflow-hidden rounded-xl border border-line bg-black/35 cursor-zoom-in transition-[border-color,translate] duration-300 ease-soft hover:border-primary hover:-translate-y-[3px]"
                onClick={() => setLightbox(viewable.indexOf(img))}
                aria-label={`Agrandir : ${img.label}`}
              >
                <SmartImage
                  src={img.image}
                  alt={img.label}
                  width={img.width}
                  height={img.height}
                  className="w-full h-auto transition-[scale,opacity] duration-500 ease-soft group-hover:scale-[1.03]"
                />
                {img.label && (
                  <span className="absolute left-[0.6rem] bottom-[0.6rem] px-[0.65rem] py-[0.2rem] rounded-full bg-bg-deep/75 text-[0.78rem]">
                    {img.label}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        <motion.div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-5 items-start @max-3xl:grid-cols-[minmax(0,1fr)]" {...reveal(0.16)}>
          <section className={panel}>
            <h2 className={appLabel}>Description</h2>
            <p className="text-muted leading-[1.75]">{project.description}</p>
          </section>
          <aside className={panel}>
            <h2 className={appLabel}>Propriétés</h2>
            <dl>
              {props.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2 border-b border-dashed border-line">
                  <dt className="font-mono text-[0.78rem] text-muted">{k}</dt>
                  <dd className="text-[0.9rem] text-right">{v}</dd>
                </div>
              ))}
            </dl>
            <h2 className={appLabel}>Compétences</h2>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((t) => (
                <span key={t} className="px-3 py-1 rounded-full bg-tag text-muted text-xs">
                  {t}
                </span>
              ))}
            </div>
            {project.links.length > 0 && (
              <div className="flex flex-col items-start gap-[0.6rem] mt-6">
                {project.links.map((link) => (
                  <a key={link.url} href={link.url} className={cta(true)} target="_blank" rel="noopener noreferrer">
                    {link.label} <ExternalLink size={16} />
                  </a>
                ))}
              </div>
            )}
          </aside>
        </motion.div>

        <nav className="grid grid-cols-2 gap-4 mt-8 @max-3xl:grid-cols-[minmax(0,1fr)]" aria-label="Autres projets">
          <a href={`#projet-${prev.id}`} className={PAGER_LINK} onClick={(e) => go(e, `projet-${prev.id}`)}>
            <ChevronLeft size={18} />
            <span>
              <small className={PAGER_SMALL}>Précédent</small>
              {prev.title}
            </span>
          </a>
          <a href={`#projet-${next.id}`} className={`${PAGER_LINK} justify-end text-right`} onClick={(e) => go(e, `projet-${next.id}`)}>
            <span>
              <small className={PAGER_SMALL}>Suivant</small>
              {next.title}
            </span>
            <ChevronRight size={18} />
          </a>
        </nav>
      </div>
      <Lightbox items={viewable} index={lightbox} onClose={closeLightbox} onChange={setLightbox} />
    </article>
  );
}
