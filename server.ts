/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize GoogleGenAI client lazy-loaded to prevent crashing if the key is missing initially
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI features will fallback to client mock responses.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

app.use(express.json({ limit: "50mb" })); // Support large base64 photo uploads

// Ensure directory and db.json exist (supporting Vercel writable /tmp directory)
const isVercel = !!process.env.VERCEL;
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "src", "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

const initialDb = {
  tributes: [
    {
      id: "tribute-1",
      name: "Rahul Poliyath",
      relation: "Grandson",
      message: "Ammama, your beautiful smile, infinite warmth, and stories will live with us forever. We miss you so much.",
      litCandle: true,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
    },
    {
      id: "tribute-2",
      name: "Sreedevi Poliyath",
      relation: "Daughter",
      message: "You were not just a mother, but the guiding anchor of our lives. Your love is our strength. Rest in peace, Amma.",
      litCandle: true,
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString() // 12 hours ago
    },
    {
      id: "tribute-3",
      name: "Venugopal K.",
      relation: "Family Friend",
      message: "Deeply saddened to hear about Damiyanthi ji's passing. She was an extraordinarily gentle and pious soul. My prayers and condolences to the Poliyath family.",
      litCandle: false,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
    }
  ],
  photos: [
    {
      id: "photo-default-1",
      // High resolution candle image
      url: "https://images.unsplash.com/photo-1541364983171-a8ba01d95cfc?auto=format&fit=crop&q=80&w=800",
      caption: "In loving remembrance of our guide and light.",
      uploadedBy: "Family",
      createdAt: new Date("2026-06-15T12:00:00Z").toISOString()
    },
    {
      id: "photo-default-2",
      // Peace lilies / floral image
      url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800",
      caption: "Floral tributes of peace and purity.",
      uploadedBy: "Rahul",
      createdAt: new Date("2026-06-15T14:30:00Z").toISOString()
    }
  ]
};

function readDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf-8");
    return initialDb;
  }
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file, returning default", err);
    return initialDb;
  }
}

function writeDb(data: typeof initialDb) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write to database file, proceeding with runtime state:", err);
  }
}

/* ==========================================================================
   API Routes
   ========================================================================== */

// 1. Tributes list
app.get("/api/tributes", (req, res) => {
  const db = readDb();
  res.json(db.tributes);
});

app.post("/api/tributes", (req, res) => {
  const { name, relation, message, litCandle } = req.body;
  if (!name || !message) {
    return res.status(400).json({ error: "Name and message are required." });
  }

  const db = readDb();
  const newTribute = {
    id: `tribute-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    name: name.substring(0, 100),
    relation: (relation || "Friend").substring(0, 50),
    message: message.substring(0, 2000),
    litCandle: !!litCandle,
    createdAt: new Date().toISOString()
  };

  db.tributes.unshift(newTribute);
  writeDb(db);
  res.status(201).json(newTribute);
});

// 2. Photos gallery
app.get("/api/photos", (req, res) => {
  const db = readDb();
  res.json(db.photos);
});

app.post("/api/photos", (req, res) => {
  const { url, base64, caption, uploadedBy } = req.body;
  if (!url && !base64) {
    return res.status(400).json({ error: "Photo data is required." });
  }

  const db = readDb();
  const id = `photo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  const finalUrl = url || base64; // Storing base64 straight in the JSON database triggers instant persistence without folder permissions

  const newPhoto = {
    id,
    url: finalUrl,
    caption: (caption || "").substring(0, 200),
    uploadedBy: (uploadedBy || "Anonymous").substring(0, 100),
    createdAt: new Date().toISOString()
  };

  db.photos.unshift(newPhoto);
  writeDb(db);
  res.status(201).json(newPhoto);
});

// 3b. Website Configuration and Editable Texts
app.get("/api/config", (req, res) => {
  const db = readDb() as any;
  if (!db.config) {
    db.config = {
      subtitle: "In Loving Remembrance of",
      quote: "A life so beautifully lived, a heart so deeply loved. Her peaceful light guides us forever.",
      dressAdvisoryTitle: "Tradition & Dress Advisory",
      dressAdvisoryText: "To honor Ammama's deeply traditional life, we request attendees of the prayer meet to kindly wear standard formal whites or light pastel attire, expressing purity and peace.",
      dressAdvisoryNotes: "For family and friends living overseas or unable to attend in person at Kamothe, a tribute or virtual candle placed on the guestbook will be compiled and printed into our permanent commemorative books.",
      portraitUrl: ""
    };
    writeDb(db);
  }
  res.json(db.config);
});

app.put("/api/config", (req, res) => {
  const db = readDb() as any;
  if (!db.config) {
    db.config = {};
  }
  db.config = { ...db.config, ...req.body };
  writeDb(db);
  res.json(db.config);
});

// 3c. PUT and DELETE for Tributes (Admin)
app.put("/api/tributes/:id", (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const { name, relation, message, litCandle } = req.body;
  const idx = db.tributes.findIndex((t: any) => t.id === id);
  if (idx !== -1) {
    db.tributes[idx] = {
      ...db.tributes[idx],
      name: name || db.tributes[idx].name,
      relation: relation || db.tributes[idx].relation,
      message: message || db.tributes[idx].message,
      litCandle: litCandle !== undefined ? litCandle : db.tributes[idx].litCandle
    };
    writeDb(db);
    return res.json(db.tributes[idx]);
  }
  res.status(404).json({ error: "Tribute not found" });
});

app.delete("/api/tributes/:id", (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const lengthBefore = db.tributes.length;
  db.tributes = db.tributes.filter((t: any) => t.id !== id);
  if (db.tributes.length < lengthBefore) {
    writeDb(db);
    return res.json({ success: true });
  }
  res.status(404).json({ error: "Tribute not found" });
});

// 3d. PUT and DELETE for Photos (Admin)
app.put("/api/photos/:id", (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const { caption, uploadedBy } = req.body;
  const idx = db.photos.findIndex((p: any) => p.id === id);
  if (idx !== -1) {
    db.photos[idx] = {
      ...db.photos[idx],
      caption: caption || db.photos[idx].caption,
      uploadedBy: uploadedBy || db.photos[idx].uploadedBy
    };
    writeDb(db);
    return res.json(db.photos[idx]);
  }
  res.status(404).json({ error: "Photo not found" });
});

app.delete("/api/photos/:id", (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const lengthBefore = db.photos.length;
  db.photos = db.photos.filter((p: any) => p.id !== id);
  if (db.photos.length < lengthBefore) {
    writeDb(db);
    return res.json({ success: true });
  }
  res.status(404).json({ error: "Photo not found" });
});

// 4. AI-Powered: Support draft condolence message suggestion (Gemini)
app.post("/api/gemini/suggest", async (req, res) => {
  const { relation, sentiment } = req.body;
  if (!relation) {
    return res.status(400).json({ error: "Relation is required to draft custom condolences." });
  }

  const prompt = `Write 3 comforting, respectful draft condolence messages appropriate for a prayer meet invitation. 
The guest is a "${relation}" of the family. The tone should be "${sentiment || "peaceful and nostalgic"}".
Grandmother's name is Damiyanthi Poliyath, born June 2, 1941, died June 14, 2026.
Keep them beautiful, heartfelt, varying in length (one short, one medium, and one deeper).
Return them strictly as a JSON list of strings. Include nothing else. No markdown wrappers.`;

  try {
    const ai = getGeminiClient();
    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 3 comforting draft condolence messages."
          }
        }
      });

      const responseText = response.text || "[]";
      return res.json(JSON.parse(responseText));
    } else {
      // Fallback fallback mock response if no api key
      console.warn("API key missing. Sending fallback templates.");
      const mockSuggestions = [
        `Dear Rahul and Poliyath family, please accept my heartfelt condolences. Damiyanthi Ammama was a warm presence whose gentle laughter we will always treasure. Wishing you peaceful moments during her prayer meet.`,
        `Sharing in your sorrow during this time of mourning. Damiyanthi ji's life was a testament to love and devotion, and her story will always keep guiding us. May her soul find absolute peace.`,
        `As we prepare to join you in prayer for Dearest Damiyanthi on June 18th, please know we are sending our deepest support. She leaves behind a stellar legacy in all of you.`
      ];
      return res.json(mockSuggestions);
    }
  } catch (error: any) {
    console.error("Gemini suggestion error:", error);
    res.status(500).json({ error: "Failed to generate suggestions. Please check back.", details: error.message });
  }
});

// 5. AI-Powered: Summarize all Tributes into character themes and comforting insights (Gemini)
app.get("/api/tributes/summary", async (req, res) => {
  const db = readDb();
  const allTributeTexts = db.tributes.map((t: any) => `[${t.relation}] ${t.name}: "${t.message}"`).join("\n");

  if (db.tributes.length === 0) {
    return res.json({
      themes: [],
      summary: "Gathering memories from family and friends. Tributes will be analyzed here."
    });
  }

  const prompt = `Analyze the following guestbook and memory wall tributes dedicated to Grandmother Damiyanthi Poliyath.
Tributes:
${allTributeTexts}

Perform two tasks:
1. Extract the top 6 character traits, virtues, or themes frequently associated with her based on these tributes (e.g., "Warmth", "Stories", "Hospitality", "Grace"). Provide each with an approximate frequency or weight count.
2. Formulate a gentle, comforting 2-sentence summary/reflection of her collective impact and the legacy she leaves in the hearts of those who loved her.

Return this strictly as a JSON object matching this schema:
{
  "themes": [
    { "word": "Trait Name", "count": number }
  ],
  "summary": "Comforting summary here"
}
Ensure it is valid JSON and contains absolutely nothing else.`;

  try {
    const ai = getGeminiClient();
    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              themes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    word: { type: Type.STRING },
                    count: { type: Type.INTEGER }
                  },
                  required: ["word", "count"]
                }
              },
              summary: { type: Type.STRING }
            },
            required: ["themes", "summary"]
          }
        }
      });

      const responseText = response.text || "{}";
      return res.json(JSON.parse(responseText));
    } else {
      // Return beautiful default analytics based on prepopulated list
      return res.json({
        themes: [
          { word: "Warmth", count: 8 },
          { word: "Wisdom", count: 6 },
          { word: "Hospitality", count: 5 },
          { word: "Grandmother's Love", count: 9 },
          { word: "Devotion", count: 4 },
          { word: "Gentle Soul", count: 7 }
        ],
        summary: "Damiyanthi Poliyath is remembered collectively as a gentle pillar of maternal love and wisdom, whose home-cooked guidance and deep spiritual commitment have left an unshakeable template of dignity and warmth on her family."
      });
    }
  } catch (err: any) {
    console.error("Gemini summary error:", err);
    res.status(500).json({ error: "Failed to generate AI analytics.", details: err.message });
  }
});


/* ==========================================================================
   Vite / Static Server Setup
   ========================================================================== */

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
