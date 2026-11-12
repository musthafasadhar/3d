import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const VOICE_ID = "NOpBlnGInO9m6vDvFkFC";
const MAX_CHARS = 5000;

// POST /api/tts  { "text": "..." }  ->  audio/mpeg stream
// The API key stays on the server (ELEVENLABS_API_KEY).
export async function POST(req: Request) {
  if (!process.env.ELEVENLABS_API_KEY) {
    return Response.json({ error: "ELEVENLABS_API_KEY is not set" }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) {
    return Response.json({ error: "Body must be JSON with a non-empty \"text\"" }, { status: 400 });
  }
  if (text.length > MAX_CHARS) {
    return Response.json({ error: `Text exceeds ${MAX_CHARS} characters` }, { status: 413 });
  }

  try {
    const elevenlabs = new ElevenLabsClient();
    const audio = await elevenlabs.textToSpeech.convert(VOICE_ID, {
      text,
      modelId: "eleven_v4",
      languageCode: "en",
    });
    return new Response(audio, {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("ElevenLabs TTS failed:", err);
    return Response.json({ error: "Text-to-speech request failed" }, { status: 502 });
  }
}
