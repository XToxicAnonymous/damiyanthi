/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UploadCloud, Camera, X, Loader2, Maximize2, User, Trash2, Edit2, Check, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Photo } from "../types";

interface PhotoGalleryProps {
  photos: Photo[];
  onPhotoUploaded: (newPhoto: Photo) => void;
  isAdmin: boolean;
  onEditPhoto: (id: string, caption: string, uploadedBy: string) => Promise<void>;
  onDeletePhoto: (id: string) => Promise<void>;
}

export default function PhotoGallery({ photos, onPhotoUploaded, isAdmin, onEditPhoto, onDeletePhoto }: PhotoGalleryProps) {
  const [dragActive, setDragActive] = useState(false);
  const [caption, setCaption] = useState("");
  const [author, setAuthor] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  
  // Lightbox State
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // Admin inline editing states
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [editUploadedBy, setEditUploadedBy] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Admin local deletion confirm state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const startEditing = (p: Photo, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPhotoId(p.id);
    setEditCaption(p.caption || "");
    setEditUploadedBy(p.uploadedBy || "");
  };

  const handleEditSave = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaving(true);
    try {
      await onEditPhoto(id, editCaption, editUploadedBy);
      setEditingPhotoId(null);
    } catch {
      alert("Could not update photo metadata.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please drop or choose a valid image file.");
      return;
    }
    
    if (file.size > 4.5 * 1024 * 1024) {
      setError("Image resolution/size is too large. Choose a file under 4.5MB.");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;

          const response = await fetch("/api/photos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              base64: base64String,
              caption: caption || `Shared memory from ${author || "Poliyath Family"}`,
              uploadedBy: author || "Family"
            })
          });

          if (!response.ok) throw new Error("Server failed saving picture.");
          const data: Photo = await response.json();

          onPhotoUploaded(data);
          setCaption("");
          setAuthor("");
        } catch (err) {
          setError("Encountered filesystem issues uploading image. Retry.");
        } finally {
          setIsUploading(false);
        }
      };
      reader.onerror = () => {
        setError("Error reading the image file.");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Encountered filesystem issues uploading image. Retry.");
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div id="photo-gallery-container" className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 md:p-8 shadow-xs">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-amber-50 dark:bg-amber-950/20 rounded-xl text-amber-800 dark:text-amber-500">
          <Camera size={18} />
        </div>
        <div>
          <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100">Shared Memories Photo Gallery</h3>
          <p className="text-stone-550 dark:text-stone-400 text-xs font-sans mt-0.5">Contribute beautiful photos of Grandmother from various eras of her life.</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-sans mb-5">
          ⚠️ {error}
        </div>
      )}

      {/* Upload area expanded form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 relative">
          <div
            id="drag-file-uploader"
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`h-full min-h-[160px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
              dragActive ? "border-amber-700 bg-amber-50/20" : "border-stone-300 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600 bg-stone-50 dark:bg-stone-950/20"
            }`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 size={24} className="text-amber-800 animate-spin" />
                <span className="text-stone-700 dark:text-stone-300 font-sans text-xs">Encoding and saving image securely...</span>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-2 w-full h-full cursor-pointer justify-center" htmlFor="gallery-file-input">
                <UploadCloud size={28} className="text-stone-400 dark:text-stone-600" />
                <span className="text-stone-800 dark:text-stone-200 font-sans text-xs font-medium block">
                  Drag and drop a photo here, or <span className="text-amber-800 dark:text-amber-500 underline">browse</span>
                </span>
                <span className="text-stone-400 text-[10px] font-sans block mt-1">
                  Supports JPG, PNG up to 4.5MB
                </span>
                <input
                  id="gallery-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Caption form */}
        <div className="bg-stone-50 dark:bg-stone-950/20 border border-stone-200 dark:border-stone-800 rounded-xl p-4 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <h4 className="text-stone-800 dark:text-stone-200 font-serif text-xs font-medium pb-2 border-b border-stone-200 dark:border-stone-850 flex items-center gap-1">
              <User size={12} className="text-stone-500" /> Photo Metadata (Optional)
            </h4>
            
            <div>
              <label className="text-stone-500 font-sans text-[10px] block mb-1">Your Name</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Sreedevi Auntie"
                className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg py-1 px-2.5 text-stone-700 dark:text-stone-200 font-sans text-xs outline-hidden"
              />
            </div>
            
            <div>
              <label className="text-stone-500 font-sans text-[10px] block mb-1">Short Caption/Description</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g. Cooking delicious Payasam"
                className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg py-1 px-2.5 text-stone-700 dark:text-stone-200 font-sans text-xs outline-hidden"
              />
            </div>
          </div>

          <p className="text-[9.5px] text-stone-400 dark:text-stone-500 font-serif leading-tight">
            * Complete fields, then drag/select your image to automatically bind metadata.
          </p>
        </div>
      </div>

      {/* Masonry Columns gallery */}
      <div id="gallery-masonry" className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {photos.map((photo) => {
          const isEditing = editingPhotoId === photo.id;

          return (
            <div
              key={photo.id}
              onClick={() => !isEditing && setSelectedPhoto(photo)}
              className="break-inside-avoid relative overflow-hidden bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl cursor-pointer group hover:shadow-md transition-all duration-250 hover:scale-[1.01]"
            >
              <img
                src={photo.url}
                alt={photo.caption || "Damiyanthi Memorial Memory"}
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover max-h-[350px]"
              />

              {/* Inline Metadata Editing Form over image when editing */}
              {isEditing ? (
                <div
                  className="absolute inset-0 bg-stone-950/95 p-4 flex flex-col justify-between z-10 font-sans text-xs cursor-default"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="space-y-3">
                    <span className="text-amber-500 text-[10px] font-bold uppercase tracking-widest block flex items-center gap-1">
                      <ShieldAlert size={12} /> Editing Photo Details
                    </span>

                    <div>
                      <label className="text-stone-400 text-[9px] block mb-0.5">Caption</label>
                      <input
                        type="text"
                        value={editCaption}
                        onChange={(e) => setEditCaption(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-800 rounded-md py-1 px-2 text-white text-xs outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-stone-400 text-[9px] block mb-0.5">Contributor</label>
                      <input
                        type="text"
                        value={editUploadedBy}
                        onChange={(e) => setEditUploadedBy(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-800 rounded-md py-1 px-2 text-white text-xs outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-1.5 pt-2 border-t border-stone-800">
                    <button
                      type="button"
                      onClick={() => setEditingPhotoId(null)}
                      className="px-2.5 py-1 bg-stone-800 text-stone-300 rounded-md text-[10px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleEditSave(photo.id, e)}
                      disabled={isSaving}
                      className="px-3 py-1 bg-amber-500 text-stone-950 font-semibold rounded-md text-[10px] flex items-center gap-0.5"
                    >
                      <Check size={10} />
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Overlay description on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/45 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-4 flex flex-col justify-end">
                    <p className="text-white font-sans text-xs font-semibold leading-snug">
                      {photo.caption}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-stone-300 font-sans mt-2">
                      <span>By: {photo.uploadedBy || "Family"}</span>
                      <span className="p-1 bg-white/10 rounded-full">
                        <Maximize2 size={10} />
                      </span>
                    </div>
                  </div>

                  {/* Inline Admin Action badges */}
                  {isAdmin && (
                    <div
                      className="absolute top-2 left-2 right-2 flex items-center justify-between z-10 bg-black/60 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-white/5 opacity-80 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-[9px] font-bold text-amber-500 font-mono">🛡️ PHOTO</span>
                      
                      <div className="flex items-center gap-1.5">
                        {confirmDeleteId === photo.id ? (
                          <div className="flex items-center bg-rose-950 border border-rose-800 px-1.5 py-0.5 rounded-sm gap-1">
                            <span className="text-[8px] text-rose-300 font-bold">Delete?</span>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                await onDeletePhoto(photo.id);
                                setConfirmDeleteId(null);
                              }}
                              className="text-[7.5px] bg-rose-700 text-white px-1.5 py-0.2 rounded-xs"
                            >
                              Yes
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                              className="text-[7.5px] text-stone-400"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={(e) => startEditing(photo, e)}
                              className="p-1 bg-stone-800/80 hover:bg-stone-700 rounded-sm text-stone-200 hover:text-white"
                              title="Edit Caption / Contributor"
                            >
                              <Edit2 size={10} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(photo.id); }}
                              className="p-1 bg-rose-900/80 hover:bg-rose-800 rounded-sm text-rose-200 hover:text-white"
                              title="Delete Photo"
                            >
                              <Trash2 size={10} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal overlay */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 z-50 overflow-hidden"
            onClick={() => setSelectedPhoto(null)}
          >
            {/* Escape close button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-5 right-5 p-2.5 bg-stone-900 text-stone-100 border border-stone-800 rounded-full hover:bg-stone-850 cursor-pointer transition-all"
            >
              <X size={20} />
            </button>

            {/* Container for image */}
            <div
              className="max-w-4xl max-h-[75vh] relative select-none cursor-default mb-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption || "Damiyanthi Poliyath"}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[72vh] h-auto object-contain rounded-lg border-2 border-stone-850"
              />
            </div>

            {/* Captions */}
            <div className="max-w-xl text-center font-sans space-y-1" onClick={(e) => e.stopPropagation()}>
              <h5 className="text-stone-100 text-sm font-semibold">{selectedPhoto.caption}</h5>
              <p className="text-stone-400 text-xs">Contributed with love by: {selectedPhoto.uploadedBy || "Poliyath Family"}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
