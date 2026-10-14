import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Mail, Phone, GitHub, Copy, Check, ExternalLink } from "react-feather";
import { EMAIL, PHONE, GITHUB } from "../profile.js";
import { appBtn } from "../../ui.js";

const CONTACTS = [
  { icon: Mail, label: "Email", value: EMAIL, copy: "Email copié !", open: { href: `mailto:${EMAIL}`, label: "Écrire" } },
  { icon: Phone, label: "Téléphone", value: PHONE, copy: "Numéro copié !", open: { href: `tel:${PHONE.replace(/\s/g, "")}`, label: "Appeler" } },
  { icon: GitHub, label: "GitHub", value: "adrienonillon", open: { href: GITHUB, label: "Ouvrir", external: true } },
];

function CopyButton({ value, message }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const area = document.createElement("textarea");
      area.value = value;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button className={appBtn(copied)} onClick={copy} aria-label={`Copier ${value}`}>
      {copied ? <Check size={16} /> : <Copy size={16} />}
      <span>Copier</span>
      <AnimatePresence>
        {copied && (
          <motion.span
            className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-violet text-xs whitespace-nowrap pointer-events-none"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {message}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

// Ligne de commande ; first : pas d'espace au-dessus (première ligne du terminal)
function Prompt({ first = false, children }) {
  return (
    <p className={`wrap-anywhere ${first ? "" : "mt-[1.1rem]"}`}>
      <span className="text-[#a5e8b5]">adrien@portfolio</span>:<span className="text-[#82aaff]">~</span>$ {children}
    </p>
  );
}

const line = (i) => ({
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.3, delay: 0.1 + i * 0.12 },
});

// Application « Contact » : terminal
export default function TerminalApp() {
  return (
    <div className="min-h-full px-[clamp(1rem,3vw,2rem)] pt-5 pb-8 bg-[rgba(5,3,30,0.55)] font-mono text-[0.9rem]">
      <motion.div {...line(0)}>
        <Prompt first>whoami</Prompt>
        <p className="mt-[0.3rem] text-muted">Adrien Onillon · étudiant BUT MMI à Limoges</p>
      </motion.div>
      <motion.div {...line(1)}>
        <Prompt>cat message.txt</Prompt>
        <p className="mt-2 font-sans text-[1.2rem] leading-[1.5] text-white">
          Vous avez une question ou souhaitez simplement discuter ? <span className="text-primary">N'hésitez pas.</span>
        </p>
      </motion.div>
      <motion.div {...line(2)}>
        <Prompt>contact --list</Prompt>
      </motion.div>
      <ul className="grid gap-[0.6rem] mt-[0.85rem]">
        {CONTACTS.map((c, i) => (
          <motion.li
            key={c.label}
            className="flex flex-wrap items-center gap-x-4 gap-y-[0.6rem] px-4 py-[0.85rem] rounded-xl border border-line bg-white/4 font-sans transition-colors duration-250 hover:border-primary/40"
            {...line(3 + i * 0.5)}
          >
            <span className="grid place-items-center shrink-0 size-[42px] rounded-[11px] bg-linear-135 from-violet to-primary">
              <c.icon size={20} />
            </span>
            <span className="flex flex-1 flex-col min-w-0">
              <span className="font-mono text-[0.7rem] tracking-[0.1em] uppercase text-primary">{c.label}</span>
              <span className="wrap-anywhere">{c.value}</span>
            </span>
            <span className="flex gap-2 @max-3xl:w-full @max-3xl:justify-end">
              {c.copy && <CopyButton value={c.value} message={c.copy} />}
              <a
                className={appBtn()}
                href={c.open.href}
                {...(c.open.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {c.open.external && <ExternalLink size={16} />}
                <span>{c.open.label}</span>
              </a>
            </span>
          </motion.li>
        ))}
      </ul>
      <motion.div {...line(5.5)}>
        <Prompt>
          <span className="inline-block w-[0.6em] h-[1.1em] align-[-0.2em] bg-primary animate-blink" aria-hidden="true" />
        </Prompt>
      </motion.div>
    </div>
  );
}
