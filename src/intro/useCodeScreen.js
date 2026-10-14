import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { CodeScreen } from "./codeScreen.js";
import { LOW_POWER } from "./config.js";

// Texture animée du code qui défile, mise à jour à chaque image
export function useCodeScreen(flipY, height) {
  const screen = useMemo(() => new CodeScreen({ flipY, height, scale: LOW_POWER ? 0.5 : 1 }), [flipY, height]);
  useEffect(() => () => screen.dispose(), [screen]);
  useFrame((_, dt) => screen.update(Math.min(dt, 0.1)));
  return screen.texture;
}
