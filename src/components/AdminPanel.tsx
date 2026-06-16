/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, Save, Edit3, Heart, LogOut, Check, Sparkles, User, Camera, UploadCloud } from "lucide-react";
import { motion } from "motion/react";

interface AdminConfig {
  subtitle: string;
  quote: string;
  dressAdvisoryTitle: string;
  dressAdvisoryText: string;
  dressAdvisoryNotes: string;
  portraitUrl?: string;
}

interface AdminPanelProps {
  config: AdminConfig;
  onUpdateConfig: (newConfig: AdminConfig) => Promise<void>;
  onClose: () => void;
  onLogOut: () => void;
}

export default function AdminPanel({ config, onUpdateConfig, onClose, onLogOut }: AdminPanelProps) {
  const [subtitle, setSubtitle] = useState(config.subtitle || "In Loving Remembrance of");
  const [quote, setQuote] = useState(config.quote || "");
  const [dressAdvisoryTitle, setDressAdvisoryTitle] = useState(config.dressAdvisoryTitle || "");
  const [dressAdvisoryText, setDressAdvisoryText] = useState(config.dressAdvisoryText || "");
  const [dressAdvisoryNotes, setDressAdvisoryNotes] = useState(config.dressAdvisoryNotes || "");
  const [portraitUrl, setPortraitUrl] = useState(config.portraitUrl || "");
  const [uploadError, setUploadError] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handlePortraitUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose a valid image file.");
      return;
    }

    if (file.size > 4.5 * 1024 * 1024) {
      setUploadError("Image file must be less than 4.5MB.");
      return;
    }

    setUploadError("");
    const reader = new FileReader();
    reader.onloadend = () => {
      setPortraitUrl(reader.result as string);
    };
    reader.onerror = () => {
      setUploadError("Could not read image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage("");
    try {
      await onUpdateConfig({
        subtitle,
        quote,
        dressAdvisoryTitle,
        dressAdvisoryText,
        dressAdvisoryNotes,
        portraitUrl
      });
      setStatusMessage("✅ Website configuration saved successfully.");
      setTimeout(() => setStatusMessage(""), 3500);
    } catch {
      setStatusMessage("❌ Failed to save website changes. Resetting.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-stone-900 border border-stone-800 text-stone-100 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="bg-stone-950 border-b border-stone-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500 animate-pulse">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="font-serif text-sm font-semibold tracking-tight text-white">
                Website Editor & Admin Control
              </h3>
              <p className="text-[10px] font-sans text-stone-400">
                Update headlines, quotes, and ceremony notes in real-time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-850 transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {statusMessage && (
            <div className={`p-3 rounded-lg font-sans text-xs font-medium ${
              statusMessage.startsWith("❌") ? "bg-rose-950 text-rose-200 border border-rose-900" : "bg-emerald-950 text-emerald-200 border border-emerald-900"
            }`}>
              {statusMessage}
            </div>
          )}

          <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
            {/* Grandmothers Portrait Photo Field */}
            <div className="bg-stone-950/40 p-4 border border-stone-800 rounded-xl space-y-3">
              <label className="block text-stone-300 font-sans text-xs font-semibold">
                Grandmother's Portrait Photo
              </label>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border border-stone-800 bg-stone-950 flex items-center justify-center flex-shrink-0 group">
                  {portraitUrl ? (
                    <>
                      <img src={portraitUrl} alt="Portrait Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button
                        type="button"
                        onClick={() => setPortraitUrl("")}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-450 hover:text-rose-400 font-sans text-[10px] uppercase font-bold transition-opacity duration-200 cursor-pointer"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-stone-550">
                      <User size={24} className="stroke-[1.5]" />
                      <span className="text-[8px] mt-1 text-center font-sans">No Photo</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 w-full space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={portraitUrl}
                      onChange={(e) => setPortraitUrl(e.target.value)}
                      placeholder="Paste portrait image URL..."
                      className="flex-1 bg-stone-950 border border-stone-800 rounded-lg py-1.5 px-3 text-white font-sans text-xs outline-hidden focus:border-amber-600 transition-colors"
                    />
                    <label className="relative flex items-center justify-center px-3 py-1.5 bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 hover:border-stone-600 rounded-lg font-sans text-xs font-semibold cursor-pointer transition-colors active:scale-95 whitespace-nowrap">
                      <span>Upload File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePortraitUpload}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  {uploadError && (
                    <p className="text-[10px] font-sans text-rose-400 font-medium">⚠️ {uploadError}</p>
                  )}
                  <p className="text-[9px] font-sans text-stone-500 leading-normal">
                    Provide any direct web link (e.g., from Unsplash, Imgur) or upload a photo file from your device. Recommended square crop.
                  </p>
                </div>
              </div>
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-stone-400 font-sans text-[11px] font-medium mb-1.5">
                Greeting Header Subtitle
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="In Loving Remembrance of"
                className="w-full bg-stone-950 border border-stone-800 rounded-lg py-2 px-3 text-white font-sans text-xs outline-hidden focus:border-amber-600 transition-colors"
                required
              />
            </div>

            {/* Dedication Quote */}
            <div>
              <label className="block text-stone-400 font-sans text-[11px] font-medium mb-1.5">
                Remembrance Dedication Quote
              </label>
              <textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                rows={3}
                placeholder="A life so beautifully lived..."
                className="w-full bg-stone-950 border border-stone-800 rounded-lg py-2 px-3 text-white font-sans text-xs outline-hidden focus:border-amber-600 transition-colors"
                required
              />
            </div>

            <div className="border-t border-stone-800/80 pt-4 space-y-4">
              <h4 className="text-[11px] font-sans font-bold text-amber-500 uppercase tracking-widest">
                Ceremony Dress Advisory Section
              </h4>
              
              {/* Dress title */}
              <div>
                <label className="block text-stone-400 font-sans text-[11px] font-medium mb-1.5">
                  Advisory Section Title
                </label>
                <input
                  type="text"
                  value={dressAdvisoryTitle}
                  onChange={(e) => setDressAdvisoryTitle(e.target.value)}
                  placeholder="Tradition & Dress Advisory"
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg py-2 px-3 text-white font-sans text-xs outline-hidden focus:border-amber-600 transition-colors"
                  required
                />
              </div>

              {/* Advisory details */}
              <div>
                <label className="block text-stone-400 font-sans text-[11px] font-medium mb-1.5">
                  Main Custom Advisory Text
                </label>
                <textarea
                  value={dressAdvisoryText}
                  onChange={(e) => setDressAdvisoryText(e.target.value)}
                  rows={3}
                  placeholder="Details of recommended rules/attires..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg py-2 px-3 text-white font-sans text-xs outline-hidden focus:border-amber-600 transition-colors"
                  required
                />
              </div>

              {/* Advisory notes */}
              <div>
                <label className="block text-stone-400 font-sans text-[11px] font-medium mb-1.5">
                  Secondary Sub-Advisory Notes
                </label>
                <textarea
                  value={dressAdvisoryNotes}
                  onChange={(e) => setDressAdvisoryNotes(e.target.value)}
                  rows={2.5}
                  placeholder="Notes for people joining from overseas etc..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg py-2 px-3 text-white font-sans text-xs outline-hidden focus:border-amber-600 transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="border-t border-stone-800 pt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onLogOut}
              className="px-3.5 py-1.8 bg-rose-950/40 hover:bg-rose-950 border border-rose-900 rounded-lg text-rose-200 font-sans text-xs flex items-center gap-1.5 transition-all outline-hidden active:scale-[0.98] cursor-pointer"
            >
              <LogOut size={13} />
              Logout Session
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.8 bg-stone-800 hover:bg-stone-750 text-stone-300 rounded-lg font-sans text-xs transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-1.8 bg-amber-500 hover:bg-amber-600 text-stone-950 font-sans text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all outline-hidden active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                <Save size={13} />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
