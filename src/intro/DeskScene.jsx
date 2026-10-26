import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Float32BufferAttribute, Fog, MeshBasicMaterial, MeshStandardMaterial, PerspectiveCamera, Quaternion, Vector3 } from "three";
import { useCodeScreen } from "./useCodeScreen.js";
import Typing from "./Typing.jsx";
import { CAFE_MODEL, DESK_MODEL, SCREEN_MESH, START_CAMERA, TV_MODEL, TV_SCREEN_MATERIAL } from "./config.js";

/*
  Scène de l'intro : bureau, télé, clavier, deux bras qui tapent, tasse de café.
  L'écran de la télé est nommé "Screen" : il reçoit le code qui défile et sert de cible à la plongée.
*/

const DESK_TOP = 0.775;

// Clavier et bras qui tapent (frappe.glb, voir Typing.jsx) : centrés sur le clavier, posé sur le bureau
const KEYBOARD_Z = 0.09;

// Télé (tv.glb) : modélisée face à +X, socle à y ≈ 0.011, dalle de 1.38 × 1.26 (ratio 1.1)
const TV_SCALE = 0.28;
const TV_SCREEN_HEIGHT = Math.round(1280 / 1.1);

function Tv() {
  const { scene } = useGLTF(TV_MODEL);
  const texture = useCodeScreen(true, TV_SCREEN_HEIGHT);

  const tv = useMemo(() => {
    const root = scene.clone(true);
    root.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = o.receiveShadow = true;
      if (o.material.name !== TV_SCREEN_MATERIAL) return;
      // Les UV d'origine ne couvrent qu'une partie de la texture : on les recalcule sur toute la dalle
      // (u de gauche à droite vu de face, c'est-à-dire z décroissant ; v de bas en haut)
      o.name = SCREEN_MESH;
      o.geometry = o.geometry.clone();
      o.geometry.computeBoundingBox();
      const { min, max } = o.geometry.boundingBox;
      const pos = o.geometry.attributes.position;
      const uv = new Float32Array(pos.count * 2);
      for (let i = 0; i < pos.count; i++) {
        uv[i * 2] = (max.z - pos.getZ(i)) / (max.z - min.z);
        uv[i * 2 + 1] = (pos.getY(i) - min.y) / (max.y - min.y);
      }
      o.geometry.setAttribute("uv", new Float32BufferAttribute(uv, 2));
      o.material = new MeshBasicMaterial({ map: texture, toneMapped: false });
    });
    return root;
  }, [scene, texture]);

  return (
    <primitive
      object={tv}
      position={[0, DESK_TOP - 0.011 * TV_SCALE, -0.29]}
      rotation={[0, -Math.PI / 2, 0]}
      scale={TV_SCALE}
    />
  );
}

useGLTF.preload(TV_MODEL);

// Tasse (cafe.glb) : soucoupe de rayon 1.19, bas de la soucoupe à y ≈ -0.05, vapeur au-dessus (y 1.6 → 3.4)
const CAFE_SCALE = 0.05;
// Les points des noms Blender sont retirés au chargement : « NurbsPath.001 » devient « NurbsPath001 »
const STEAM = /^NurbsPath\.?\d+$/;
const STEAM_RISE = 0.6; // montée d'une volute sur un cycle (unités du modèle)
const STEAM_CYCLE = 4; // durée d'un cycle (secondes)
const CAFE_YELLOW = "Yellow plastic";

function Cafe() {
  const { scene } = useGLTF(CAFE_MODEL);

  const { cafe, steam } = useMemo(() => {
    const root = scene.clone(true);
    const wisps = [];
    root.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = o.receiveShadow = true;
      // Le matériau procédural du café (Blender) ne s'exporte pas : on lui redonne sa couleur
      if (o.name === "Circle") o.material = new MeshStandardMaterial({ color: "#2b170c", roughness: 0.2 });
      // Sous la lumière violette, le jaune pâle de la texture vire au jaune-vert terne :
      // on retire une partie de son bleu (jaune plus franc) et on ajoute une légère lueur chaude
      if (o.material.name === CAFE_YELLOW) {
        o.material = o.material.clone();
        o.material.color.set("#fff0a0");
        o.material.emissive.set("#ff9a1a");
        o.material.emissiveIntensity = 0.12;
      }
      if (STEAM.test(o.name)) {
        o.castShadow = o.receiveShadow = false;
        o.material = new MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0, depthWrite: false });
        wisps.push({ mesh: o, y: o.position.y, offset: wisps.length / 3 });
      }
    });
    return { cafe: root, steam: wisps };
  }, [scene]);

  // Vapeur : chaque volute monte en apparaissant puis s'efface, décalées dans le temps
  useFrame((state) => {
    const time = state.clock.elapsedTime / STEAM_CYCLE;
    steam.forEach(({ mesh, y, offset }) => {
      const t = (time + offset) % 1;
      mesh.position.y = y + (t - 0.5) * STEAM_RISE;
      mesh.material.opacity = Math.sin(Math.PI * t) * 0.45;
    });
  });

  return (
    <group position={[0.36, DESK_TOP, 0.02]}>
      <primitive object={cafe} position={[0, 0.05 * CAFE_SCALE, 0]} rotation={[0, -0.6, 0]} scale={CAFE_SCALE} />
      {/* Petite lumière chaude au-dessus de la tasse, côté caméra, pour garder le jaune lumineux */}
      <pointLight position={[0.02, 0.14, 0.08]} intensity={0.5} distance={0.22} color="#ffc56b" />
    </group>
  );
}

useGLTF.preload(CAFE_MODEL);

/*
  Bureau (desk.glb) : plateau long selon Z (2.49 × 1.06), dessus à y ≈ +0.039, pieds jusqu'à y ≈ -1.078.
  Tourné d'un quart de tour pour que sa longueur suive l'axe X, mis à l'échelle pour que le dessus soit à DESK_TOP.
*/
const DESK_HEIGHT = 1.117;
const DESK_SCALE = DESK_TOP / DESK_HEIGHT;

function Desk() {
  const { scene } = useGLTF(DESK_MODEL);
  const desk = useMemo(() => {
    const root = scene.clone(true);
    root.traverse((o) => {
      if (o.isMesh) o.castShadow = o.receiveShadow = true;
    });
    return root;
  }, [scene]);
  return (
    <primitive object={desk} position={[0, DESK_TOP - 0.039 * DESK_SCALE, -0.17]} rotation={[0, Math.PI / 2, 0]} scale={DESK_SCALE} />
  );
}

useGLTF.preload(DESK_MODEL);

export default function DeskScene({ onSetup }) {
  const rootRef = useRef();
  const scene = useThree((s) => s.scene);

  useLayoutEffect(() => {
    scene.fog = new Fog("#0a0740", 2.5, 8);
    return () => (scene.fog = null);
  }, [scene]);

  useLayoutEffect(() => {
    const cam = new PerspectiveCamera(START_CAMERA.fov);
    cam.position.fromArray(START_CAMERA.position);
    cam.lookAt(new Vector3().fromArray(START_CAMERA.target));
    onSetup({
      screen: rootRef.current.getObjectByName(SCREEN_MESH),
      start: { position: cam.position.clone(), quaternion: new Quaternion().copy(cam.quaternion), fov: cam.fov },
    });
  }, [onSetup]);

  return (
    <group ref={rootRef}>
      <hemisphereLight args={["#b9a8ff", "#0a0740", 0.6]} />
      <directionalLight
        position={[1.2, 2.4, 1.4]}
        intensity={1.4}
        color="#ffe9f6"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-1}
        shadow-camera-right={1}
        shadow-camera-top={1}
        shadow-camera-bottom={-1}
        shadow-bias={-0.0005}
      />
      {/* Lumière émise par l'écran */}
      <pointLight position={[0, 1.12, 0.05]} intensity={1.2} distance={1.6} color="#8f7bff" />

      <Desk />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0d0a45" roughness={1} />
      </mesh>

      <Tv />
      <Typing position={[0, DESK_TOP, KEYBOARD_Z]} />
      <Cafe />
    </group>
  );
}
