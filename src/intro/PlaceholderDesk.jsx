import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, useGLTF } from "@react-three/drei";
import {
  Float32BufferAttribute,
  Fog,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  Vector3,
  PerspectiveCamera,
} from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { useCodeScreen } from "./useCodeScreen.js";
import { CAFE_MODEL, DESK_MODEL, DRACO_PATH, HAND_MODEL, PLACEHOLDER_CAMERA, SCREEN_MESH, TV_MODEL, TV_SCREEN_MATERIAL } from "./config.js";

/*
  Scène provisoire (bureau, télé, clavier, bras, tasse de café) affichée tant que
  public/assets/3d/intro.glb n'existe pas. Elle suit les mêmes conventions que le .glb attendu :
  un mesh nommé "Screen" qui reçoit le code qui défile.
*/

const DESK_TOP = 0.775;

// Clavier : grille de touches
const KEY_COLS = 14;
const KEY_ROWS = 4;
const KEY_STEP = 0.028;
const KEY_X0 = -((KEY_COLS - 1) * KEY_STEP) / 2;
const KEY_Z0 = 0.058;
const KEY_Y = DESK_TOP + 0.024;

/*
  Bras (hand.glb) : bras GAUCHE modélisé le long de +X — épaule x ≈ -0.9, poignet x ≈ 9.7,
  jointures x ≈ 10.9 (y ≈ -2.03), bouts des doigts x ≈ 12 — paume vers le bas, pouce côté +Z.
  Squelette : arm, hand, puis <doigt>_1 à _3 (index, middle, ring, pinky, thumb).
  Le bras droit est le même modèle en miroir.
*/
const ARM_SCALE = 0.06;
const KNUCKLE = new Vector3(10.9, -2.03, 0.22); // jointure du majeur, dans le modèle
const HAND_X = 0.12; // écart de chaque main par rapport au centre du clavier
const KNUCKLE_Y = KEY_Y + 0.045; // hauteur des jointures (doigts pliés posés sur les touches)
const KNUCKLE_Z = 0.12; // au-dessus de la rangée du haut ; les doigts pliés retombent sur les rangées du milieu
const ARM_YAW = 0.18; // les coudes s'écartent vers l'extérieur
// Doigts (même ordre que les frappes) et position latérale (z du modèle) pour savoir quelle touche ils frappent
const FINGERS = [
  { name: "index", z: 0.68 },
  { name: "middle", z: 0.22 },
  { name: "ring", z: -0.27 },
  { name: "pinky", z: -0.66 },
  { name: "thumb", z: 1.3 },
];
// Flexion de chaque phalange (radians) : au repos, et en plus pendant une frappe
const REST_CURL = [0.3, 0.45, 0.3];
const PRESS_CURL = [0.3, 0.15, 0.05];
const THUMB_REST = [0.45, 0.35, 0.2];
const PRESS_TIME = 0.13;
const LATERAL = new Vector3(0, 0, 1); // axe de flexion des doigts, dans le modèle

// Bras et ses os, prêts à être pliés autour de l'axe de flexion (exprimé dans le repère de chaque os)
function useArmRig(scene) {
  return useMemo(() => {
    // Matériaux du modèle conservés (manche en jean, peau).
    // Les bras projettent leur ombre sans en recevoir : à cette échelle, l'ombre du pouce sur la main serait crénelée
    const root = cloneSkinned(scene);
    root.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.frustumCulled = false; // la boîte englobante d'un maillage animé n'est pas recalculée
      }
    });
    root.updateMatrixWorld(true);
    const q = new Quaternion();
    const fingers = FINGERS.map(({ name }) =>
      [1, 2, 3].map((i) => {
        const bone = root.getObjectByName(`${name}_${i}`);
        bone.getWorldQuaternion(q);
        return { bone, base: bone.quaternion.clone(), axis: LATERAL.clone().applyQuaternion(q.invert()) };
      })
    );
    return { root, fingers };
  }, [scene]);
}

function Arm({ side, rig, groupRef }) {
  // side = 1 bras droit (modèle en miroir), -1 bras gauche ; repère centré sur la jointure du majeur
  return (
    <group ref={groupRef} position={[side * HAND_X, KNUCKLE_Y, KNUCKLE_Z]} rotation={[0, side * ARM_YAW, 0]}>
      <group scale={[-side, 1, 1]}>
        <primitive
          object={rig.root}
          rotation={[0, Math.PI / 2, 0]}
          scale={ARM_SCALE}
          position={[-KNUCKLE.z * ARM_SCALE, -KNUCKLE.y * ARM_SCALE, KNUCKLE.x * ARM_SCALE]}
        />
      </group>
    </group>
  );
}

function useTyping(keysRef, rigs) {
  const arms = useRef([{ current: null }, { current: null }]);
  const presses = useRef(new Map()); // doigt → temps restant
  const keyPresses = useRef(new Map()); // index touche → temps restant
  const nextHit = useRef(0);
  const dummy = useMemo(() => new Object3D(), []);
  const bend = useMemo(() => new Quaternion(), []);

  useFrame((state, dt) => {
    dt = Math.min(dt, 0.05);
    nextHit.current -= dt;
    if (nextHit.current <= 0) {
      nextHit.current = 0.05 + Math.random() * 0.12;
      const h = Math.random() < 0.5 ? 0 : 1;
      const f = Math.random() < 0.08 ? 4 : Math.floor(Math.random() * 4);
      presses.current.set(`${h}:${f}`, PRESS_TIME);
      // Touche enfoncée sous le doigt (h = 0 : main gauche, 1 : main droite)
      const side = h === 0 ? -1 : 1;
      const fx = side * HAND_X - side * (FINGERS[f].z - KNUCKLE.z) * ARM_SCALE;
      const col = Math.max(0, Math.min(KEY_COLS - 1, Math.round((fx - KEY_X0) / KEY_STEP)));
      const row = f === 4 ? KEY_ROWS - 1 : 1 + Math.floor(Math.random() * 2);
      keyPresses.current.set(row * KEY_COLS + col, PRESS_TIME);
    }

    const time = state.clock.elapsedTime;
    rigs.forEach((rig, h) => {
      const arm = arms.current[h].current;
      if (arm) arm.position.y = KNUCKLE_Y + Math.sin(time * 3 + h * 2) * 0.002;
      rig.fingers.forEach((phalanges, f) => {
        const id = `${h}:${f}`;
        const left = presses.current.get(id) ?? 0;
        const k = left > 0 ? Math.sin(Math.PI * (1 - left / PRESS_TIME)) : 0;
        const rest = f === 4 ? THUMB_REST : REST_CURL;
        // Angle négatif autour de l'axe latéral (côté pouce) = flexion vers la paume
        phalanges.forEach(({ bone, base, axis }, i) => {
          bend.setFromAxisAngle(axis, -(rest[i] + k * PRESS_CURL[i]));
          bone.quaternion.copy(base).multiply(bend);
        });
        if (left > 0) presses.current.set(id, left - dt);
        else presses.current.delete(id);
      });
    });

    const keys = keysRef.current;
    if (!keys) return;
    for (const [i, left] of keyPresses.current) {
      const row = Math.floor(i / KEY_COLS);
      const col = i % KEY_COLS;
      const k = left > 0 ? Math.sin(Math.PI * (1 - left / PRESS_TIME)) : 0;
      dummy.position.set(KEY_X0 + col * KEY_STEP, KEY_Y - k * 0.004, KEY_Z0 + row * KEY_STEP);
      dummy.updateMatrix();
      keys.setMatrixAt(i, dummy.matrix);
      if (left > 0) keyPresses.current.set(i, left - dt);
      else keyPresses.current.delete(i);
    }
    keys.instanceMatrix.needsUpdate = true;
  });

  return arms.current;
}

function Keyboard({ keysRef }) {
  useLayoutEffect(() => {
    const dummy = new Object3D();
    for (let r = 0; r < KEY_ROWS; r++) {
      for (let c = 0; c < KEY_COLS; c++) {
        dummy.position.set(KEY_X0 + c * KEY_STEP, KEY_Y, KEY_Z0 + r * KEY_STEP);
        dummy.updateMatrix();
        keysRef.current.setMatrixAt(r * KEY_COLS + c, dummy.matrix);
      }
    }
    keysRef.current.instanceMatrix.needsUpdate = true;
  }, [keysRef]);

  return (
    <group>
      <RoundedBox args={[0.43, 0.02, 0.15]} radius={0.006} position={[0, DESK_TOP + 0.01, 0.1]} castShadow receiveShadow>
        <meshStandardMaterial color="#1d175a" roughness={0.6} />
      </RoundedBox>
      <instancedMesh ref={keysRef} args={[null, null, KEY_COLS * KEY_ROWS]} castShadow>
        <boxGeometry args={[0.024, 0.01, 0.024]} />
        <meshStandardMaterial color="#2f2788" roughness={0.5} />
      </instancedMesh>
    </group>
  );
}

// Télé (tv.glb) : modélisée face à +X, socle à y ≈ 0.011, dalle de 1.38 × 1.26 (ratio 1.1)
const TV_SCALE = 0.28;
const TV_SCREEN_HEIGHT = Math.round(1280 / 1.1);

function Tv() {
  const { scene } = useGLTF(TV_MODEL, DRACO_PATH);
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

useGLTF.preload(TV_MODEL, DRACO_PATH);

// Tasse (cafe.glb) : soucoupe de rayon 1.19, bas de la soucoupe à y ≈ -0.05, vapeur au-dessus (y 1.6 → 3.4)
const CAFE_SCALE = 0.05;
// Les points des noms Blender sont retirés au chargement : « NurbsPath.001 » devient « NurbsPath001 »
const STEAM = /^NurbsPath\.?\d+$/;
const STEAM_RISE = 0.6; // montée d'une volute sur un cycle (unités du modèle)
const STEAM_CYCLE = 4; // durée d'un cycle (secondes)
const CAFE_YELLOW = "Yellow plastic";

function Cafe() {
  const { scene } = useGLTF(CAFE_MODEL, DRACO_PATH);

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

useGLTF.preload(CAFE_MODEL, DRACO_PATH);

/*
  Bureau (desk.glb) : plateau long selon Z (2.49 × 1.06), dessus à y ≈ +0.039, pieds jusqu'à y ≈ -1.078.
  Tourné d'un quart de tour pour que sa longueur suive l'axe X, mis à l'échelle pour que le dessus soit à DESK_TOP.
*/
const DESK_HEIGHT = 1.117;
const DESK_SCALE = DESK_TOP / DESK_HEIGHT;

function Desk() {
  const { scene } = useGLTF(DESK_MODEL, DRACO_PATH);
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

useGLTF.preload(DESK_MODEL, DRACO_PATH);
useGLTF.preload(HAND_MODEL, DRACO_PATH);

export default function PlaceholderDesk({ onSetup }) {
  const keysRef = useRef();
  const { scene: armScene } = useGLTF(HAND_MODEL, DRACO_PATH);
  const leftRig = useArmRig(armScene);
  const rightRig = useArmRig(armScene);
  const arms = useTyping(keysRef, [leftRig, rightRig]);
  const rootRef = useRef();
  const scene = useThree((s) => s.scene);

  useLayoutEffect(() => {
    scene.fog = new Fog("#0a0740", 2.5, 8);
    return () => (scene.fog = null);
  }, [scene]);

  useLayoutEffect(() => {
    const cam = new PerspectiveCamera(PLACEHOLDER_CAMERA.fov);
    cam.position.fromArray(PLACEHOLDER_CAMERA.position);
    cam.lookAt(new Vector3().fromArray(PLACEHOLDER_CAMERA.target));
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
      <Keyboard keysRef={keysRef} />
      <Arm side={-1} rig={leftRig} groupRef={arms[0]} />
      <Arm side={1} rig={rightRig} groupRef={arms[1]} />
      <Cafe />
    </group>
  );
}
