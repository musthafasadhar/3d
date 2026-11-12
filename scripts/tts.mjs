// Generate speech with ElevenLabs and save it as an MP3.
// Usage: ELEVENLABS_API_KEY=... node scripts/tts.mjs [output.mp3] ["custom text"]
import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const DEFAULT_TEXT =
  "In the ancient land of Eldoria, where skies shimmered and forests, whispered secrets to the wind, lived a dragon named Zephyros. [sarcastically] Not the “burn it all down” kind... [giggles] but he was gentle, wise, with eyes like old stars. [whispers] Even the birds fell silent when he passed.";

const [outFile = "output.mp3", text = DEFAULT_TEXT] = process.argv.slice(2);

if (!process.env.ELEVENLABS_API_KEY) {
  console.error("Set ELEVENLABS_API_KEY before running this script.");
  process.exit(1);
}

const elevenlabs = new ElevenLabsClient(); // reads ELEVENLABS_API_KEY

const audio = await elevenlabs.textToSpeech.convert("NOpBlnGInO9m6vDvFkFC", {
  text,
  modelId: "eleven_v4",
  languageCode: "en",
});

await pipeline(Readable.fromWeb(audio), createWriteStream(outFile));
console.log(`Saved ${outFile}`);
