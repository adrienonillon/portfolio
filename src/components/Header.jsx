import { useEffect, useState } from "react";
import { motion } from "motion/react";

const LINKS = [
  { id: "accueil", label: "Accueil" },
  { id: "a-propos", label: "À propos" },
  { id: "projets", label: "Projets" },
  { id: "contact", label: "Contact" },
];

const CV_URL = `${import.meta.env.BASE_URL}assets/CV%20-%20Adrien%20Onillon%20.pdf`;

export default function Header({ page, navigate }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (e, id) => {
    e.preventDefault();
    setOpen(false);
    navigate(id);
  };

  return (
    <header className={`header${scrolled ? " is-scrolled" : ""}`}>
      <div className="container header__inner">
        <a href="#accueil" className="logo" onClick={(e) => go(e, "accueil")}>
          Adrien Onillon
        </a>

        <button
          className={`burger${open ? " is-active" : ""}`}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
        </button>

        <nav className={`nav${open ? " is-open" : ""}`}>
          {LINKS.map((link, i) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={`nav__link${page === link.id ? " is-active" : ""}`}
              style={{ "--i": i }}
              aria-current={page === link.id ? "page" : undefined}
              onClick={(e) => go(e, link.id)}
            >
              {page === link.id && (
                <motion.span
                  layoutId="nav-pill"
                  className="nav__pill"
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />
              )}
              <span className="nav__label">{link.label}</span>
            </a>
          ))}
          <a href={CV_URL} className="nav__link" style={{ "--i": LINKS.length }} download>
            <span className="nav__label">CV</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
