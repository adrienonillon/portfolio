import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Mail, Phone, Copy, Check, Linkedin, GitHub } from "react-feather";

function CopyField({ value, message }) {
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
    <div className="copy-field">
      <span>{value}</span>
      <button className={copied ? "is-copied" : ""} onClick={copy} title="Copier" aria-label={`Copier ${value}`}>
        {copied ? <Check size={18} /> : <Copy size={18} />}
        <AnimatePresence>
          {copied && (
            <motion.span
              className="copy-field__toast"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {message}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}

const cardAnim = (i) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay: 0.15 + i * 0.1 },
});

export default function Contact() {
  return (
    <section className="container contact">
      <motion.div className="contact__header" {...cardAnim(-1)}>
        <h1 className="section-title">Contactez-moi</h1>
        <p>Vous avez une question ou souhaitez simplement discuter ? N'hésitez pas.</p>
      </motion.div>
      <div className="contact__grid">
        <motion.div className="card contact-card" {...cardAnim(0)}>
          <div className="contact-card__icon"><MessageSquare /></div>
          <h2>Réseaux Sociaux</h2>
          <div className="contact-card__socials">
            <a href="https://www.linkedin.com/in/adrien-onillon-7bb121332/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <Linkedin size={28} />
            </a>
            <a href="https://github.com/adrienonillon" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <GitHub size={28} />
            </a>
          </div>
        </motion.div>
        <motion.div className="card contact-card" {...cardAnim(1)}>
          <div className="contact-card__icon"><Mail /></div>
          <h2>Email</h2>
          <CopyField value="adrienonillon12@gmail.com" message="Email copié !" />
        </motion.div>
        <motion.div className="card contact-card" {...cardAnim(2)}>
          <div className="contact-card__icon"><Phone /></div>
          <h2>Téléphone</h2>
          <CopyField value="06 71 17 26 93" message="Numéro copié !" />
        </motion.div>
      </div>
    </section>
  );
}
