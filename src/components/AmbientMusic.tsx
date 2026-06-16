import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function AmbientMusic() {
  const [isPlaying, setIsPlaying] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("damiyanthi_music_playing");
      // ON by default: only false if explicitly saved as 'false'
      return saved !== "false";
    } catch {
      return true;
    }
  });

  const [hasInteracted, setHasInteracted] = useState<boolean>(() => {
    try {
      return localStorage.getItem("damiyanthi_music_interacted") === "true";
    } catch {
      return false;
    }
  });

  // Web Audio Synth references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isPlayingSynthRef = useRef<boolean>(false);
  const synthNodesRef = useRef<any[]>([]);
  const synthIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize Web Audio Synth with local state
  useEffect(() => {
    if (isPlaying) {
      startSynth();
    } else {
      stopSynth();
    }
    return () => {
      stopSynth();
    };
  }, [isPlaying]);

  // Document-wide global gesture listener (safely resumes audio upon first touch/scroll/click)
  useEffect(() => {
    if (!isPlaying) return;

    const resumeAudioOnGesture = () => {
      setHasInteracted(true);
      try {
        localStorage.setItem("damiyanthi_music_interacted", "true");
      } catch {}

      if (audioCtxRef.current) {
        if (audioCtxRef.current.state === "suspended") {
          audioCtxRef.current.resume().catch((err) => {
            console.warn("Failed to resume AudioContext of Synth:", err);
          });
        }
      } else {
        startSynth();
      }
    };

    window.addEventListener("click", resumeAudioOnGesture, { once: true, passive: true });
    window.addEventListener("pointerdown", resumeAudioOnGesture, { once: true, passive: true });
    window.addEventListener("scroll", resumeAudioOnGesture, { once: true, passive: true });
    window.addEventListener("touchstart", resumeAudioOnGesture, { once: true, passive: true });

    return () => {
      window.removeEventListener("click", resumeAudioOnGesture);
      window.removeEventListener("pointerdown", resumeAudioOnGesture);
      window.removeEventListener("scroll", resumeAudioOnGesture);
      window.removeEventListener("touchstart", resumeAudioOnGesture);
    };
  }, [isPlaying]);

  const savePlayState = (state: boolean) => {
    try {
      localStorage.setItem("damiyanthi_music_playing", String(state));
    } catch {}
  };

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering parent click handlers
    setHasInteracted(true);
    try {
      localStorage.setItem("damiyanthi_music_interacted", "true");
    } catch {}

    setIsPlaying((prev) => {
      const next = !prev;
      savePlayState(next);
      return next;
    });

    // Directly initialize and run if toggling it active
    if (!isPlaying) {
      setTimeout(() => {
        if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
          audioCtxRef.current.resume().catch(() => {});
        }
      }, 50);
    }
  };

  /* ==========================================================================
     WEB AUDIO API - ORGANIC MEDITATIVE CHIME & DEEP SUNG BOWL SYNTHESISER
     Generates warm, authentic wave vibrations directly in-browser. Fully
     supports Vercel servers and offline/sandboxed frames.
     ========================================================================== */
  const startSynth = () => {
    if (isPlayingSynthRef.current) return;
    isPlayingSynthRef.current = true;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Primary Master gain limiter (quiet, soothing & respectful background level)
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.065, ctx.currentTime); // perfectly soft ambient volume
      masterGain.connect(ctx.destination);
      synthNodesRef.current.push(masterGain);

      // Low frequency drone resonance (Calming minor 7th chord drone atmosphere)
      // Notes: G2 (98.00Hz), C3 (130.81Hz), E3 (164.81Hz)
      const droneNotes = [98.0, 130.81, 164.81];
      droneNotes.forEach((freq) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        // Sine wave is pure, warm and lacks harsh harmonics
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Slow LFO for organic shifting volume waves (wind-blown effect)
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.1 + Math.random() * 0.08, ctx.currentTime);
        lfoGain.gain.setValueAtTime(0.35, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(oscGain.gain);
        lfo.start();
        synthNodesRef.current.push(lfo);

        oscGain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();

        synthNodesRef.current.push(osc);
      });

      // Melodic pentatonic wind chiming generator
      // Notes: G4 (392.00Hz), A4 (440.00Hz), C5 (523.25Hz), D5 (587.33Hz), E5 (659.25Hz), G5 (783.99Hz)
      const chimeNotes = [392.0, 440.0, 523.25, 587.33, 659.25, 783.99];
      
      const triggerChime = () => {
        if (!ctx || ctx.state === "suspended") return;
        const now = ctx.currentTime;
        const note = chimeNotes[Math.floor(Math.random() * chimeNotes.length)];

        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(note, now);

        // Gentle sub-harmonic tone mimicking chime wood resonators
        const partial = ctx.createOscillator();
        const partialGain = ctx.createGain();
        partial.type = "sine";
        partial.frequency.setValueAtTime(note * 1.5, now);
        partialGain.gain.setValueAtTime(0.05, now);
        
        filter.type = "lowpass";
        filter.Q.setValueAtTime(2.0, now);
        filter.frequency.setValueAtTime(1000, now);

        // Long soft attack & beautiful 6-second tail release
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 5.8); 

        osc.connect(filter);
        partial.connect(partialGain);
        partialGain.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        partial.start(now);
        
        osc.stop(now + 6.0);
        partial.stop(now + 6.0);
      };

      // Trigger immediately and schedule recurring elegant chimes
      triggerChime();
      const interval = setInterval(() => {
        if (Math.random() > 0.3) {
          triggerChime();
        }
      }, 4800); 
      
      synthIntervalRef.current = interval;

    } catch (err) {
      console.warn("Could not start synthesized music context:", err);
    }
  };

  const stopSynth = () => {
    if (!isPlayingSynthRef.current) return;
    isPlayingSynthRef.current = false;

    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }

    try {
      synthNodesRef.current.forEach((node) => {
        try {
          node.disconnect();
        } catch {}
        try {
          node.stop();
        } catch {}
      });
      synthNodesRef.current = [];

      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    } catch (err) {
      console.warn("Error cleaning up synthesizer:", err);
    }
  };

  return (
    <div className="gpu-accelerated fixed bottom-24 left-6 z-40 bg-white/95 dark:bg-stone-900/95 border border-stone-200/60 dark:border-stone-800/80 shadow-xl rounded-full p-1 flex items-center justify-center backdrop-blur-md transition-all scale-100 select-none">
      
      {/* Absolute state indicator icon pulsing */}
      <button
        onClick={handleTogglePlay}
        aria-label={isPlaying ? "Mute ambient music" : "Play ambient music"}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
          isPlaying
            ? "bg-amber-500 text-stone-950 animate-pulse shadow-md hover:bg-amber-400"
            : "bg-stone-100 hover:bg-stone-200 dark:bg-stone-850 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-350"
        }`}
      >
        {isPlaying ? (
          <Volume2 size={16} className="stroke-[2.5]" />
        ) : (
          <VolumeX size={16} className="stroke-[2.5]" />
        )}
      </button>

      {/* Helper ambient suggestion tooltip showing if user has never interacted */}
      {!hasInteracted && (
        <span className="absolute left-1/2 -translate-x-1/2 -top-10 bg-stone-900 border border-stone-800 text-white font-mono text-[8.5px] py-1 px-2.5 rounded-md shadow-2xl whitespace-nowrap select-none opacity-85 pointer-events-none transition-opacity animate-bounce">
          🌸 Soothing background music active
        </span>
      )}
    </div>
  );
}
