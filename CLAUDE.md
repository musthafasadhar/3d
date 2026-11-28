# Project instructions for Claude

## Video editing

Whenever I ask for any video editing (cutting silences, removing "um"/"uh", jump cuts,
captions, chapters, vertical versions, audio cleanup, posting, etc.), use the
`video-editing-skill` skill (invoke it via the Skill tool) and follow its workflow,
including showing the cut list for approval before rendering and confirming before posting.

### Make sure the skill is installed (new/ephemeral environments)

If the skill is not available in the current environment (`~/.claude/skills/video-editing-skill`
is missing), install it first with:

```
npx skills add social-media-skills/video-editing-skill -g -a claude-code -y
```

## Sound design / SFX

Whenever I ask for sound effects, sound design, SFX, whooshes/hits/risers/clicks/typing sounds,
UI sounds, or to replace synthetic sounds with real ones, use the `real-sfx` skill (invoke it via
the Skill tool) and follow its workflow. It uses real recorded sounds from my libraries, never
synthesized ones.

### Make sure the skill is installed (new/ephemeral environments)

`real-sfx` is not committed to this repo. If it is missing from `~/.claude/skills/real-sfx`,
ask me for the `real-sfx.skill` file (a zip archive) and install it by unzipping it into
`~/.claude/skills/`.

## Reel / short-form editing style

Whenever I ask to edit, caption or style a vertical talking-head video (reel, short, TikTok,
tutorial), also use the `pin-reels-editing-style` skill. It holds the fonts, colours, kinetic
captions, overlays, transitions and pacing learned from my two Pinterest reference videos.
Use it together with `video-editing-skill` (cuts) and `real-sfx` (sound).

### Make sure the skill is installed (new/ephemeral environments)

It lives in this repo at `skills/pin-reels-editing-style`. If it is missing from
`~/.claude/skills/pin-reels-editing-style`, install it with:

```
mkdir -p ~/.claude/skills && cp -r skills/pin-reels-editing-style ~/.claude/skills/
```
