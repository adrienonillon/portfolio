import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Euler, PerspectiveCamera, Quaternion, Vector3 } from "three";
import PlaceholderDesk from "./PlaceholderDesk.jsx";
import ModelDesk from "./ModelDesk.jsx";
import { getScreenFrame } from "./screenFrame.js";
import { DIVE_DURATION, HOLD_DURATION, LOOK_UP_DURATION, LOW_POWER } from "./config.js";

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
const REF_ASPECT = 16 / 10;
const clamp01 = (v) => Math.min(1, Math.max(0, v));

// Regard levé vers l'écran : même position (la tête se redresse un peu), orientée vers le centre de l'écran
function computeLookPose(screen, camera) {
  const target = new PerspectiveCamera(camera.fov, camera.aspect);
  target.position.copy(camera.position).add(new Vector3(0, 0.03, 0));
  if (screen) target.lookAt(getScreenFrame(screen, camera.position).center);
  else target.quaternion.copy(camera.quaternion).multiply(new Quaternion().setFromEuler(new Euler(0.5, 0, 0)));
  return target;
}

// Position finale : face à l'écran, assez près pour qu'il remplisse toute la fenêtre
function computeEndPose(screen, from) {
  const target = new PerspectiveCamera(from.fov, from.aspect);
  if (!screen) {
    const forward = new Vector3(0, 0, -1).applyQuaternion(from.quaternion);
    target.position.copy(from.position).addScaledVector(forward, 0.6);
    target.quaternion.copy(from.quaternion);
    return target;
  }
  const { center, normal, width, height } = getScreenFrame(screen, from.position);
  const tan = Math.tan((from.fov * Math.PI) / 360);
  const distance = Math.min(height / 2 / tan, width / 2 / (tan * from.aspect)) * 0.9;
  target.position.copy(center).addScaledVector(normal, distance);
  target.lookAt(center);
  return target;
}

function CameraRig({ setup, entering, onDiveEnd, fadeRef }) {
  const { camera } = useThree();
  const seq = useRef(null);
  const tmp = useMemo(() => ({ quat: new Quaternion(), offset: new Quaternion(), euler: new Euler(0, 0, 0, "YXZ"), pos: new Vector3() }), []);

  useLayoutEffect(() => {
    if (!setup) return;
    camera.position.copy(setup.start.position);
    camera.quaternion.copy(setup.start.quaternion);
  }, [setup, camera]);

  // Sur un écran plus étroit que 16:10 (mobile en portrait), on élargit le champ pour garder le cadrage
  const aspect = useThree((s) => s.size.width / s.size.height);
  useLayoutEffect(() => {
    if (!setup) return;
    const tan = Math.tan((setup.start.fov * Math.PI) / 360);
    const fov = aspect < REF_ASPECT ? (Math.atan((tan * REF_ASPECT) / aspect) * 360) / Math.PI : setup.start.fov;
    camera.fov = Math.min(fov, 85);
    camera.near = 0.01;
    camera.updateProjectionMatrix();
  }, [setup, camera, aspect]);

  useFrame((state, dt) => {
    if (!setup) return;

    if (!entering) {
      // Regard sur le clavier : respiration, petits mouvements de tête qui suivent les mains, et la souris
      dt = Math.min(dt, 0.05);
      const t = state.clock.elapsedTime;
      tmp.euler.set(
        Math.sin(t * 0.7) * 0.012 + state.pointer.y * 0.06,
        Math.sin(t * 0.45) * 0.03 - state.pointer.x * 0.1,
        Math.sin(t * 0.3) * 0.006
      );
      tmp.quat.copy(setup.start.quaternion).multiply(tmp.offset.setFromEuler(tmp.euler));
      camera.quaternion.slerp(tmp.quat, 1 - Math.exp(-dt * 4));
      tmp.pos.copy(setup.start.position).y += Math.sin(t * 1.4) * 0.004;
      camera.position.lerp(tmp.pos, 1 - Math.exp(-dt * 4));
      return;
    }

    if (!seq.current) {
      const look = computeLookPose(setup.screen, camera);
      seq.current = {
        t: 0,
        ended: false,
        fromPos: camera.position.clone(),
        fromQuat: camera.quaternion.clone(),
        look,
        end: computeEndPose(setup.screen, look),
      };
    }
    const s = seq.current;
    // dt non bridé (sauf gros à-coups) : la séquence dure le même temps même si l'appareil rame
    s.t += Math.min(dt, 0.25);

    const lookT = clamp01(s.t / LOOK_UP_DURATION);
    const diveT = clamp01((s.t - LOOK_UP_DURATION - HOLD_DURATION) / DIVE_DURATION);
    if (diveT <= 0) {
      const k = easeInOutSine(lookT);
      camera.position.lerpVectors(s.fromPos, s.look.position, k);
      camera.quaternion.slerpQuaternions(s.fromQuat, s.look.quaternion, k);
    } else {
      const k = easeInOutCubic(diveT);
      camera.position.lerpVectors(s.look.position, s.end.position, k);
      camera.quaternion.slerpQuaternions(s.look.quaternion, s.end.quaternion, k);
    }
    if (fadeRef.current) fadeRef.current.style.opacity = clamp01((diveT - 0.75) / 0.25);
    if (diveT >= 1 && !s.ended) {
      s.ended = true;
      onDiveEnd();
    }
  });

  return null;
}

// Résolution du rendu (× pixels de l'écran) : plafonnée, puis réduite si l'appareil n'arrive pas à suivre
const MAX_DPR = LOW_POWER ? 1.25 : 1.5;

/*
  Compile les shaders de la scène en arrière-plan (sans figer la page) dès que les modèles sont chargés.
  Sans ça, le premier rendu les compile d'un bloc et bloque le navigateur plus d'une seconde sur mobile.
*/
function Precompile({ onDone }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    let alive = true;
    const done = () => alive && onDone();
    gl.compileAsync(scene, camera).then(done, done);
    // Filet de sécurité : si le navigateur ne signale jamais la fin, on démarre quand même
    const timer = setTimeout(done, 3000);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [gl, scene, camera, onDone]);
  return null;
}

/*
  compiled : shaders prêts ; ready : l'écran de chargement a disparu.
  Avant compiled, aucun rendu ; entre les deux, rendu à la demande (la scène est cachée) ; ensuite, en continu.
*/
export default function IntroScene({ useModel, compiled, onCompiled, ready, setup, onSetup, entering, onDiveEnd, fadeRef, onClick }) {
  const [dpr, setDpr] = useState(Math.min(MAX_DPR, window.devicePixelRatio || 1));
  return (
    <Canvas
      className="absolute! inset-0 cursor-pointer"
      // Sur mobile : sans ombres ni anticrénelage (l'écran est déjà très dense)
      dpr={dpr}
      frameloop={!compiled ? "never" : ready ? "always" : "demand"}
      shadows={!LOW_POWER}
      camera={{ fov: 55, near: 0.01, far: 60 }}
      gl={{ antialias: !LOW_POWER, powerPreference: "high-performance" }}
      onClick={onClick}
    >
      <color attach="background" args={["#0a0740"]} />
      <PerformanceMonitor onDecline={() => setDpr(1)} />
      <Suspense fallback={null}>
        {useModel ? <ModelDesk onSetup={onSetup} /> : <PlaceholderDesk onSetup={onSetup} />}
        <Precompile onDone={onCompiled} />
      </Suspense>
      <CameraRig setup={setup} entering={entering} onDiveEnd={onDiveEnd} fadeRef={fadeRef} />
    </Canvas>
  );
}
