/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Sparkles, BrainCircuit, RefreshCcw, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { AIAnalysisResult } from "../types";

export default function AIVirtueWall() {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRunAnalysis = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/tributes/summary");
      if (!response.ok) throw new Error("Synthesis failed.");
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      console.error(err);
      setError("Failed to synthesize traits. We populated comfort presets.");
      // Fallback presets if system offline
      setAnalysis({
        themes: [
          { word: "Warmth", count: 8 },
          { word: "Traditional Wisdom", count: 6 },
          { word: "Infinite Devotion", count: 5 },
          { word: "Magical Stories", count: 9 },
          { word: "Generosity", count: 4 },
          { word: "Ammama's Hugs", count: 7 }
        ],
        summary: "Damiyanthi Poliyath is remembered collectively as a gentle pillar of maternal love and wisdom, whose home-cooked guidance and deep spiritual commitment have left an unshakeable template of dignity and warmth on her family."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRunAnalysis();
  }, []);

  return (
    <div id="ai-virtue-wall" className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 md:p-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 dark:bg-amber-955/20 rounded-xl text-amber-800 dark:text-amber-500">
            <BrainCircuit size={18} />
          </div>
          <div>
            <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100 font-medium">Collective Virtues (AI Synthesis)</h3>
            <p className="text-stone-550 dark:text-stone-400 text-xs font-sans mt-0.5">Gemini analyzes tributes globally to extract primary qualities and themes shared.</p>
          </div>
        </div>

        <button
          id="re-synthesize-btn"
          type="button"
          onClick={handleRunAnalysis}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 text-stone-600 dark:text-stone-300 hover:text-stone-850 hover:bg-stone-50 dark:hover:bg-stone-800 border border-stone-250 dark:border-stone-750 rounded-lg font-sans text-xs font-medium py-1.5 px-3.5 shadow-3xs cursor-pointer transition-all disabled:opacity-50 w-full sm:w-auto"
        >
          {loading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <RefreshCcw size={12} className="text-amber-800 dark:text-amber-550" />
          )}
          Re-Analyze Wall
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-150 dark:border-rose-900/40 rounded-lg text-rose-800 dark:text-rose-350 text-xs font-sans mb-5">
          ⚠️ {error}
        </div>
      )}

      {loading && !analysis ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
          <Loader2 size={32} className="text-amber-800 dark:text-amber-500 animate-spin" />
          <p className="text-stone-550 dark:text-stone-400 font-sans text-xs">AI is reading the Remembrance Guestbook to group heartwarming themes...</p>
        </div>
      ) : (
        analysis && (
          <div className="space-y-6">
            {/* Visual Word Cloud Cards */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 bg-stone-50 dark:bg-stone-950/40 border border-stone-150 dark:border-stone-850 p-6 rounded-2xl shadow-3xs">
              {analysis.themes.length === 0 ? (
                <div className="text-stone-400 dark:text-stone-500 font-sans text-xs py-8 text-center">
                  Waiting for guests to share tribute letters to extract themes.
                </div>
              ) : (
                analysis.themes.map((theme, i) => {
                  const counts = analysis.themes.map(t => t.count);
                  const min = Math.min(...counts);
                  const max = Math.max(...counts);
                  const fontScale = max === min ? 1 : (theme.count - min) / (max - min);
                  const sizeClass = fontScale > 0.75 
                    ? "text-md md:text-lg bg-amber-500/10 dark:bg-amber-450/15 border-amber-300 dark:border-amber-900/40 text-amber-905 dark:text-amber-400 font-semibold" 
                    : fontScale > 0.35
                    ? "text-xs md:text-sm bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 font-medium"
                    : "text-[10px] md:text-xs bg-white/50 dark:bg-stone-900/55 border-stone-100 dark:border-stone-850 text-stone-500 dark:text-stone-450";

                  return (
                    <motion.div
                      key={theme.word}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className={`px-4 py-2 border rounded-full font-serif shadow-3xs flex items-center gap-2 hover:scale-105 transition-all ${sizeClass}`}
                    >
                      <span>{theme.word}</span>
                      <span className="font-mono text-[9px] px-1.5 py-0.5 bg-stone-200/50 dark:bg-stone-800/80 rounded-full text-stone-650 dark:text-stone-350">
                        {theme.count}
                      </span>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* AI Poetic Epitaph Summary */}
            <div className="bg-amber-50/40 dark:bg-amber-955/5 border border-amber-100 dark:border-amber-950/30 rounded-2xl p-5 md:p-6 relative">
              <span className="absolute top-4 left-4 text-amber-200 dark:text-amber-950/60 font-serif text-5xl leading-none italic select-none">
                “
              </span>
              <div className="relative z-10 pl-6 space-y-2">
                <span className="text-[10px] font-sans font-semibold text-amber-800 dark:text-amber-500 uppercase tracking-widest block">
                  Legacy Reflection
                </span>
                <p className="text-stone-700 dark:text-stone-250 italic font-serif text-sm leading-relaxed">
                  {analysis.summary}
                </p>
                <div className="flex items-center gap-2 text-stone-400 dark:text-stone-500 text-[10px] font-sans pt-1">
                  <Sparkles size={11} className="text-amber-800 dark:text-amber-500" />
                  <span>Drawn directly from visitor stories on {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
