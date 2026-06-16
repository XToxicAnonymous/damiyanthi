import React, { useEffect, useState } from "react";

interface Petal {
  id: number;
  left: number; // horizontal starting percentage (0 - 100)
  size: number; // size in pixels (10 - 24)
  delay: number; // animation delay in seconds
  duration: number; // fall duration in seconds
  opacity: number; // general opacity
  swaySpeed: number; // horizontal sway frequency in seconds
  color: string; // Tailwind svg fill / custom color inline
  type: number; // petal SVG type (0, 1, 2)
}

export default function FlowerPetals() {
  const [petals, setPetals] = useState<Petal[]>([]);
  const [enabled, setEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem("damiyanthi_petals_enabled") !== "false";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (!enabled) {
      setPetals([]);
      return;
    }

    // Generate a fixed set of petals (e.g. 15 to keep DOM slim and ultra-performant)
    const petalColors = [
      "rgba(245, 158, 11, 0.45)", // Warm Amber
      "rgba(251, 191, 36, 0.4)",  // Light Amber/Gold
      "rgba(255, 255, 255, 0.6)",  // Pure Jasmine White
      "rgba(254, 215, 170, 0.5)",  // Soft Peach
      "rgba(251, 113, 133, 0.35)", // Soft Rose Pink
    ];

    const count = 16;
    const generated: Petal[] = [];

    for (let i = 0; i < count; i++) {
      generated.push({
        id: i,
        left: Math.random() * 100, // Starts at random horizontal positions
        size: Math.random() * 14 + 10, // 10px to 24px
        delay: Math.random() * -15, // Negative delay so some start midway immediately!
        duration: Math.random() * 12 + 14, // 14 to 26 seconds (very slow and elegant)
        opacity: Math.random() * 0.4 + 0.4, // 0.4 to 0.8 opacity
        swaySpeed: Math.random() * 4 + 3, // 3s to 7s sway cycle
        color: petalColors[i % petalColors.length],
        type: i % 3,
      });
    }

    setPetals(generated);
  }, [enabled]);

  const togglePetals = () => {
    setEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("damiyanthi_petals_enabled", String(next));
      } catch {}
      return next;
    });
  };

  // SVG path render helpers
  const renderPetalPath = (type: number) => {
    switch (type) {
      case 0:
        // Classic symmetric teardrop rose/marigold petal
        return "M 12,2 C 18,2 22,8 20,16 C 18,22 12,24 12,24 C 12,24 6,22 4,16 C 2,8 6,2 12,2 Z";
      case 1:
        // Double-lobed Sakura cherry blossom petal
        return "M 12,4 C 14,2 17,2 19,5 C 21,8 21,12 18,17 C 15,21 12,23 12,23 C 12,23 9,21 6,17 C 3,12 3,8 5,5 C 7,2 10,2 12,4 Z";
      case 2:
      default:
        // Slender jasmine/mandala petal
        return "M 12,2 C 16,8 16,14 12,22 C 8,14 8,8 12,2 Z";
    }
  };

  return (
    <>
      {/* Self-contained styling module to maximize FPS using pure GPU layout thread */}
      <style>{`
        @keyframes petal-fall-fade {
          0% {
            transform: translate3d(0, -10vh, 0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: var(--init-opacity, 0.7);
          }
          90% {
            opacity: var(--init-opacity, 0.7);
          }
          100% {
            transform: translate3d(8vw, 110vh, 0) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes petal-sway {
          0%, 100% {
            transform: translate3d(-15px, 0, 0) rotate(-15deg);
          }
          50% {
            transform: translate3d(15px, 0, 0) rotate(15deg);
          }
        }

        .petal-container {
          pointer-events: none;
          position: fixed;
          inset: 0;
          z-index: 25;
          overflow: hidden;
        }

        .gpu-petal {
          position: absolute;
          top: 0;
          will-change: transform, opacity;
          backface-visibility: hidden;
          perspective: 1000px;
        }

        .petal-inner {
          animation: petal-sway var(--sway-duration, 5s) ease-in-out infinite;
          will-change: transform;
        }
      `}</style>

      {/* Floating control trigger on screen side */}
      <button
        onClick={togglePetals}
        title={enabled ? "Disable drifting petals" : "Enable drifting petals"}
        aria-label="Toggle Drifting Petals"
        className="fixed bottom-24 right-6 z-40 p-2.5 bg-stone-100/90 hover:bg-stone-200 dark:bg-stone-900/90 dark:hover:bg-stone-800 border border-stone-200/50 dark:border-stone-800/80 rounded-full shadow-lg transition-all text-xs font-mono select-none flex items-center justify-center gap-1.5 text-stone-500 hover:text-stone-850 dark:text-stone-400 dark:hover:text-amber-400 cursor-pointer active:scale-95"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${enabled ? "bg-emerald-500 animate-pulse" : "bg-stone-300 dark:bg-stone-700"}`} />
        <span className="text-[10px] tracking-tight">Petals {enabled ? "On" : "Off"}</span>
      </button>

      {enabled && (
        <div className="petal-container" aria-hidden="true">
          {petals.map((p) => (
            <div
              key={p.id}
              className="gpu-petal"
              style={{
                left: `${p.left}%`,
                animation: `petal-fall-fade ${p.duration}s linear infinite`,
                animationDelay: `${p.delay}s`,
                // @ts-ignore
                "--init-opacity": p.opacity,
              }}
            >
              <div
                className="petal-inner"
                style={{
                  // @ts-ignore
                  "--sway-duration": `${p.swaySpeed}s`,
                }}
              >
                <svg
                  width={p.size}
                  height={p.size}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    transform: `rotate(${Math.random() * 360}deg)`,
                  }}
                >
                  <path
                    d={renderPetalPath(p.type)}
                    fill={p.color}
                    className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
