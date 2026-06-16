import React, { useEffect, useState } from "react";

interface StardustParticle {
  id: number;
  left: number; // horizontal starting percentage (0 - 100)
  bottom: number; // vertical offset starting percentage (usually bottom of screen)
  size: number; // microscopic size (2px - 6px)
  delay: number; // staggered entrance delay
  duration: number; // rising speed (12s - 25s)
  opacity: number; // random base transparency
  swaySpeed: number; // horizontal drift speed
  shimmerSpeed: number; // glow pulsing speed
  driftDistance: number; // wider custom lateral path travel (in vw units)
}

export default function StarDust() {
  const [particles, setParticles] = useState<StardustParticle[]>([]);
  const [enabled, setEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem("damiyanthi_stardust_enabled") !== "false";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (!enabled) {
      setParticles([]);
      return;
    }

    // Set up 50 microscopic golden star-dust particles to create a beautiful, rich atmosphere
    const count = 50;
    const generated: StardustParticle[] = [];

    for (let i = 0; i < count; i++) {
      // 15% of the particles are "long-haul travelers" that can drift very far sideways (up to 30vw)
      const isLongTraveler = Math.random() < 0.25;
      const dDistance = isLongTraveler 
        ? (Math.random() * 50 - 25) // -25vw to +25vw ultra large drift
        : (Math.random() * 16 - 8);  // -8vw to +8vw gentle drift

      generated.push({
        id: i,
        left: Math.random() * 110 - 5, // disperse wider starting lanes to avoid grouping
        bottom: Math.random() * -15, 
        size: Math.random() * 4.5 + 1.5, // 1.5px to 6px
        delay: Math.random() * -24, // highly staggered starting points
        duration: Math.random() * 12 + 12, // 12s to 24s slow float
        opacity: Math.random() * 0.45 + 0.35, 
        swaySpeed: Math.random() * 6 + 4, 
        shimmerSpeed: Math.random() * 2 + 1.5, 
        driftDistance: dDistance,
      });
    }

    setParticles(generated);
  }, [enabled]);

  const toggleStardust = () => {
    setEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("damiyanthi_stardust_enabled", String(next));
      } catch {}
      return next;
    });
  };

  return (
    <>
      {/* CSS hardware-accelerated shaders for ultra-smooth 120 FPS rising & shimmering */}
      <style>{`
        @keyframes stardust-rise {
          0% {
            transform: translate3d(0, 105vh, 0);
            opacity: 0;
          }
          15% {
            opacity: var(--base-opacity, 0.6);
          }
          85% {
            opacity: var(--base-opacity, 0.6);
          }
          100% {
            transform: translate3d(var(--drift-distance, 10vw), -15vh, 0);
            opacity: 0;
          }
        }

        @keyframes stardust-sway {
          0%, 100% {
            transform: translate3d(-20px, 0, 0);
          }
          50% {
            transform: translate3d(20px, 0, 0);
          }
        }

        @keyframes stardust-shimmer {
          0%, 100% {
            opacity: 0.2;
            filter: drop-shadow(0 0 1px rgba(245, 158, 11, 0.4));
          }
          50% {
            opacity: 1;
            filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.95));
          }
        }

        .stardust-container {
          pointer-events: none;
          position: fixed;
          inset: 0;
          z-index: 20;
          overflow: hidden;
        }

        .gpu-dust {
          position: absolute;
          bottom: 0;
          will-change: transform, opacity;
          backface-visibility: hidden;
          perspective: 1000px;
        }

        .dust-inner {
          animation: stardust-sway var(--sway-duration, 6s) ease-in-out infinite;
          will-change: transform;
        }

        .dust-glow {
          animation: stardust-shimmer var(--shimmer-duration, 2s) ease-in-out infinite;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(251, 191, 36, 1) 0%, rgba(245, 158, 11, 0.4) 70%, transparent 100%);
        }
      `}</style>

      {/* Floating Stardust Control button on screen side */}
      <button
        onClick={toggleStardust}
        title={enabled ? "Disable ambient light dust" : "Enable ambient light dust"}
        aria-label="Toggle Ethereal Stardust"
        className="fixed bottom-24 right-6 z-40 p-2.5 bg-stone-100/90 hover:bg-stone-200 dark:bg-stone-900/90 dark:hover:bg-stone-800 border border-stone-200/50 dark:border-stone-800/80 rounded-full shadow-lg transition-all text-xs font-mono select-none flex items-center justify-center gap-1.5 text-stone-500 hover:text-stone-850 dark:text-stone-400 dark:hover:text-amber-400 cursor-pointer active:scale-95"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${enabled ? "bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]" : "bg-stone-300 dark:bg-stone-700"}`} />
        <span className="text-[10px] tracking-tight">Dust {enabled ? "On" : "Off"}</span>
      </button>

      {enabled && (
        <div className="stardust-container" aria-hidden="true">
          {particles.map((p) => {
            return (
              <div
                key={p.id}
                className="gpu-dust"
                style={{
                  left: `${p.left}%`,
                  animation: `stardust-rise ${p.duration}s linear infinite`,
                  animationDelay: `${p.delay}s`,
                  // @ts-ignore
                  "--base-opacity": p.opacity,
                  "--drift-distance": `${p.driftDistance}vw`,
                }}
              >
                <div
                  className="dust-inner"
                  style={{
                    // @ts-ignore
                    "--sway-duration": `${p.swaySpeed}s`,
                  }}
                >
                  <div
                    className="dust-glow"
                    style={{
                      width: `${p.size}px`,
                      height: `${p.size}px`,
                      // @ts-ignore
                      "--shimmer-duration": `${p.shimmerSpeed}s`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
