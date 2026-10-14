import { CanvasTexture, SRGBColorSpace } from "three";
// Le code qui défile à l'écran est le vrai code du portfolio
import appSource from "../App.jsx?raw";
import typedSource from "../components/Typed.jsx?raw";

const FILES = [
  { name: "App.jsx", source: appSource },
  { name: "Typed.jsx", source: typedSource },
];

const W = 1280;
const H = 800;
const FONT_SIZE = 26;
const LINE_H = 38;
const TOP = 78;
const GUTTER = 70;
const CHARS_PER_SECOND = 38;

const COLORS = {
  bg: "#0d0a33",
  bar: "#1a1458",
  gutter: "#4a4490",
  text: "#e6e1f7",
  keyword: "#c792ea",
  string: "#a5e8b5",
  comment: "#6f6a9e",
  tag: "#ff9fd0",
  number: "#f9c97c",
  fn: "#82aaff",
};

const KEYWORDS =
  /^(import|from|export|default|function|return|const|let|var|if|else|switch|case|break|new|true|false|null|undefined|await|async|for|of|in|try|catch|typeof)\b/;

// Découpe une ligne en morceaux colorés (coloration syntaxique volontairement simple)
function tokenize(line) {
  const tokens = [];
  let rest = line;
  const push = (text, color) => text && tokens.push({ text, color });
  while (rest.length) {
    let m;
    if ((m = rest.match(/^\/\/.*/))) push(m[0], COLORS.comment);
    else if ((m = rest.match(/^(["'`])(?:\\.|(?!\1).)*\1?/))) push(m[0], COLORS.string);
    else if ((m = rest.match(/^<\/?[A-Za-z][\w.]*/))) push(m[0], COLORS.tag);
    else if ((m = rest.match(KEYWORDS))) push(m[0], COLORS.keyword);
    else if ((m = rest.match(/^\d+(\.\d+)?/))) push(m[0], COLORS.number);
    else if ((m = rest.match(/^[A-Za-z_$][\w$]*(?=\()/))) push(m[0], COLORS.fn);
    else if ((m = rest.match(/^[A-Za-z_$][\w$]*/))) push(m[0], COLORS.text);
    else if ((m = rest.match(/^\s+/))) push(m[0], COLORS.text);
    else {
      m = [rest[0]];
      push(m[0], COLORS.text);
    }
    rest = rest.slice(m[0].length);
  }
  return tokens;
}

const PARSED = FILES.map((f) => ({
  name: f.name,
  lines: f.source.replace(/\t/g, "  ").split(/\r?\n/).map(tokenize),
}));

/*
  Écran d'éditeur de code dessiné dans un <canvas>, utilisé comme texture sur le mesh "Screen".
  flipY : false pour un mesh venant d'un .glb (convention glTF), true pour une géométrie Three.js.
  height : hauteur du canvas en pixels (largeur fixe 1280), à adapter au ratio de l'écran.
*/
export class CodeScreen {
  constructor({ flipY = true, height = H } = {}) {
    this.height = height;
    this.canvas = document.createElement("canvas");
    this.canvas.width = W;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext("2d");
    this.texture = new CanvasTexture(this.canvas);
    this.texture.colorSpace = SRGBColorSpace;
    this.texture.flipY = flipY;
    this.texture.anisotropy = 8;

    this.file = 0;
    // Démarre en cours de frappe pour que l'écran ne soit pas vide
    this.line = Math.min(14, PARSED[0].lines.length - 1);
    this.char = 0;
    this.budget = 0;
    this.pause = 0;
    this.time = 0;
    this.scroll = Math.max(0, this.line - Math.floor((height - TOP - 20) / LINE_H) + 4);
    this.lastDrawn = "";
    this.draw();
  }

  update(dt) {
    this.time += dt;
    if (this.pause > 0) {
      this.pause -= dt;
    } else {
      // Frappe irrégulière, comme une vraie personne
      this.budget += dt * CHARS_PER_SECOND * (0.6 + Math.random() * 0.9);
      const lines = PARSED[this.file].lines;
      while (this.budget >= 1 && this.pause <= 0) {
        this.budget--;
        const length = lines[this.line].reduce((n, t) => n + t.text.length, 0);
        // Les indentations s'écrivent d'un coup
        if (this.char === 0) this.char = length - lines[this.line].map((t) => t.text).join("").trimStart().length;
        if (this.char < length) {
          this.char++;
        } else if (this.line < lines.length - 1) {
          this.line++;
          this.char = 0;
          if (Math.random() < 0.12) this.pause = 0.3 + Math.random() * 0.5;
        } else {
          this.file = (this.file + 1) % PARSED.length;
          this.line = 0;
          this.char = 0;
          this.scroll = 0;
          this.pause = 1;
        }
      }
    }

    const visible = Math.floor((this.height - TOP - 20) / LINE_H);
    const targetScroll = Math.max(0, this.line - visible + 4);
    this.scroll += (targetScroll - this.scroll) * Math.min(1, dt * 10);

    const cursorOn = Math.floor(this.time * 2) % 2 === 0;
    const key = `${this.file}:${this.line}:${this.char}:${cursorOn}:${this.scroll.toFixed(2)}`;
    if (key !== this.lastDrawn) {
      this.lastDrawn = key;
      this.draw(cursorOn);
      this.texture.needsUpdate = true;
    }
  }

  draw(cursorOn = true) {
    const { ctx, height: H } = this;
    const file = PARSED[this.file];

    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, W, H);

    // Barre de titre + onglet
    ctx.fillStyle = COLORS.bar;
    ctx.fillRect(0, 0, W, 50);
    ["#ff6b8b", "#f9c97c", "#a5e8b5"].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(28 + i * 26, 25, 8, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(120, 8, 200, 42);
    ctx.fillStyle = COLORS.text;
    ctx.font = `18px "Consolas", "Courier New", monospace`;
    ctx.textBaseline = "middle";
    ctx.fillText(file.name, 140, 30);

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 56, W, H - 56);
    ctx.clip();
    ctx.font = `${FONT_SIZE}px "Consolas", "Courier New", monospace`;
    ctx.textBaseline = "alphabetic";
    const charW = ctx.measureText("M").width;

    const first = Math.floor(this.scroll);
    const offset = (this.scroll - first) * LINE_H;
    for (let i = first; i <= this.line; i++) {
      const y = TOP + (i - first) * LINE_H - offset + FONT_SIZE;
      if (y < 40) continue;
      if (y > H + LINE_H) break;

      ctx.fillStyle = i === this.line ? COLORS.text : COLORS.gutter;
      ctx.textAlign = "right";
      ctx.fillText(String(i + 1), GUTTER - 18, y);
      ctx.textAlign = "left";

      let x = GUTTER;
      let remaining = i === this.line ? this.char : Infinity;
      for (const token of file.lines[i]) {
        if (remaining <= 0) break;
        const text = token.text.slice(0, remaining);
        ctx.fillStyle = token.color;
        ctx.fillText(text, x, y);
        x += text.length * charW;
        remaining -= text.length;
      }
      if (i === this.line && cursorOn) {
        ctx.fillStyle = COLORS.keyword;
        ctx.fillRect(x + 1, y - FONT_SIZE + 2, 3, FONT_SIZE + 4);
      }
    }
    ctx.restore();

    // Légère vignette pour l'effet « écran »
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.85);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.35)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  dispose() {
    this.texture.dispose();
  }
}
