import { useCallback, useEffect, useState } from "react";

export const PAGES = ["accueil", "a-propos", "projets", "contact"];

// Garde le format d'URL de l'ancien site : #projets, #contact, #projet-<id>...
function parseHash() {
  const hash = decodeURIComponent(window.location.hash.slice(1));
  if (hash.startsWith("projet-")) return { page: "projet", id: hash.slice("projet-".length), key: hash };
  const page = PAGES.includes(hash) ? hash : "accueil";
  return { page, key: page };
}

export function useHashRoute() {
  const [route, setRoute] = useState(parseHash);

  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const navigate = useCallback((hash) => {
    if (window.location.hash === `#${hash}`) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    window.location.hash = hash;
  }, []);

  return [route, navigate];
}
