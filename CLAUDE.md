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
