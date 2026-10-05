import { motion } from "motion/react";
import { Video, Box, Figma, PenTool, Code, Clipboard, Cpu } from "react-feather";

const SKILLS = [
  { icon: Video, label: "Davinci Resolve" },
  { icon: Box, label: "Blender" },
  { icon: Figma, label: "Figma" },
  { icon: PenTool, label: "Suite Adobe" },
  { icon: Code, label: "VS Code" },
  { icon: Clipboard, label: "Trello / Monday" },
  { icon: Cpu, label: "AI" },
];

export default function About() {
  return (
    <section className="container">
      <motion.div
        className="card about"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="about__image">
          <img
            src={`${import.meta.env.BASE_URL}assets/photo-présentation.png`}
            alt="Portrait d'Adrien Onillon"
            width="374"
            height="666"
          />
        </div>
        <div className="about__text">
          <h1 className="section-title">À propos</h1>
          <p>
            Actuellement en deuxième année de BUT MMI à Limoges, je me consacre au développement de mes compétences en
            montage vidéo, 3D, design graphique et web design.
          </p>
          <p>
            Mon objectif est de rejoindre une équipe dynamique pour participer à des projets innovants, mettre en
            pratique mes acquis et continuer à développer mes compétences techniques et ma vision créative.
          </p>
          <p className="about__skills-title">Outils maîtrisés</p>
          <ul className="skills">
            {SKILLS.map(({ icon: Icon, label }, i) => (
              <motion.li
                key={label}
                className="skill"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <Icon size={22} />
                <span>{label}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    </section>
  );
}
