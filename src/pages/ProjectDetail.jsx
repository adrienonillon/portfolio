import { useCallback, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, ExternalLink, Maximize2 } from "react-feather";
import SmartImage from "../components/SmartImage.jsx";
import ModelGallery from "../components/ModelGallery.jsx";
import Lightbox from "../components/Lightbox.jsx";
import { projects, CATEGORIES } from "../data/projects.js";

const reveal = (delay) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 1, 0.5, 1] },
});

export default function ProjectDetail({ project, navigate }) {
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

  return (
    <article className="container detail">
      <motion.header className="detail__header" {...reveal(0)}>
        <a href="#projets" className="back-link" onClick={(e) => go(e, "projets")}>
          <ArrowLeft size={18} /> Retour aux projets
        </a>
        <span className={`badge badge--inline badge--${project.category}`}>{CATEGORIES[project.category]}</span>
        <h1 className="detail__title">{project.detailTitle ?? project.title}</h1>
      </motion.header>

      {cover && (
        <motion.button className="detail__media" onClick={() => setLightbox(0)} aria-label="Agrandir l'image" {...reveal(0.1)}>
          <SmartImage src={cover.image} alt={project.title} width={cover.width} height={cover.height} eager />
          <span className="zoom-hint" aria-hidden="true"><Maximize2 size={16} /></span>
        </motion.button>
      )}

      {project.models && (
        <motion.div {...reveal(0.15)}>
          <ModelGallery models={project.models} />
        </motion.div>
      )}

      {gallery.length > 0 && (
        <div className="detail__gallery" style={{ "--cols": project.galleryColumns ?? 2 }}>
          {gallery.map((img, i) => (
            <motion.button
              key={img.image}
              className="detail__gallery-item"
              onClick={() => setLightbox(viewable.indexOf(img))}
              aria-label={`Agrandir : ${img.label}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -40px 0px" }}
              transition={{ duration: 0.5, delay: (i % (project.galleryColumns ?? 2)) * 0.06 }}
            >
              <SmartImage src={img.image} alt={img.label} width={img.width} height={img.height} />
              {img.label && <span className="detail__gallery-label">{img.label}</span>}
            </motion.button>
          ))}
        </div>
      )}

      <div className="detail__grid">
        <motion.div className="card detail__card" {...reveal(0.2)}>
          <h2>Description</h2>
          <p>{project.description}</p>
        </motion.div>
        <motion.aside className="card detail__card" {...reveal(0.3)}>
          {project.context && (
            <>
              <h2>Contexte</h2>
              <p className="detail__meta">{project.context}</p>
            </>
          )}
          {project.duration && (
            <>
              <h2>Durée</h2>
              <p className="detail__meta">{project.duration}</p>
            </>
          )}
          <h2>Compétences</h2>
          <div className="tags tags--detail">
            {project.tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          {project.links.length > 0 && (
            <div className="detail__links">
              {project.links.map((link) => (
                <a key={link.url} href={link.url} className="cta cta--small" target="_blank" rel="noopener noreferrer">
                  {link.label} <ExternalLink size={16} />
                </a>
              ))}
            </div>
          )}
        </motion.aside>
      </div>

      <nav className="detail__pager" aria-label="Autres projets">
        <a href={`#projet-${prev.id}`} onClick={(e) => go(e, `projet-${prev.id}`)}>
          <ArrowLeft size={18} />
          <span>
            <small>Précédent</small>
            {prev.title}
          </span>
        </a>
        <a href={`#projet-${next.id}`} className="is-next" onClick={(e) => go(e, `projet-${next.id}`)}>
          <span>
            <small>Suivant</small>
            {next.title}
          </span>
          <ArrowRight size={18} />
        </a>
      </nav>
      <Lightbox items={viewable} index={lightbox} onClose={closeLightbox} onChange={setLightbox} />
    </article>
  );
}
