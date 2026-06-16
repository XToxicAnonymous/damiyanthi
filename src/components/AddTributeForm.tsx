/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, MessageSquare, Flame, Check, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Tribute } from "../types";

interface AddTributeFormProps {
  onTributeAdded: (newTribute: Tribute) => void;
}

export default function AddTributeForm({ onTributeAdded }: AddTributeFormProps) {
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("Grandchild");
  const [message, setMessage] = useState("");
  const [litCandle, setLitCandle] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState("");

  // AI Suggestion State
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDrafts, setAiDrafts] = useState<string[]>([]);
  const [selectedSentiment, setSelectedSentiment] = useState("peaceful and nostalgic");

  const relationOptions = [
    "Grandchild",
    "Son",
    "Daughter",
    "Relative",
    "Family Friend",
    "Neighbor",
    "Well-wisher",
    "Other"
  ];

  const sentimentOptions = [
    { label: "Peaceful & Nostalgic", value: "peaceful and nostalgic" },
    { label: "Short & Respectful", value: "short and solemn" },
    { label: "Deep & Spiritual", value: "deep and spiritually comforting" }
  ];

  const handleFetchAiSuggestions = async () => {
    setAiLoading(true);
    setAiDrafts([]);
    try {
      const response = await fetch("/api/gemini/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          relation: relation,
          sentiment: selectedSentiment
        })
      });
      if (!response.ok) throw new Error("Could not fetch drafts.");
      const data = await response.json();
      setAiDrafts(data);
    } catch (err: any) {
      console.error(err);
      setAiDrafts([
        `Dear Rahul and Family, please accept my deepest sympathies. Damiyanthi Ammama was an absolute light of unconditional love. Our thoughts are with the Poliyath family in this hard time of mourning.`,
        `Sharing your sadness inside our hearts. Celebrating a beautiful 85 years of wisdom. We will always remember Grandmother Damiyanthi during her prayer meet on June 18th.`,
        `Sending soft prayers of warmth and solemn condolences. May your treasured memories of Damiyanthi ji bring peace and grace to the whole family.`
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyDraft = (draft: string) => {
    setMessage(draft);
    setShowAISuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please put your name.");
      return;
    }
    if (!message.trim()) {
      setError("Please type a small tribute message.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/tributes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, relation, message, litCandle })
      });
      if (!res.ok) throw new Error("Server error saving tribute.");
      const data: Tribute = await res.json();
      
      onTributeAdded(data);
      setName("");
      setMessage("");
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err: any) {
      setError("Failed to register your tribute. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="add-tribute-container" className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 md:p-8 shadow-xs">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-amber-50 dark:bg-amber-955/20 rounded-xl text-amber-800 dark:text-amber-500">
          <MessageSquare size={18} />
        </div>
        <div>
          <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-50">Leave a Tribute or Message</h3>
          <p className="text-stone-550 dark:text-stone-400 text-xs font-sans mt-0.5">Share a beautiful memory, story, or message of solace.</p>
        </div>
      </div>

      {submitSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/40 rounded-xl text-emerald-800 dark:text-emerald-350 text-xs font-sans mb-6 font-semibold"
        >
          🌿 thank you. Your tribute and memorial message has been saved persistently on the memory wall.
        </motion.div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl text-rose-800 dark:text-rose-350 text-xs font-sans mb-6">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-stone-700 dark:text-stone-300 font-sans text-xs font-medium mb-1.5" htmlFor="guest-name">
              Your Name
            </label>
            <input
              id="guest-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sreedevi Poliyath"
              className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-205 dark:border-stone-800 hover:border-stone-300 focus:border-stone-400 dark:focus:border-stone-700 bg-stone-50 dark:bg-stone-950 rounded-lg px-3.5 py-2 text-stone-800 dark:text-stone-200 font-sans text-xs outline-hidden transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-stone-700 dark:text-stone-300 font-sans text-xs font-medium mb-1.5" htmlFor="guest-relation">
              Relationship to Family
            </label>
            <select
              id="guest-relation"
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-205 dark:border-stone-800 focus:border-stone-400 dark:focus:border-stone-700 focus:bg-white dark:focus:bg-stone-900 rounded-lg px-3.5 py-2 text-stone-800 dark:text-stone-200 font-sans text-xs outline-hidden transition-all cursor-pointer"
            >
              {relationOptions.map((opt) => (
                <option key={opt} value={opt} className="dark:bg-stone-900 dark:text-white">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-stone-700 dark:text-stone-300 font-sans text-xs font-medium" htmlFor="guest-message">
              Your Remembrance / Message
            </label>
            
            <button
              id="ai-helper-open-btn"
              type="button"
              onClick={() => setShowAISuggestions(true)}
              className="flex items-center gap-1.5 text-amber-900 hover:text-amber-950 dark:text-amber-500 dark:hover:text-amber-400 font-sans text-xs font-semibold py-1 px-2.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-950/45 rounded-full cursor-pointer transition-all border border-amber-200/50 dark:border-amber-900/30"
            >
              <Sparkles size={12} className="text-amber-850 dark:text-amber-500 pb-[1px]" />
              Need help with words? (AI)
            </button>
          </div>

          <textarea
            id="guest-message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your comforting message, story, or condolences to the Poliyath family here..."
            className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-205 dark:border-stone-800 focus:border-stone-400 dark:focus:border-stone-700 focus:bg-white dark:focus:bg-stone-900 rounded-lg px-3.5 py-2.5 text-stone-800 dark:text-stone-100 font-sans text-xs outline-hidden transition-all resize-none leading-relaxed"
            required
          />
        </div>

        {/* Checkbox for Light Virtual Candle */}
        <div className="flex items-center gap-3 bg-stone-50 dark:bg-stone-950/40 border border-stone-150 dark:border-stone-850 p-3.5 rounded-lg select-none">
          <label className="relative flex items-center cursor-pointer" htmlFor="lit-candle-check">
            <input
              id="lit-candle-check"
              type="checkbox"
              checked={litCandle}
              onChange={(e) => setLitCandle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-stone-200 dark:bg-stone-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
          </label>
          <div className="flex items-center gap-2">
            <Flame size={14} className={litCandle ? "text-amber-600 dark:text-amber-500 animate-pulse" : "text-stone-400 dark:text-stone-600"} />
            <div>
              <span className="text-stone-850 dark:text-stone-200 font-sans text-xs font-semibold block">
                Light a Virtual Candle
              </span>
              <span className="text-stone-400 dark:text-stone-500 text-[10px] font-sans block mt-0.5 leading-snug">
                Place an active burning flame next to your story on the Remembrance Wall.
              </span>
            </div>
          </div>
        </div>

        <button
          id="tribute-submit-btn"
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-stone-900 hover:bg-stone-950 dark:bg-amber-500 dark:hover:bg-amber-600 text-stone-100 dark:text-stone-950 font-sans text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              Saving memory...
            </>
          ) : (
            "Post Tribute on Guestbook"
          )}
        </button>
      </form>

      {/* AI Suggestion Section overlay */}
      <AnimatePresence>
        {showAISuggestions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 pointer-events-auto"
            onClick={() => setShowAISuggestions(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 max-w-xl w-full rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-amber-50/70 dark:bg-amber-955/20 px-6 py-4 flex justify-between items-center border-b border-amber-100/50 dark:border-amber-900/20">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-805 dark:text-amber-500" />
                  <h4 className="font-serif text-sm font-semibold text-amber-900 dark:text-amber-100">
                    Remembrance Reflection Assistant (AI)
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAISuggestions(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-white rounded-full transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="text-stone-550 dark:text-stone-400 font-sans text-xs leading-relaxed text-left">
                  Choosing words to express sorrow and appreciation can be difficult. Provide your relation to Grandmother Damiyanthi Poliyath and select a comforting tone to compose a customized suggestion template.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 dark:bg-stone-950/60 p-4 rounded-xl border border-stone-150 dark:border-stone-850">
                  <div>
                    <label className="block text-stone-605 dark:text-stone-400 font-sans text-[11px] font-semibold mb-1" htmlFor="ai-relation">
                      Relation Role
                    </label>
                    <select
                      id="ai-relation"
                      value={relation}
                      onChange={(e) => setRelation(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-md py-1 px-2.5 text-stone-800 dark:text-stone-200 font-sans text-xs cursor-pointer focus:outline-hidden"
                    >
                      {relationOptions.map((opt) => (
                        <option key={opt} value={opt} className="dark:bg-stone-900 dark:text-white">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-605 dark:text-stone-400 font-sans text-[11px] font-semibold mb-1" htmlFor="ai-sentiment">
                      Draft Tone
                    </label>
                    <select
                      id="ai-sentiment"
                      value={selectedSentiment}
                      onChange={(e) => setSelectedSentiment(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-md py-1 px-2.5 text-stone-800 dark:text-stone-200 font-sans text-xs cursor-pointer focus:outline-hidden"
                    >
                      {sentimentOptions.map((opt) => (
                        <option key={opt.value} value={opt.value} className="dark:bg-stone-900 dark:text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Drafts Generator Trigger */}
                <button
                  type="button"
                  onClick={handleFetchAiSuggestions}
                  disabled={aiLoading}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-amber-900/10 dark:bg-amber-500/10 hover:bg-amber-900/15 dark:hover:bg-amber-500/15 text-amber-955 dark:text-amber-400 font-sans text-xs font-bold rounded-lg transition-all cursor-pointer border border-amber-900/20 dark:border-amber-900/30"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      Weaving comfort suggestions...
                    </>
                  ) : (
                    "Compose Custom Drafts"
                  )}
                </button>

                {/* Suggestions List Container */}
                <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1">
                  {aiDrafts.length > 0 ? (
                    aiDrafts.map((draft, i) => (
                      <div
                        key={i}
                        onClick={() => handleApplyDraft(draft)}
                        className="p-3 bg-stone-50 dark:bg-stone-950/40 hover:bg-amber-50/40 dark:hover:bg-amber-950/10 border border-stone-200 dark:border-stone-800 hover:border-amber-200/50 dark:hover:border-amber-900/30 rounded-lg text-stone-850 dark:text-stone-200 font-sans text-xs leading-relaxed text-left cursor-pointer transition-all flex justify-between items-start gap-4 active:scale-[0.99] group"
                      >
                        <p className="flex-1">{draft}</p>
                        <span className="text-[10px] text-amber-805 dark:text-amber-500 font-bold uppercase tracking-wider block bg-amber-50/80 dark:bg-amber-955/20 border border-amber-100 dark:border-amber-900 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Apply
                        </span>
                      </div>
                    ))
                  ) : (
                    !aiLoading && (
                      <div className="text-center text-stone-400 dark:text-stone-500 font-sans text-xs py-8 border border-dashed border-stone-200 dark:border-stone-800 rounded-lg bg-stone-55/30">
                        Select details above and click 'Compose Custom Drafts'.
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="bg-stone-50 dark:bg-stone-950 border-t border-stone-150 dark:border-stone-850 px-6 py-3 text-right">
                <button
                  type="button"
                  onClick={() => setShowAISuggestions(false)}
                  className="px-4 py-1.5 bg-stone-200 dark:bg-stone-850 text-stone-700 dark:text-stone-300 rounded-md font-sans text-xs hover:bg-stone-300 select-none cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
