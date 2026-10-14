import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { CodeScreen } from "./codeScreen.js";

// Texture animée du code qui défile, mise à jour à chaque image
export function useCodeScreen(flipY, height) {
  const screen = useMemo(() => new CodeScreen({ flipY, height }), [flipY, height]);
  useEffect(() => () => screen.dispose(), [screen]);
  useFrame((_, dt) => screen.update(Math.min(dt, 0.1)));
  return screen.texture;
}
