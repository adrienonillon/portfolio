// Optimise les modèles 3D pour le site. À relancer après un nouvel export Blender :  node scripts/modeles.mjs
//
// Intro (bureau, télé, tasse, bras et clavier) : sources/<Nom>.glb (export Blender, non versionné) → public/assets/3d/<nom>.glb
//   géométrie compressée (meshopt, décodeur inclus dans drei), textures en WebP 512 px
//   Frappe.glb : les deux bras (squelettes) qui tapent sur le clavier, touches animées. Exporté de Blender
//   déjà allégé (~16 000 triangles par bras) : pas de simplify, qui casserait les poids des doigts.
//   Ses clips (un par objet à l'export) sont fusionnés en un seul, « Frappe », lu en boucle.
// Galerie (fiches projet, affichées par model-viewer) : optimisées sur place, une seule fois
//   géométrie quantifiée (aucun décodeur à télécharger), textures en WebP 1024 px
import fs from "node:fs";
import path from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, meshopt, prune, quantize, resample, textureCompress, weld } from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";
import sharp from "sharp";

const ROOT = path.join(import.meta.dirname, "..");
const SOURCES = path.join(ROOT, "sources");
const OUT = path.join(ROOT, "public", "assets", "3d");

const INTRO = [
  { src: "Desk.glb", dst: "desk.glb" },
  { src: "Tv.glb", dst: "tv.glb" },
  { src: "Cafe.glb", dst: "cafe.glb" },
  { src: "Frappe.glb", dst: "frappe.glb", clip: "Frappe" },
];

// Réunit toutes les animations du fichier en un seul clip (Blender en exporte une par objet animé)
const mergeAnimations = (name) => (doc) => {
  const [first, ...rest] = doc.getRoot().listAnimations();
  if (!first) return;
  first.setName(name);
  for (const anim of rest) {
    for (const sampler of anim.listSamplers()) first.addSampler(sampler);
    for (const channel of anim.listChannels()) first.addChannel(channel);
    anim.dispose();
  }
};

await MeshoptEncoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "meshopt.encoder": MeshoptEncoder });

const kb = (file) => `${Math.round(fs.statSync(file).size / 1024)} Ko`;

// Textures en WebP, réduites à `size` px au plus
// (sharp doit rester à la même version que celui de gltf-transform : deux versions chargées ensemble plantent)
const webp = (size) => textureCompress({ encoder: sharp, targetFormat: "webp", resize: [size, size] });

for (const { src, dst, clip } of INTRO) {
  const from = path.join(SOURCES, src);
  const to = path.join(OUT, dst);
  if (!fs.existsSync(from)) {
    console.log(`(absent) ${src}`);
    continue;
  }
  const doc = await io.read(from);
  await doc.transform(
    dedup(),
    weld(),
    // animation : un seul clip, images clés redondantes retirées
    ...(clip ? [mergeAnimations(clip), resample()] : []),
    prune(),
    webp(512),
    meshopt({ encoder: MeshoptEncoder, level: "medium" })
  );
  await io.write(to, doc);
  console.log(`${kb(from).padStart(9)} -> ${kb(to).padStart(7)}  ${dst}`);
}

for (const file of fs.readdirSync(OUT).filter((f) => f.endsWith(".glb"))) {
  if (INTRO.some((m) => m.dst === file)) continue;
  const to = path.join(OUT, file);
  const doc = await io.read(to);
  if (doc.getRoot().listExtensionsUsed().some((e) => e.extensionName === "KHR_mesh_quantization")) continue;
  const before = kb(to);
  await doc.transform(
    dedup(),
    weld(),
    prune(),
    webp(1024),
    quantize()
  );
  await io.write(to, doc);
  console.log(`${before.padStart(9)} -> ${kb(to).padStart(7)}  ${file}`);
}
