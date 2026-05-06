import { createServer } from "node:http";
import { createHash } from "node:crypto";
import { createReadStream, existsSync } from "node:fs";
import { mkdir, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- ElevenLabs config ---
const ELEVENLABS_API_KEY = "sk_79d3d487f7caf055f1d5b465d2207c9a3676c92e2edc8d64";
const ELEVENLABS_VOICE_ID = "yl2ZDV1MzN4HbQJbMihG";
const ELEVENLABS_TTS_MODEL = "eleven_v3";
const VOICE_CACHE_DIR = path.join(__dirname, "voice-cache");

// --- Port ---
const PORT = parseInt(process.env.VOICE_PORT || "5173", 10);

// --- Utility functions (from vite.config.js) ---
const normalizeVoiceText = (text) => text.trim().replace(/\s+/g, " ").slice(0, 480);

const prepareVoiceText = (text) =>
  text
    .replace(/\bAI\b/g, "A.I.")
    .replace(/\bCV\b/g, "C.V.")
    .replace(/\bCTO\b/g, "C.T.O.")
    .replace(/\bKPI\b/g, "K.P.I.")
    .replace(/\bLLM\b/g, "L.L.M.")
    .replace(/\bXR\b/g, "X.R.");

const voiceCacheKey = (text) =>
  createHash("sha256")
    .update(JSON.stringify({
      voiceId: ELEVENLABS_VOICE_ID,
      modelId: ELEVENLABS_TTS_MODEL,
      text,
    }))
    .digest("hex")
    .slice(0, 28);

const fileExists = async (filename) => {
  try { await stat(filename); return true; } catch { return false; }
};

const sendJson = (res, statusCode, body) => {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
};

// --- Pending generations map (dedup concurrent requests) ---
const pendingVoiceGenerations = new Map();

async function generateVoiceFile(text, targetFile) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: prepareVoiceText(text),
        model_id: ELEVENLABS_TTS_MODEL,
        language_code: "en",
        voice_settings: {
          stability: 0.36,
          similarity_boost: 0.82,
          style: 0.72,
          use_speaker_boost: true,
        },
        apply_text_normalization: "on",
        seed: 163,
      }),
    }
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`ElevenLabs returned ${response.status}: ${detail.slice(0, 300)}`);
  }

  await mkdir(VOICE_CACHE_DIR, { recursive: true });
  const buf = Buffer.from(await response.arrayBuffer());
  await writeFile(targetFile, buf);
}

async function handleVoiceRequest(req, res) {
  if (!req.url?.startsWith("/api/voice")) return false;

  const url = new URL(req.url, "http://localhost");
  const text = normalizeVoiceText(url.searchParams.get("text") ?? "");
  if (!text) {
    sendJson(res, 400, { error: "Missing voice text." });
    return true;
  }

  const key = voiceCacheKey(text);
  const audioFile = path.join(VOICE_CACHE_DIR, `${key}.mp3`);
  const metaFile = path.join(VOICE_CACHE_DIR, `${key}.json`);

  try {
    if (!(await fileExists(audioFile))) {
      if (!pendingVoiceGenerations.has(key)) {
        pendingVoiceGenerations.set(
          key,
          generateVoiceFile(text, audioFile).then(async () => {
            await writeFile(
              metaFile,
              JSON.stringify({
                text,
                voiceId: ELEVENLABS_VOICE_ID,
                modelId: ELEVENLABS_TTS_MODEL,
                generatedAt: new Date().toISOString(),
              }, null, 2)
            );
          })
        );
      }
      await pendingVoiceGenerations.get(key);
      pendingVoiceGenerations.delete(key);
    }

    res.writeHead(200, {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    });
    createReadStream(audioFile).pipe(res);
  } catch (error) {
    pendingVoiceGenerations.delete(key);
    sendJson(res, 503, {
      error: "Voice generation unavailable.",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
  return true;
}

// --- HTTP Server ---
const server = createServer(async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const handled = await handleVoiceRequest(req, res);
  if (!handled) {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Supercell voice server listening on http://127.0.0.1:${PORT}`);
  console.log(`Cache dir: ${VOICE_CACHE_DIR}`);
});
