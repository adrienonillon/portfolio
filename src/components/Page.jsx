import { useLayoutEffect } from "react";
import { motion } from "motion/react";

export default function Page({ children, restoreScroll = 0, centered = false }) {
  useLayoutEffect(() => {
    window.scrollTo(0, restoreScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.main
      className={`page${centered ? " page--centered" : ""}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
    >
      {children}
    </motion.main>
  );
}
