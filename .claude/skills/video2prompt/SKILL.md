---
name: video2prompt
description: Turn a video into a structured, actionable prompt. Two modes. Feedback mode - a client screen-recording walkthrough becomes a deduplicated implementation task list (optionally mapped to files in this codebase) for a coding agent. Extract mode - a talking-head / explainer / social video becomes a content-recreation playbook (hooks, script structure, pacing, phrasing, visual-narration alignment, speaking style). Use when the user gives a video file and asks to turn feedback into tasks, "what does the client want", analyse a video's hooks/structure/pacing, or recreate a video's style.
---

# Video2Prompt

Adapted from [Zulelee/Video2Prompt](https://github.com/Zulelee/Video2Prompt) (MIT, see `LICENSE`). The original is a Python CLI that sends these prompts to an LLM; in this skill **you are the LLM** — run each stage yourself, using the prompt files as your instructions for that stage.

Files (relative to this skill's base directory):
- `prompts/*.md` — the instruction for each stage. `{{PLACEHOLDERS}}` mark the inputs you fill in yourself.
- `schemas/schemas.py` (feedback mode) and `schemas/content_schemas.py` (extract mode) — the Pydantic models each stage's JSON must match. Read the model named in the prompt; treat it as the schema.

## 0. Setup

1. Pick the mode from the request: **feedback** (client review / bug walkthrough of an app) or **extract** (study a video to recreate its style). Ask only if truly unclear.
2. Need `ffmpeg`/`ffprobe`. Work in `work/<video-name>/` (create it; keep it out of git) so a rerun can reuse transcript and frames.
3. Probe: `ffprobe -v error -show_entries format=duration:stream=codec_type,width,height -of json "<video>"`.

## 1. Transcribe → `transcript.json`

Produce `{"segments":[{"start":s,"end":s,"text":"..."}], "language":..., "duration":...}` (the `Transcript` model).
- Preferred: local Whisper — `pip install openai-whisper` (or `faster-whisper`), then transcribe with segment timestamps. Extract audio first: `ffmpeg -i "<video>" -vn -ac 1 -ar 16000 audio.wav`.
- If the video has no audio or no speech, say so and work from frames alone (sample every ~2–5 s).
- If you can't install a transcriber, tell the user and ask for a transcript or subtitle file.

## 2. Detect segments

Follow `prompts/detect_feedback.md` (feedback) or `prompts/detect_content_segments.md` (extract), with `{{TRANSCRIPT_JSON}}` = the transcript and `{{SCHEMA_JSON}}` = `FeedbackCandidatesResult` / `ContentSegmentsResult`. Save as `candidates.json`.

## 3. Extract frames

For each candidate with `needs_visual_context: true`, grab ~3 frames across its span (start, middle, end; pad ±0.5 s):
`ffmpeg -v error -ss <t> -i "<video>" -frames:v 1 -vf scale=1280:-2 frames/<ID>_<t>.jpg`
Then **look at each frame with the Read tool**.

## 4. Visual analysis

Per candidate, follow `prompts/analyze_visual_feedback.md` or `prompts/analyze_content_visual.md`:
`{{CANDIDATE_JSON}}` = the candidate, `{{TRANSCRIPT_CONTEXT}}` = transcript segments within ~15 s, `{{FRAME_DESCRIPTIONS}}` = the frames you viewed (cite filenames in `evidence_frames`). Output `VisualFeedbackAnalysis` / `VisualContentAnalysis`. Save to `analyses.json`.

## 5. (Feedback mode, when there is a codebase) Map to code

Per item, follow `prompts/map_to_codebase.md` with `{{PROJECT_PATH}}` = the repo and `{{FEEDBACK_JSON}}` = the analysis. Search with Grep/Glob; **only list files and symbols you verified exist**. Do not edit code in this step.

## 6. Synthesize

Follow `prompts/synthesize_feedback.md` (→ `FeedbackAnalysis`) or `prompts/synthesize_content.md` (→ `ContentFeatureAnalysis`), with `{{ANALYSIS_PAYLOAD_JSON}}` = video metadata + transcript + candidates + analyses (+ mappings). Save `analysis.json`.

## 7. Deliver the prompt

Write `output/<video-name>.md` — a markdown prompt the user can paste into a coding agent or writer:

- **Feedback:** summary; global constraints (prominent); numbered tasks, each with client quote + timestamp, location, current → desired state, requirements, relevant files/symbols (verified only), do-not-modify, ambiguity and confidence; superseded instructions; unclear items to confirm with the client.
- **Extract:** topic and direction; hooks (timestamp, technique, effect); script structure; pacing flow; phrasing patterns; visual–narration alignment; speaking style; segment-by-segment breakdown; recreation principles; and a closing instruction such as "Using these principles, write a script for a video about <TOPIC>".

Tell the user where the file is and give a short summary. Implement feedback tasks only if the user asks.

## Ground rules (from the original prompts)

- Never invent requirements, visuals or file names; separate what was said/shown from what you infer; lower confidence when evidence is thin.
- A later instruction from the client overrides an earlier conflicting one.
- Keep chronological order and stable IDs (`FB-001…`, `SEG-001…`).
