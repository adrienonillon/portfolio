// Nappes de couleur floues qui forment le fond animé du site
const SHAPES = [
  "-bottom-[15%] bg-[linear-gradient(45deg,transparent_20%,rgba(83,18,196,0.5)_60%,transparent_90%)] [clip-path:ellipse(85%_45%_at_50%_95%)]",
  "-bottom-[10%] bg-[linear-gradient(135deg,transparent_30%,rgba(165,141,206,0.4)_70%,transparent_95%)] [clip-path:ellipse(75%_35%_at_30%_85%)]",
  "top-[20%] bg-[linear-gradient(60deg,rgba(184,182,207,0.35)_25%,transparent_70%)] [clip-path:ellipse(70%_40%_at_80%_50%)]",
  "top-[10%] bg-[linear-gradient(180deg,rgba(83,18,196,0.3)_40%,transparent_85%)] [clip-path:ellipse(60%_35%_at_15%_30%)]",
  "top-1/2 -translate-y-1/2 bg-[linear-gradient(270deg,transparent_35%,rgba(165,141,206,0.35)_65%,transparent_90%)] [clip-path:ellipse(80%_42%_at_50%_50%)]",
  "-top-[5%] -right-[10%] bg-[linear-gradient(315deg,transparent_25%,rgba(165,141,206,0.4)_65%,transparent_85%)] [clip-path:ellipse(65%_40%_at_90%_15%)]",
  "-bottom-[8%] -left-[15%] bg-[linear-gradient(225deg,transparent_30%,rgba(83,18,196,0.35)_60%,transparent_90%)] [clip-path:ellipse(70%_38%_at_10%_90%)]",
];

export default function Aurora() {
  return (
    <div className="fixed inset-0 -z-1 overflow-hidden pointer-events-none bg-linear-to-b from-bg to-bg-deep" aria-hidden="true">
      {SHAPES.map((shape, i) => {
        // Flou plus léger sur mobile (7 calques plein écran, coûteux à calculer)
        const layer = <div key={shape} className={`absolute size-full blur-[55px] max-md:blur-[28px] ${shape}`} />;
        // Vague (sur ordinateur) : c'est le conteneur qui bouge, le calque flouté est calculé une seule fois
        return i === 0 ? (
          <div key={shape} className="absolute inset-0 md:will-change-transform md:animate-wave">
            {layer}
          </div>
        ) : (
          layer
        );
      })}
    </div>
  );
}
