import { useEffect, useLayoutEffect } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";

/*
  Clavier + deux bras qui tapent (frappe.glb), exportés ensemble de Blender à l'échelle réelle.
  Clavier de 29,8 × 10,7 cm centré sur l'origine et posé par le dessous ; les bras arrivent du côté de la caméra (+Z).
  Chaque bras a un vrai squelette (17 os, poids calculés dans Blender) : les doigts se plient sans se déformer,
  frappent les touches de « salut je code des jeux » et les touches s'enfoncent.
  L'animation « Frappe » (8,4 s) est jouée en boucle. Fichier optimisé par scripts/modeles.mjs (sources/Frappe.glb).

  Remplace, dans DeskScene : <Keyboard /> et les deux <Arm /> (plus besoin de clavier.glb ni de hand.glb).
*/
export const TYPING_MODEL = `${import.meta.env.BASE_URL}assets/3d/frappe.glb`;

// Couleurs de la manche et de la peau (faites par nœuds dans Blender, elles ne s'exportent pas), par nom de matériau
const ARM_COLORS = { Tissu_Bleu: "#3b5ba8", Peau: "#e8b598" };

export default function Typing({ position }) {
  const { scene, animations } = useGLTF(TYPING_MODEL);
  const { actions } = useAnimations(animations, scene);

  useLayoutEffect(() => {
    scene.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true;
      // Les bras projettent leur ombre sans en recevoir : à cette échelle, l'ombre d'un doigt sur la main serait crénelée
      o.receiveShadow = !o.isSkinnedMesh;
      // Un maillage animé par squelette garde sa boîte englobante de repos : on ne le laisse pas écarter du rendu
      if (o.isSkinnedMesh) o.frustumCulled = false;
      const color = ARM_COLORS[o.material.name];
      if (color) o.material.color.set(color);
    });
  }, [scene]);

  useEffect(() => {
    const action = actions.Frappe;
    action?.reset().play();
    return () => action?.stop();
  }, [actions]);

  return <primitive object={scene} position={position} />;
}

useGLTF.preload(TYPING_MODEL);
