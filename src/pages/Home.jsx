import { motion } from "motion/react";
import { ArrowRight } from "react-feather";
import Typed from "../components/Typed.jsx";

const ROLES = ["Monteur Vidéo", "3D Artist", "Motion Designer", "Graphiste", "Web designer"];

const fadeUp = (delay) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.25, 1, 0.5, 1] },
});

export default function Home({ navigate }) {
  return (
    <section className="hero container">
      <motion.h1 className="hero__title" {...fadeUp(0.1)}>
        Adrien <span className="highlight">Onillon</span>
      </motion.h1>
      <motion.p className="hero__subtitle" {...fadeUp(0.25)}>
        <Typed words={ROLES} />
      </motion.p>
      <motion.div {...fadeUp(0.4)}>
        <a
          href="#projets"
          className="cta"
          onClick={(e) => {
            e.preventDefault();
            navigate("projets");
          }}
        >
          Voir mes réalisations <ArrowRight size={20} />
        </a>
      </motion.div>
    </section>
  );
}
