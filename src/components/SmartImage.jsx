import { useState } from "react";

// Image qui réserve sa place (pas de saut de mise en page) et apparaît en fondu une fois chargée
export default function SmartImage({ src, alt, width, height, eager = false, className = "" }) {
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
      className={`smart-img${loaded ? " is-loaded" : ""} ${className}`}
    />
  );
}
