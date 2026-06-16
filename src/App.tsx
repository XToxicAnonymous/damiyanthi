/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Heart, Calendar, MessageSquare, BookOpen, Camera, BrainCircuit, Sparkles, Flame, Sun, Moon, ShieldAlert, Sparkle, Lock, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Countdown from "./components/Countdown";
import AddTributeForm from "./components/AddTributeForm";
import TributeList from "./components/TributeList";
import PhotoGallery from "./components/PhotoGallery";
import AIVirtueWall from "./components/AIVirtueWall";
import AdminPanel from "./components/AdminPanel";
import StarDust from "./components/StarDust";
import AmbientMusic from "./components/AmbientMusic";
import { Tribute, Photo } from "./types";

interface WebsiteConfig {
  subtitle: string;
  quote: string;
  dressAdvisoryTitle: string;
  dressAdvisoryText: string;
  dressAdvisoryNotes: string;
  portraitUrl?: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState("schedule");
  const [tributes, setTributes] = useState<Tribute[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  // Day & Night theme state (default is dark as requested)
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try {
      const saved = localStorage.getItem("damiyanthi_theme");
      return saved === "light" ? "light" : "dark"; // default is dark
    } catch {
      return "dark";
    }
  });

  // Website Editable Text Config State
  const [config, setConfig] = useState<WebsiteConfig>({
    subtitle: "In Loving Remembrance of",
    quote: "A life so beautifully lived, a heart so deeply loved. Her peaceful light guides us forever.",
    dressAdvisoryTitle: "🌸 Tradition & Dress Advisory",
    dressAdvisoryText: "To honor Ammama's deeply traditional life, we request attendees of the prayer meet to kindly wear standard formal whites or light pastel attire, expressing purity and peace.",
    dressAdvisoryNotes: "For family and friends living overseas or unable to attend in person at Kamothe, a tribute or virtual candle placed on the guestbook will be compiled and printed into her permanent commemorative books.",
    portraitUrl: ""
  });

  // Admin states
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem("damiyanthi_admin_active") === "true";
    } catch {
      return false;
    }
  });
  const [showAdminEditModal, setShowAdminEditModal] = useState(false);

  // Hold-to-reveal admin progress state
  const [holdProgress, setHoldProgress] = useState(0);
  const [holdTimer, setHoldTimer] = useState<NodeJS.Timeout | null>(null);

  // Toggle Day and Night Theme
  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("damiyanthi_theme", next);
      } catch {}
      return next;
    });
  };

  // Fetch initial datasets and editable website configuration
  useEffect(() => {
    async function loadData() {
      try {
        const [tribRes, photRes, configRes] = await Promise.all([
          fetch("/api/tributes").catch(() => null),
          fetch("/api/photos").catch(() => null),
          fetch("/api/config").catch(() => null)
        ]);
        
        let tribs = [];
        let phots = [];
        
        if (tribRes && tribRes.ok) {
          tribs = await tribRes.json();
        }
        if (photRes && photRes.ok) {
          phots = await photRes.json();
        }

        // Load local storage supplements for robust offline/Vercel support
        let localTribs: Tribute[] = [];
        let localPhots: Photo[] = [];
        let deletedTribIds: string[] = [];
        let deletedPhotIds: string[] = [];
        let localConfigStr = null;

        try {
          localTribs = JSON.parse(localStorage.getItem("damiyanthi_local_tributes") || "[]");
          localPhots = JSON.parse(localStorage.getItem("damiyanthi_local_photos") || "[]");
          deletedTribIds = JSON.parse(localStorage.getItem("damiyanthi_deleted_tributes") || "[]");
          deletedPhotIds = JSON.parse(localStorage.getItem("damiyanthi_deleted_photos") || "[]");
          localConfigStr = localStorage.getItem("damiyanthi_config_override");
        } catch (storageErr) {
          console.warn("Could not read local storage supplement state", storageErr);
        }

        // Merge tributes list: apply local edits, prepend user custom-added ones, and remove deleted ones
        let mergedTribs = [...tribs];
        
        try {
          const localEditsTribs = JSON.parse(localStorage.getItem("damiyanthi_edited_tributes") || "{}");
          mergedTribs = mergedTribs.map(t => localEditsTribs[t.id] ? { ...t, ...localEditsTribs[t.id] } : t);
        } catch {}

        const existingTribIds = new Set(mergedTribs.map(t => t.id));
        localTribs.forEach((t: Tribute) => {
          if (t && t.id && !existingTribIds.has(t.id)) {
            mergedTribs.unshift(t);
          }
        });

        mergedTribs = mergedTribs.filter(t => t && t.id && !deletedTribIds.includes(t.id));

        // Merge photos list: apply local edits, prepend local custom images, and filter out deleted ones
        let mergedPhots = [...phots];

        try {
          const localEditsPhots = JSON.parse(localStorage.getItem("damiyanthi_edited_photos") || "{}");
          mergedPhots = mergedPhots.map(p => localEditsPhots[p.id] ? { ...p, ...localEditsPhots[p.id] } : p);
        } catch {}

        const existingPhotIds = new Set(mergedPhots.map(p => p.id));
        localPhots.forEach((p: Photo) => {
          if (p && p.id && !existingPhotIds.has(p.id)) {
            mergedPhots.unshift(p);
          }
        });

        mergedPhots = mergedPhots.filter(p => p && p.id && !deletedPhotIds.includes(p.id));
        
        setTributes(mergedTribs);
        setPhotos(mergedPhots);

        if (localConfigStr) {
          try {
            setConfig(JSON.parse(localConfigStr));
          } catch {}
        } else if (configRes && configRes.ok) {
          const cfg = await configRes.json();
          setConfig(cfg);
        }
      } catch (err) {
        console.error("Failed loading memory databases, defaulting to fallback assets", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Hold to Admin Reveal Controls (UNIVERSAL cross-pointer trigger)
  const handleStartHold = (e: React.PointerEvent) => {
    // Only register left mouse click or touch points
    if (e.pointerType === "mouse" && e.button !== 0) return;

    if (holdTimer) clearInterval(holdTimer);
    setHoldProgress(0);

    const holdDuration = 60000; // 60 seconds (1 minute as requested)
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressPercent = Math.min((elapsed / holdDuration) * 100, 100);
      setHoldProgress(progressPercent);

      if (elapsed >= holdDuration) {
        clearInterval(timer);
        setHoldTimer(null);
        setHoldProgress(0);

        // Toggle Admin activation
        setIsAdmin((prev) => {
          const next = !prev;
          try {
            localStorage.setItem("damiyanthi_admin_active", String(next));
          } catch {}
          if (next) {
            setShowAdminEditModal(true);
          }
          return next;
        });

        // Play standard elegant chime sound using native browser Web Audio API
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscNode = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          oscNode.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          
          oscNode.type = "sine";
          // Play ascending notes representing unlocked sanctuary
          oscNode.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
          oscNode.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.18); // A5
          
          gainNode.gain.setValueAtTime(0.18, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.45);
          
          oscNode.start();
          oscNode.stop(audioCtx.currentTime + 0.45);
        } catch (soundErr) {
          console.log("Audio contexts blocked or not supported on this device/sandboxed iframe", soundErr);
        }
      }
    }, 100);

    setHoldTimer(timer);
  };

  const handleEndHold = () => {
    if (holdTimer) {
      clearInterval(holdTimer);
      setHoldTimer(null);
    }
    setHoldProgress(0);
  };

  // Tribute adding
  const handleTributeAdded = (newTribute: Tribute) => {
    setTributes((prev) => [newTribute, ...prev]);
    try {
      const localTribs = JSON.parse(localStorage.getItem("damiyanthi_local_tributes") || "[]");
      localTribs.unshift(newTribute);
      localStorage.setItem("damiyanthi_local_tributes", JSON.stringify(localTribs));
    } catch {}
  };

  // Tribute CRUD edit and delete handlers
  const handleEditTribute = async (id: string, updated: Partial<Tribute>) => {
    setTributes((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
    
    try {
      const localEdits = JSON.parse(localStorage.getItem("damiyanthi_edited_tributes") || "{}");
      localEdits[id] = { ...(localEdits[id] || {}), ...updated };
      localStorage.setItem("damiyanthi_edited_tributes", JSON.stringify(localEdits));
    } catch {}

    try {
      await fetch(`/api/tributes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
    } catch (err) {
      console.warn("API update failed, saved locally instead:", err);
    }
  };

  const handleDeleteTribute = async (id: string) => {
    setTributes((prev) => prev.filter((t) => t.id !== id));
    
    try {
      const deletedIds = JSON.parse(localStorage.getItem("damiyanthi_deleted_tributes") || "[]");
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        localStorage.setItem("damiyanthi_deleted_tributes", JSON.stringify(deletedIds));
      }
      
      const localTribs = JSON.parse(localStorage.getItem("damiyanthi_local_tributes") || "[]");
      const filtered = localTribs.filter((t: any) => t.id !== id);
      localStorage.setItem("damiyanthi_local_tributes", JSON.stringify(filtered));
    } catch {}

    try {
      await fetch(`/api/tributes/${id}`, { method: "DELETE" });
    } catch (err) {
      console.warn("API delete failed, synced locally instead:", err);
    }
  };

  // Photo management handlers
  const handlePhotoUploaded = (newPhoto: Photo) => {
    setPhotos((prev) => [newPhoto, ...prev]);
    try {
      const localPhots = JSON.parse(localStorage.getItem("damiyanthi_local_photos") || "[]");
      localPhots.unshift(newPhoto);
      localStorage.setItem("damiyanthi_local_photos", JSON.stringify(localPhots));
    } catch {}
  };

  const handleEditPhoto = async (id: string, caption: string, uploadedBy: string) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, caption, uploadedBy } : p)));
    
    try {
      const localEdits = JSON.parse(localStorage.getItem("damiyanthi_edited_photos") || "{}");
      localEdits[id] = { caption, uploadedBy };
      localStorage.setItem("damiyanthi_edited_photos", JSON.stringify(localEdits));
    } catch {}

    try {
      await fetch(`/api/photos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption, uploadedBy })
      });
    } catch (err) {
      console.warn("API update failed, saved locally instead:", err);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));

    try {
      const deletedIds = JSON.parse(localStorage.getItem("damiyanthi_deleted_photos") || "[]");
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        localStorage.setItem("damiyanthi_deleted_photos", JSON.stringify(deletedIds));
      }
      
      const localPhots = JSON.parse(localStorage.getItem("damiyanthi_local_photos") || "[]");
      const filtered = localPhots.filter((p: any) => p.id !== id);
      localStorage.setItem("damiyanthi_local_photos", JSON.stringify(filtered));
    } catch {}

    try {
      await fetch(`/api/photos/${id}`, { method: "DELETE" });
    } catch (err) {
      console.warn("API delete failed, synced locally instead:", err);
    }
  };

  // Config Update
  const handleUpdateConfig = async (newConfig: WebsiteConfig) => {
    setConfig(newConfig);
    
    try {
      localStorage.setItem("damiyanthi_config_override", JSON.stringify(newConfig));
    } catch {}

    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig)
      });
      if (res.ok) {
        const saved = await res.json();
        setConfig(saved);
      }
    } catch (err) {
      console.warn("API update failed, saved locally instead:", err);
    }
  };

  const tabs = [
    { id: "schedule", label: "Ceremony Schedule", icon: Calendar },
    { id: "guestbook", label: "Tributes & Guestbook", icon: MessageSquare },
    { id: "gallery", label: "Photo Gallery", icon: Camera },
    { id: "virtues", label: "AI Legacy Wall", icon: BrainCircuit }
  ];

  const secondsLeft = Math.max(0, Math.ceil(60 - (holdProgress * 0.6)));

  return (
    <div className={`${theme === "dark" ? "dark bg-stone-950 text-stone-100" : "bg-stone-50 text-stone-800"} min-h-screen flex flex-col antialiased transition-colors duration-300 relative select-none`}>
      
      {/* Absolute floating theme switch button */}
      <button
        id="theme-toggler"
        onClick={handleToggleTheme}
        aria-label="Toggle Day and Night Theme"
        className="fixed bottom-6 right-6 z-40 p-3 bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 rounded-full shadow-2xl transition-all cursor-pointer text-stone-800 dark:text-amber-500 scale-100 active:scale-95 flex items-center justify-center"
      >
        {theme === "dark" ? <Sun size={20} className="stroke-[2.5]" /> : <Moon size={20} className="stroke-[2.5]" />}
      </button>

      {/* Floating stardust overlay and audio players */}
      <StarDust />
      <AmbientMusic />

      {/* Persistent top bar indicating active session if Administrator */}
      {isAdmin && (
        <div className="bg-amber-500 text-stone-950 font-sans text-xs py-2 px-4 shadow-md flex items-center justify-between font-bold z-40 sticky top-0 border-b border-amber-600/30">
          <div className="flex items-center gap-1.5">
            <ShieldAlert size={14} className="animate-bounce" />
            <span>Administrator Authorized Session — Feel free to edit headers, stories, or delete photos in lists inline</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdminEditModal(true)}
              className="bg-stone-950 hover:bg-stone-900 text-white rounded-md px-3 py-1 font-bold text-[10px] tracking-wide uppercase transition-colors"
            >
              Open Website Editor
            </button>
            <button
              onClick={() => {
                setIsAdmin(false);
                try {
                  localStorage.setItem("damiyanthi_admin_active", "false");
                } catch {}
              }}
              className="text-[10px] text-stone-900/80 hover:underline"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Header / Hero Area */}
      <header className="border-b border-stone-200 dark:border-stone-800 py-12 px-4 relative overflow-hidden bg-white dark:bg-stone-900/10 transition-colors duration-300">
        {/* Soft background decor blurs */}
        <div className="absolute top-0 left-0 w-44 h-44 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-56 h-56 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="text-stone-400 dark:text-stone-500 font-mono text-[10px] uppercase tracking-[0.25em] block">
            {config.subtitle}
          </span>

          {/* Draggable/Holdable Header Target for Admin panel */}
          <div className="inline-block relative">
            <h1
              id="admin-trigger-header"
              onPointerDown={handleStartHold}
              onPointerUp={handleEndHold}
              onPointerLeave={handleEndHold}
              onPointerCancel={handleEndHold}
              style={{ TouchAction: "none" }}
              className="font-serif text-3xl md:text-5xl text-stone-900 dark:text-stone-100 tracking-tight leading-none mt-2 font-light select-none cursor-pointer hover:opacity-90 active:scale-[0.99] transition-all relative z-10"
            >
              Damiyanthi Poliyath
            </h1>
          </div>

          <div className="flex items-center justify-center gap-2.5 font-mono text-xs md:text-sm text-stone-500 dark:text-stone-400 font-medium">
            <span>June 2, 1941</span>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <span>June 14, 2026</span>
          </div>

          <div className="italic text-stone-600 dark:text-stone-300 font-serif text-xs md:text-sm max-w-lg mx-auto leading-relaxed border-t border-b border-stone-200 dark:border-stone-800/80 py-4">
            "{config.quote}"
          </div>

          {/* Graphical Frame Portrait Showcase with Wreath */}
          <div 
            onClick={() => {
              if (isAdmin) {
                setShowAdminEditModal(true);
              }
            }}
            className={`relative w-40 h-40 md:w-44 md:h-44 mx-auto mt-6 ${isAdmin ? "cursor-pointer group" : ""}`}
            title={isAdmin ? "Click here to set or upload Grandmother's Portrait Photo" : undefined}
          >
            <div className="absolute inset-0 bg-amber-400/10 rounded-full blur-xl animate-pulse" />

            <div className="absolute inset-0 rounded-full border border-stone-200 dark:border-stone-800 flex items-center justify-center p-1.5 bg-white dark:bg-stone-900 relative z-10 shadow-sm transition-transform duration-300 group-hover:scale-[1.02]">
              <div className="w-full h-full rounded-full overflow-hidden bg-stone-100 dark:bg-stone-950 flex flex-col items-center justify-center border border-stone-200 dark:border-stone-800 relative">
                {config.portraitUrl ? (
                  <img 
                    src={config.portraitUrl} 
                    alt="Damiyanthi Poliyath" 
                    className="w-full h-full object-cover transition-all" 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <svg className="w-20 h-20 text-stone-400 dark:text-stone-600 mt-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.42 0-4.63-1.07-6.19-2.76.04-2.03 4.09-3.14 6.19-3.14s6.15 1.11 6.19 3.14C16.63 18.93 14.42 20 12 20z" />
                  </svg>
                )}
                {/* Lit candle overlays */}
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-stone-900/90 dark:bg-stone-950/90 border border-stone-800 px-3 py-0.5 rounded-full flex items-center gap-1.5 text-[9px] text-amber-500 font-bold shadow-xs z-10 transition-colors">
                  <Flame size={11} className="text-amber-500 fill-amber-500 animate-pulse" />
                  Ammama
                </div>

                {/* Optional Admin Change Badge */}
                {isAdmin && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200 z-20">
                    <Camera size={20} className="text-amber-500 animate-bounce mb-1" />
                    <span className="text-[9px] font-sans font-bold uppercase tracking-wider">Change Photo</span>
                  </div>
                )}
              </div>
            </div>

            {/* Floral gold Vines Wreath decorations */}
            <svg className="absolute inset-0 -m-3 text-amber-800/20 dark:text-amber-500/10 pointer-events-none origin-center transform rotate-45 scale-100" viewBox="0 0 100 100">
              <path d="M 50 10 C 65 10, 90 35, 90 50 C 90 65, 65 90, 50 90 C 35 90, 10 65, 10 50 C 10 35, 35 10, 50 10 Z" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" />
              <circle cx="50" cy="8" r="1.5" fill="currentColor" />
              <circle cx="92" cy="50" r="1.5" fill="currentColor" />
              <circle cx="50" cy="92" r="1.5" fill="currentColor" />
              <circle cx="8" cy="50" r="1.5" fill="currentColor" />
            </svg>
          </div>
        </div>
      </header>

      {/* Tabs navigation menu bar with sticky position */}
      <nav id="tabs-menu-bar" className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-30 px-4 overflow-x-auto scrollbar-none transition-colors duration-300">
        <div className="max-w-4xl mx-auto flex items-center justify-start sm:justify-center gap-1.5 py-3 text-stone-500 dark:text-stone-400 font-sans">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-sans cursor-pointer transition-all duration-200 whitespace-nowrap active:scale-[0.98] ${
                  isSelected ? "text-amber-900 dark:text-amber-500" : "hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/40"
                }`}
              >
                <Icon size={14} className={isSelected ? "text-amber-800 dark:text-amber-500" : "text-stone-400 dark:text-stone-600"} />
                <span>{tab.label}</span>

                {/* Sliding indicator line */}
                {isSelected && (
                  <motion.div
                    layoutId="tab-active-indicator"
                    className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-amber-700 dark:bg-amber-500"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Container Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:py-8 space-y-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <svg className="animate-spin w-8 h-8 text-amber-800 dark:text-amber-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-stone-550 dark:text-stone-400 font-sans text-xs">Opening digital memorial register...</span>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "schedule" && (
                <div className="space-y-6">
                  {/* Countdown clock with schedule details */}
                  <Countdown />
                  
                  {/* Beautiful customized advisory details, dynamic from Website Config */}
                  <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 font-sans text-xs max-w-3xl mx-auto space-y-4 shadow-xs transition-all">
                    <h4 className="font-serif text-sm text-stone-900 dark:text-stone-100 font-medium pb-2 border-b border-stone-200 dark:border-stone-800 flex items-center gap-2">
                       🌸 {config.dressAdvisoryTitle}
                    </h4>
                    <p className="leading-relaxed text-stone-600 dark:text-stone-300">
                      {config.dressAdvisoryText}
                    </p>
                    {config.dressAdvisoryNotes && (
                      <p className="leading-relaxed text-stone-500 dark:text-stone-400 border-l-2 border-amber-500/30 pl-3 italic">
                        {config.dressAdvisoryNotes}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "guestbook" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Register card */}
                  <div className="lg:col-span-5 space-y-6">
                    <AddTributeForm onTributeAdded={handleTributeAdded} />
                  </div>

                  {/* Right Column: Dynamic Flame indicator + Tributes List */}
                  <div className="lg:col-span-7">
                    <TributeList
                      tributes={tributes}
                      isAdmin={isAdmin}
                      onEditTribute={handleEditTribute}
                      onDeleteTribute={handleDeleteTribute}
                    />
                  </div>
                </div>
              )}

              {activeTab === "gallery" && (
                <PhotoGallery
                  photos={photos}
                  onPhotoUploaded={handlePhotoUploaded}
                  isAdmin={isAdmin}
                  onEditPhoto={handleEditPhoto}
                  onDeletePhoto={handleDeletePhoto}
                />
              )}

              {activeTab === "virtues" && (
                <div className="max-w-2xl mx-auto">
                  <AIVirtueWall />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Admin Panel Modal Overlay */}
      <AnimatePresence>
        {showAdminEditModal && (
          <AdminPanel
            config={config}
            onUpdateConfig={handleUpdateConfig}
            onClose={() => setShowAdminEditModal(false)}
            onLogOut={() => {
              setIsAdmin(false);
              setShowAdminEditModal(false);
              try {
                localStorage.setItem("damiyanthi_admin_active", "false");
              } catch {}
            }}
          />
        )}
      </AnimatePresence>

      {/* Clean low-contrast footer */}
      <footer className="border-t border-stone-200 dark:border-stone-900 py-8 text-center text-stone-400 dark:text-stone-600 font-serif text-[11px] leading-relaxed mt-12 bg-white dark:bg-stone-950 transition-colors duration-300">
        <div className="max-w-xs mx-auto space-y-2">
          <span>In Dearest Devotion</span>
          <p className="font-sans text-[10px]">
            © 2026 Poliyath Family. Built with everlasting love.
          </p>
        </div>
      </footer>
    </div>
  );
}
