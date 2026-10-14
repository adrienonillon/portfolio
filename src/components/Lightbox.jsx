import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight } from "react-feather";

const ROUND_BTN =
  "absolute flex items-center justify-center size-12 rounded-full border border-line bg-white/8 cursor-pointer transition-colors duration-300 hover:bg-primary hover:border-primary";
// Flèches centrées verticalement ; en bas de l'écran sur mobile
const NAV_BTN = "top-1/2 -translate-y-1/2 max-sm:top-auto max-sm:bottom-[0.6rem] max-sm:translate-y-0 max-sm:size-[42px]";

// Visionneuse plein écran : clic / Échap pour fermer, flèches (clavier ou boutons) pour naviguer.
// Rendue dans <body> pour couvrir tout l'écran même depuis une fenêtre du bureau.
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
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, items.length, onClose, onChange]);

  const nav = (e, step) => {
    e.stopPropagation();
    onChange((index + step + items.length) % items.length);
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-300 flex items-center justify-center px-[4.5rem] py-16 max-sm:px-3 bg-[rgba(6,4,40,0.94)] backdrop-blur-sm cursor-zoom-out"
          data-lightbox
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
            className="max-w-full max-h-full object-contain rounded-lg shadow-[0_30px_80px_rgba(0,0,0,0.6)] cursor-default"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
          />
          <button className={`${ROUND_BTN} top-4 right-4`} onClick={onClose} aria-label="Fermer">
            <X />
          </button>
          {items.length > 1 && (
            <>
              <button className={`${ROUND_BTN} ${NAV_BTN} left-4`} onClick={(e) => nav(e, -1)} aria-label="Image précédente">
                <ChevronLeft size={28} />
              </button>
              <button className={`${ROUND_BTN} ${NAV_BTN} right-4`} onClick={(e) => nav(e, 1)} aria-label="Image suivante">
                <ChevronRight size={28} />
              </button>
            </>
          )}
          <p className="absolute bottom-[1.1rem] left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.9rem]">
            {item.label}
            {items.length > 1 && (
              <span className="text-muted">
                {" "}
                · {index + 1} / {items.length}
              </span>
            )}
          </p>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
