import { useState } from "react";

// Image qui réserve sa place (pas de saut de mise en page) et apparaît en fondu une fois chargée
// className : classes de l'image, transition comprise (fondu d'opacité par défaut)
export default function SmartImage({ src, alt, width, height, eager = false, className = "transition-opacity duration-500" }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      ref={(img) => img?.complete && img.naturalWidth && !loaded && setLoaded(true)}
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onLoad={() => setLoaded(true)}
      className={`${loaded ? "opacity-100" : "opacity-0"} ${className}`}
    />
  );
}
