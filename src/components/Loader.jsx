import { motion } from "motion/react";

/*
  Écran de chargement plein écran : nom, barre de progression et étape en cours.
  progress : 0 → 100 ; label : étape affichée sous la barre.
*/
export default function Loader({ progress, label }) {
  const pct = Math.round(Math.min(100, Math.max(0, progress)));
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center gap-[1.4rem] px-4 bg-radial from-bg from-0% to-bg-deep to-70%"
      initial={false}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      role="progressbar"
      aria-label="Chargement"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
    >
      <p className="font-title text-[clamp(1.6rem,5vw,2.6rem)] font-black whitespace-nowrap">
        Adrien <span className="text-primary">Onillon</span>
      </p>
      <div className="w-[min(320px,100%)] h-1 rounded-full bg-white/10 overflow-hidden">
        <span
          className="block h-full bg-linear-135 from-violet to-primary shadow-[0_0_12px_var(--color-primary)] origin-left transition-transform duration-500 ease-soft"
          style={{ transform: `scaleX(${pct / 100})` }}
        />
      </div>
      <p className="w-[min(320px,100%)] flex justify-between gap-4 font-mono text-[0.8rem] text-muted whitespace-pre">
        <span>
          {label}
          <span className="after:content-[''] after:animate-dots" aria-hidden="true" />
        </span>
        <span>{String(pct).padStart(3, " ")}%</span>
      </p>
    </motion.div>
  );
}
