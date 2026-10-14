import { motion } from "motion/react";
import { Video, Box, Figma, PenTool, Code, Clipboard, Cpu, Download, Folder, Mail, MapPin } from "react-feather";
import { CV_URL, ROLES } from "../profile.js";
import { appBtn, cta, panel } from "../../ui.js";

const README_H = "mb-3 font-title text-[1.35rem] font-bold [&>span]:mr-[0.45rem] [&>span]:font-mono [&>span]:text-primary";
const README_P = "mb-[0.85rem] leading-[1.75]";

const SKILLS = [
  { icon: Video, label: "Davinci Resolve" },
  { icon: Box, label: "Blender" },
  { icon: Figma, label: "Figma" },
  { icon: PenTool, label: "Suite Adobe" },
  { icon: Code, label: "VS Code" },
  { icon: Clipboard, label: "Trello / Monday" },
  { icon: Cpu, label: "AI" },
];

const reveal = (delay) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.25, 1, 0.5, 1] },
});

// Application « À propos » : fiche profil + README
export default function ProfileApp({ navigate }) {
  const go = (e, hash) => {
    e.preventDefault();
    navigate(hash);
  };

  return (
    <div className="grid grid-cols-[270px_minmax(0,1fr)] gap-7 items-start px-[clamp(1rem,3vw,2rem)] pt-6 pb-8 @max-3xl:grid-cols-[minmax(0,1fr)]">
      <motion.aside className={`${panel} sticky top-0 flex flex-col items-center gap-[0.3rem] text-center @max-3xl:static`} {...reveal(0)}>
        <img
          className="size-[140px] mb-3 rounded-full border-3 border-primary object-cover object-top shadow-[0_0_40px_rgba(165,141,206,0.35)]"
          src={`${import.meta.env.BASE_URL}assets/photo-présentation.png`}
          alt="Portrait d'Adrien Onillon"
          width="374"
          height="666"
        />
        <h1 className="font-title text-[1.45rem] leading-[1.2] font-bold">Adrien Onillon</h1>
        <p className="text-muted">Étudiant BUT MMI</p>
        <p className="inline-flex items-center gap-[0.35rem] font-mono text-[0.78rem] text-muted">
          <MapPin size={14} /> Limoges
        </p>
        <div className="flex flex-col gap-2 w-full mt-5">
          <a href={CV_URL} className={`${cta(true)} w-full`} download>
            <Download size={16} /> Mon CV
          </a>
          <a href="#projets" className={appBtn()} onClick={(e) => go(e, "projets")}>
            <Folder size={16} /> Projets
          </a>
          <a href="#contact" className={appBtn()} onClick={(e) => go(e, "contact")}>
            <Mail size={16} /> Contact
          </a>
        </div>
      </motion.aside>

      <div>
        <motion.p className="mb-5 pb-[0.6rem] border-b border-line font-mono text-[0.78rem] text-muted" {...reveal(0.05)}>
          README.md
        </motion.p>
        <motion.section {...reveal(0.1)}>
          <h2 className={README_H}>
            <span aria-hidden="true">#</span> À propos
          </h2>
          <p className={README_P}>
            Actuellement en deuxième année de BUT MMI à Limoges, je me consacre au développement de mes compétences en
            montage vidéo, 3D, design graphique et web design.
          </p>
          <p className={README_P}>
            Mon objectif est de rejoindre une équipe dynamique pour participer à des projets innovants, mettre en
            pratique mes acquis et continuer à développer mes compétences techniques et ma vision créative.
          </p>
        </motion.section>

        <motion.section className="mt-7" {...reveal(0.18)}>
          <h2 className={README_H}>
            <span aria-hidden="true">##</span> Ce que je fais
          </h2>
          <ul className="flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <li key={r} className="px-[0.85rem] py-[0.35rem] rounded-full border border-primary/35 bg-primary/10 text-[0.85rem]">
                {r}
              </li>
            ))}
          </ul>
        </motion.section>

        <motion.section className="mt-7" {...reveal(0.26)}>
          <h2 className={README_H}>
            <span aria-hidden="true">##</span> Outils maîtrisés
          </h2>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2">
            {SKILLS.map(({ icon: Icon, label }, i) => (
              <motion.li
                key={label}
                className="group flex flex-col items-center gap-[0.45rem] px-1 py-3 rounded-[14px] transition-colors duration-250 hover:bg-white/5"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 + i * 0.04, type: "spring", stiffness: 400, damping: 26 }}
              >
                <span className="grid place-items-center size-12 rounded-[13px] bg-linear-135 from-violet to-primary shadow-[0_6px_18px_rgba(83,18,196,0.45)] transition-transform duration-300 ease-soft group-hover:-translate-y-[3px] group-hover:scale-[1.06]">
                  <Icon size={22} />
                </span>
                <span className="text-[0.78rem] leading-[1.2] text-center text-muted">{label}</span>
              </motion.li>
            ))}
          </ul>
        </motion.section>
      </div>
    </div>
  );
}
