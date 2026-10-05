import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import SmartImage from "../components/SmartImage.jsx";
import { projects, CATEGORIES } from "../data/projects.js";

const FILTERS = [{ id: "tous", label: "Tous" }, ...Object.entries(CATEGORIES).map(([id, label]) => ({ id, label }))];

function useColumnCount() {
  const get = () => (window.innerWidth > 1024 ? 3 : window.innerWidth > 640 ? 2 : 1);
  const [count, setCount] = useState(get);
  useEffect(() => {
    const onResize = () => setCount(get());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return count;
}

// Masonry : chaque carte va dans la colonne la moins haute (hauteur estimée grâce au ratio de l'image)
function toColumns(items, count) {
  const columns = Array.from({ length: count }, () => ({ height: 0, items: [] }));
  items.forEach((item) => {
    const shortest = columns.reduce((a, b) => (b.height < a.height ? b : a));
    shortest.items.push(item);
    shortest.height += item.height / item.width + 0.45;
  });
  return columns.map((c) => c.items);
}

function ProjectCard({ project, index, navigate }) {
  return (
    <motion.a
      href={`#projet-${project.id}`}
      className="project-card"
      onClick={(e) => {
        e.preventDefault();
        navigate(`projet-${project.id}`);
      }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08, ease: [0.25, 1, 0.5, 1] }}
    >
      <span className={`badge badge--${project.category}`}>{CATEGORIES[project.category]}</span>
      <div className="project-card__image">
        <SmartImage src={project.image} alt={project.title} width={project.width} height={project.height} eager={index < 3} />
      </div>
      <div className="project-card__info">
        <h2 className="project-card__title">{project.title}</h2>
        <p className="project-card__summary">{project.summary}</p>
        <div className="tags">
          {project.tags.slice(0, 3).map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
    </motion.a>
  );
}

export default function Projects({ filter, setFilter, navigate }) {
  const columnCount = useColumnCount();
  const visible = useMemo(
    () => (filter === "tous" ? projects : projects.filter((p) => p.category === filter)),
    [filter]
  );
  const columns = useMemo(() => toColumns(visible, columnCount), [visible, columnCount]);

  return (
    <section className="container projects">
      <h1 className="section-title text-center">Mes Projets</h1>

      <div className="filters" role="tablist" aria-label="Filtrer les projets">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            className={`filters__btn${filter === f.id ? " is-active" : ""}`}
            onClick={() => setFilter(f.id)}
          >
            {filter === f.id && (
              <motion.span layoutId="filter-pill" className="filters__pill" transition={{ type: "spring", stiffness: 420, damping: 36 }} />
            )}
            <span className="filters__label">{f.label}</span>
          </button>
        ))}
      </div>

      <motion.div
        key={filter}
        className="masonry"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {columns.map((col, c) => (
          <div className="masonry__col" key={c}>
            {col.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={visible.indexOf(project)}
                navigate={navigate}
              />
            ))}
          </div>
        ))}
      </motion.div>
    </section>
  );
}
