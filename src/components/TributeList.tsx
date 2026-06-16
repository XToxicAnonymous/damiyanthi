/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Flame, Calendar, Trash2, Edit2, Check, X, ShieldAlert, Heart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Tribute } from "../types";

interface TributeListProps {
  tributes: Tribute[];
  isAdmin: boolean;
  onEditTribute: (id: string, updated: Partial<Tribute>) => Promise<void>;
  onDeleteTribute: (id: string) => Promise<void>;
}

export default function TributeList({ tributes, isAdmin, onEditTribute, onDeleteTribute }: TributeListProps) {
  const candleCount = tributes.filter((t) => t.litCandle).length;

  // Inline Editing States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editRelation, setEditRelation] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editLitCandle, setEditLitCandle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Custom inline deletion confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  const startEditing = (t: Tribute) => {
    setEditingId(t.id);
    setEditName(t.name);
    setEditRelation(t.relation);
    setEditMessage(t.message);
    setEditLitCandle(!!t.litCandle);
  };

  const saveEdit = async (id: string) => {
    setIsSaving(true);
    try {
      await onEditTribute(id, {
        name: editName,
        relation: editRelation,
        message: editMessage,
        litCandle: editLitCandle
      });
      setEditingId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Interactive Global Candle Memorial Widget */}
      <div id="candle-memorial-widget" className="bg-stone-900 border border-stone-800 text-stone-100 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
        {/* Subtle gold grid overlay */}
        <div className="absolute inset-0 opacity-15 bg-radial-at-t from-amber-500/25 to-transparent" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-2">
            <span className="text-amber-400 font-mono text-[10px] uppercase tracking-[0.2em] block">
              Virtual Flame Ceremony
            </span>
            <h3 className="font-serif text-xl md:text-2xl text-stone-100 tracking-tight leading-tight">
              Shared Light of Remembrance
            </h3>
            <p className="text-stone-400 text-xs font-sans max-w-sm leading-relaxed">
              Family members and visitors have lit virtual flames to guide and honor her 85-year journey. Every flame sent represents a story of warm gratitude.
            </p>

            <div className="inline-flex mt-4 text-xs font-sans text-stone-200 bg-stone-950/80 border border-stone-800 px-3.5 py-1.5 rounded-full select-none">
              🕯️ Total Candles Burning:{" "}
              <strong className="text-amber-400 font-mono text-sm pl-1.5">{candleCount}</strong>
            </div>
          </div>

          {/* New Hyper-realistic Animated SVG Candle */}
          <div className="relative w-36 h-44 flex flex-col items-center justify-end select-none pt-4 pb-1">
            {/* Ambient Candle fire glows */}
            <div className="absolute top-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl animate-pulse" />
            <div className="absolute top-12 w-16 h-16 bg-yellow-400/15 rounded-full blur-xl" />

            {/* Candle Body */}
            <div className="w-11 h-20 bg-gradient-to-r from-stone-100 via-stone-50 to-stone-200 rounded-t-lg rounded-b-md shadow-lg relative border-t border-stone-200/30">
              {/* Internal cylinder shadows for 3D depth */}
              <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-white/35 to-transparent rounded-l-lg" />
              <div className="absolute inset-y-0 right-0 w-2.5 bg-gradient-to-l from-black/15 to-transparent rounded-r-md" />

              {/* Realistic multi-length wax drips */}
              <div className="absolute -top-[1px] left-3.5 w-[7px] h-10 bg-stone-100 rounded-b-full shadow-xs filter drop-shadow-[0.5px_1px_1px_rgba(0,0,0,0.06)]">
                <div className="absolute bottom-0 left-0 w-[5px] h-2.5 bg-stone-100 rounded-full" />
              </div>
              <div className="absolute top-2 right-2 w-[5px] h-5 bg-stone-100 rounded-b-full shadow-2xs" />
              <div className="absolute top-1 left-7 w-[4px] h-3 bg-stone-200 rounded-b-full" />

              {/* Wick */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0.5 h-3.5 bg-stone-900">
                {/* Glowing embers */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-rose-600 rounded-full blur-[0.5px] opacity-80" />
              </div>

              {/* Realistic layered flame with physics-aligned wave scaling */}
              <motion.div
                animate={{
                  scaleX: [1, 1.05, 0.95, 1.03, 0.97, 1],
                  scaleY: [1, 1.10, 0.95, 1.05, 0.98, 1],
                  skewX: [0, -2, 2, -1, 1, 0],
                  y: [0, -0.5, 0.5, -0.2, 0.2, 0],
                  opacity: [0.94, 1, 0.92, 0.98, 0.94, 1]
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ willChange: "transform, opacity", transform: "translate3d(0, 0, 0)" }}
                className="absolute -top-[48px] left-1/2 -translate-x-1/2 origin-bottom flex flex-col items-center cursor-pointer z-20"
              >
                <svg viewBox="0 0 100 150" className="w-12 h-18 filter drop-shadow-[0_-2px_10px_rgba(251,191,36,0.6)]" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <filter id="glowBlur" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="5" />
                    </filter>
                    <filter id="flickerBlur" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="1.5" />
                    </filter>
                    <radialGradient id="outerGlow" cx="50%" cy="80%" r="50%">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="mainFlame" x1="50%" y1="0%" x2="50%" y2="100%">
                      <stop offset="0%" stopColor="#fffbeb" />
                      <stop offset="25%" stopColor="#fde047" />
                      <stop offset="60%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#ea580c" />
                    </linearGradient>
                    <linearGradient id="innerFlame" x1="50%" y1="0%" x2="50%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="70%" stopColor="#fef08a" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                    </linearGradient>
                    <radialGradient id="blueBase" cx="50%" cy="100%" r="50%">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.95" />
                      <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* 1. Outer Soft Glow Aura */}
                  <path d="M50 10 C20 75 22 115 50 125 C78 115 80 75 50 10 Z" fill="url(#outerGlow)" filter="url(#glowBlur)" />

                  {/* 2. Main Flame Body */}
                  <path d="M50 20 C28 70 30 110 50 120 C70 110 72 70 50 20 Z" fill="url(#mainFlame)" filter="url(#flickerBlur)" />

                  {/* 3. Inner Bright yellow core */}
                  <path d="M50 45 C38 78 38 105 50 112 C62 105 62 78 50 45 Z" fill="url(#innerFlame)" />

                  {/* 4. Center hotspot highlight */}
                  <path d="M50 68 C44 85 44 100 50 105 C56 100 56 85 50 68 Z" fill="#ffffff" opacity="0.9" />

                  {/* 5. Deep Blue Root Base */}
                  <path d="M50 102 C35 115 38 126 50 126 C62 126 65 115 50 102 Z" fill="url(#blueBase)" />
                </svg>
              </motion.div>
            </div>
            
            {/* Cast base plate with gold glow reflection */}
            <div className="w-20 h-2 bg-gradient-to-r from-stone-700 via-stone-500 to-stone-800 rounded-t-md rounded-b-full shadow-md relative">
              <div className="absolute top-[1px] left-1/2 -translate-x-1/2 w-12 h-[1px] bg-white/20 rounded-full" />
              <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-xs animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Tribute Guestbook Cards List */}
      <div id="tributes-list-container" className="space-y-4">
        <h4 className="font-serif text-sm font-medium text-stone-800 dark:text-stone-200 flex items-center gap-2 mb-2">
          <span>Remembrance Wall</span>
          <span className="text-xs text-stone-400 font-sans tracking-normal font-normal">
            ({tributes.length} entries)
          </span>
        </h4>

        {tributes.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl bg-stone-50/50 dark:bg-stone-900/10">
            <span className="text-stone-400 font-sans text-xs">No memories shared yet. Be the first to write a message.</span>
          </div>
        ) : (
          tributes.map((tribute, idx) => {
            const isEditing = editingId === tribute.id;

            return (
              <motion.div
                key={tribute.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white dark:bg-stone-900 hover:bg-stone-50/50 dark:hover:bg-stone-850/40 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 transition-all shadow-xs relative"
              >
                {/* Lit candle flame overlay indicator */}
                {tribute.litCandle && !isEditing && (
                  <div className="absolute top-5 right-5 flex items-center gap-1 text-amber-600 dark:text-amber-500 font-sans text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 px-2.5 py-1 rounded-full">
                    <Flame size={12} className="fill-amber-600 animate-pulse" />
                    Lit a Candle
                  </div>
                )}

                {/* Inline Editing Form */}
                {isEditing ? (
                  <div className="space-y-4 font-sans text-left">
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 mb-2 flex items-center gap-2 text-[11px] text-amber-600 font-medium">
                      <ShieldAlert size={14} /> Editing tribute message securely
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-stone-500 text-[10px] mb-1">Author Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg py-1.5 px-3 text-stone-800 dark:text-stone-250 text-xs outline-hidden focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-500 text-[10px] mb-1">Relation</label>
                        <input
                          type="text"
                          value={editRelation}
                          onChange={(e) => setEditRelation(e.target.value)}
                          className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg py-1.5 px-3 text-stone-800 dark:text-stone-250 text-xs outline-hidden focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-stone-500 text-[10px] mb-1">Remembrance Text Message</label>
                      <textarea
                        value={editMessage}
                        onChange={(e) => setEditMessage(e.target.value)}
                        rows={3}
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg py-1.5 px-3 text-stone-800 dark:text-stone-250 text-xs outline-hidden focus:border-amber-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`edit-candle-${tribute.id}`}
                        checked={editLitCandle}
                        onChange={(e) => setEditLitCandle(e.target.checked)}
                        className="rounded-sm border-stone-300 accent-amber-600"
                      />
                      <label htmlFor={`edit-candle-${tribute.id}`} className="text-stone-600 dark:text-stone-400 text-xs font-semibold cursor-pointer select-none">
                        Include lit tribute candle with message
                      </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-850">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-3.5 py-1.5 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-lg text-[11px] font-sans hover:bg-stone-300 transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEdit(tribute.id)}
                        disabled={isSaving}
                        className="px-4 py-1.5 bg-amber-500 text-stone-950 font-semibold rounded-lg text-[11px] font-sans hover:bg-amber-600 flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Check size={12} />
                        {isSaving ? "Saving..." : "Save Details"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Plain Card Display Mode */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center font-serif text-stone-700 dark:text-stone-300 text-xs font-semibold border border-stone-200/50 dark:border-stone-700/50">
                        {tribute.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-stone-900 dark:text-stone-100 font-sans text-xs font-semibold">{tribute.name}</span>
                          <span className="text-stone-500 dark:text-stone-400 font-sans text-[9px] font-medium bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded-sm">
                            {tribute.relation}
                          </span>
                        </div>
                        <span className="text-stone-400 text-[10px] font-sans flex items-center gap-1 mt-0.5">
                          <Calendar size={10} />
                          {formatDate(tribute.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="text-stone-600 dark:text-stone-300 font-sans text-xs leading-relaxed pl-1 whitespace-pre-wrap italic">
                      "{tribute.message}"
                    </div>

                    {/* Inline Admin Panel Operations (Delete/Edit) */}
                    {isAdmin && (
                      <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
                        <span className="text-[9px] font-mono font-medium text-amber-600 flex items-center gap-1">
                          🛡️ Admin Controls
                        </span>

                        <div className="flex items-center gap-2">
                          {confirmDeleteId === tribute.id ? (
                            <div className="flex items-center bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 px-2 py-1 rounded-lg gap-2">
                              <span className="text-[10px] text-rose-700 dark:text-rose-450 font-bold font-sans">Delete tribute?</span>
                              <button
                                onClick={async () => {
                                  await onDeleteTribute(tribute.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="text-[9px] cursor-pointer bg-rose-750 hover:bg-rose-800 text-white px-2 py-0.5 rounded-sm font-semibold"
                              >
                                Yes, Delete
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="text-[9px] cursor-pointer text-stone-500 hover:text-stone-700 font-medium"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditing(tribute)}
                                className="flex items-center gap-1 text-[10px] font-sans font-medium text-stone-600 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-500 bg-stone-100 dark:bg-stone-800/60 hover:bg-stone-200 px-2.5 py-1 rounded-lg transition-all"
                              >
                                <Edit2 size={10} />
                                Edit
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(tribute.id)}
                                className="flex items-center gap-1 text-[10px] font-sans font-bold text-rose-700 dark:text-rose-400 hover:text-white hover:bg-rose-700 bg-stone-100 dark:bg-stone-800/60 px-2.5 py-1 rounded-lg transition-all"
                              >
                                <Trash2 size={10} />
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
