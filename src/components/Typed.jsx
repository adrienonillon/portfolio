import { useEffect, useState } from "react";

const TYPING = 110;
const ERASING = 40;
const PAUSE = 1400;

export default function Typed({ words }) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setText(words[0]);
      return;
    }
    let wordIndex = 0;
    let charIndex = 0;
    let erasing = false;
    let timer;

    const tick = () => {
      const word = words[wordIndex];
      if (!erasing) {
        charIndex++;
        setText(word.slice(0, charIndex));
        if (charIndex === word.length) {
          erasing = true;
          timer = setTimeout(tick, PAUSE);
          return;
        }
        timer = setTimeout(tick, TYPING);
      } else {
        charIndex--;
        setText(word.slice(0, charIndex));
        if (charIndex === 0) {
          erasing = false;
          wordIndex = (wordIndex + 1) % words.length;
          timer = setTimeout(tick, 300);
          return;
        }
        timer = setTimeout(tick, ERASING);
      }
    };
    timer = setTimeout(tick, 600);
    return () => clearTimeout(timer);
  }, [words]);

  return (
    <>
      <span aria-hidden="true">{text}</span>
      <span className="typed-cursor" aria-hidden="true">|</span>
      <span className="visually-hidden">{words.join(", ")}</span>
    </>
  );
}
