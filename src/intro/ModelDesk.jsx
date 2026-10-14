import { useEffect, useLayoutEffect } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import { Box3, MeshBasicMaterial, PerspectiveCamera, Quaternion, Sphere, Vector3 } from "three";
import { useCodeScreen } from "./useCodeScreen.js";
import { getScreenFrame } from "./screenFrame.js";
import { DRACO_PATH, INTRO_MODEL, KEYBOARD_MESH, SCREEN_MESH } from "./config.js";

/*
  Yeux du personnage estimés quand le .glb ne contient pas de caméra :
  devant l'écran, à sa hauteur, en regardant le clavier (mesh "Keyboard") ou plus bas devant soi.
*/
function autoStart(scene, screen) {
  const keyboard = scene.getObjectByName(KEYBOARD_MESH);
  const up = new Vector3(0, 1, 0);
  let eye, target;
  if (screen) {
    const sceneCenter = new Box3().setFromObject(scene).getCenter(new Vector3());
    const { center, normal, width, height } = getScreenFrame(screen, sceneCenter);
    eye = center.clone().addScaledVector(normal, width * 1.6).addScaledVector(up, height * 0.3);
    target = keyboard
      ? new Box3().setFromObject(keyboard).getCenter(new Vector3())
      : center.clone().addScaledVector(normal, width * 0.75).addScaledVector(up, -height * 0.9);
  } else {
    const sphere = new Box3().setFromObject(scene).getBoundingSphere(new Sphere());
    eye = sphere.center.clone().add(new Vector3(0, sphere.radius * 0.4, sphere.radius * 1.2));
    target = sphere.center;
  }
  const cam = new PerspectiveCamera(55);
  cam.position.copy(eye);
  cam.lookAt(target);
  return { position: cam.position.clone(), quaternion: cam.quaternion.clone(), fov: 55 };
}

export default function ModelDesk({ onSetup }) {
  const gltf = useGLTF(INTRO_MODEL, DRACO_PATH);
  const { actions } = useAnimations(gltf.animations, gltf.scene);
  const texture = useCodeScreen(false);

  useEffect(() => {
    Object.values(actions).forEach((action) => action?.reset().play());
  }, [actions]);

  useLayoutEffect(() => {
    gltf.scene.updateMatrixWorld(true);
    gltf.scene.traverse((o) => {
      if (o.isMesh) o.castShadow = o.receiveShadow = true;
    });

    // L'objet "Screen" peut être un mesh ou un groupe (plusieurs matériaux dans Blender)
    const screen = gltf.scene.getObjectByName(SCREEN_MESH);
    if (screen) {
      const material = new MeshBasicMaterial({ map: texture, toneMapped: false });
      screen.traverse((o) => o.isMesh && (o.material = material));
    } else {
      console.warn(`[intro] Aucun objet nommé "${SCREEN_MESH}" dans ${INTRO_MODEL}`);
    }

    const cam = gltf.cameras[0];
    const start = cam
      ? {
          position: cam.getWorldPosition(new Vector3()),
          quaternion: cam.getWorldQuaternion(new Quaternion()),
          fov: cam.fov ?? 40,
        }
      : autoStart(gltf.scene, screen);
    onSetup({ screen, start });
  }, [gltf, texture, onSetup]);

  return <primitive object={gltf.scene} />;
}
