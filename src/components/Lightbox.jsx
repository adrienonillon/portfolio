import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight } from "react-feather";

// Visionneuse plein écran : clic / Échap pour fermer, flèches (clavier ou boutons) pour naviguer
export default function Lightbox({ items, index, onClose, onChange }) {
  const open = index !== null;
  const item = open ? items[index] : null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onChange((index + 1) % items.length);
      if (e.key === "ArrowLeft") onChange((index - 1 + items.length) % items.length);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, index, items.length, onClose, onChange]);

  const nav = (e, step) => {
    e.stopPropagation();
    onChange((index + step + items.length) % items.length);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={item.label}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.img
            key={item.image}
            src={item.image}
            alt={item.label}
            className="lightbox__img"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
          />
          <button className="lightbox__close" onClick={onClose} aria-label="Fermer">
            <X />
          </button>
          {items.length > 1 && (
            <>
              <button className="lightbox__nav lightbox__nav--prev" onClick={(e) => nav(e, -1)} aria-label="Image précédente">
                <ChevronLeft size={28} />
              </button>
              <button className="lightbox__nav lightbox__nav--next" onClick={(e) => nav(e, 1)} aria-label="Image suivante">
                <ChevronRight size={28} />
              </button>
            </>
          )}
          <p className="lightbox__caption">
            {item.label}
            {items.length > 1 && <span> · {index + 1} / {items.length}</span>}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
