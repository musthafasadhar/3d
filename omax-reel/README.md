# Omax Media: "Personal Branding for Doctors" reel visuals

These are B-roll clips for a 9:16 Instagram reel. They have no audio, so you can lay them under your own talking-head footage or voice-over.
The look is low-poly 3D characters with cozy night lighting, bokeh and bold Poppins captions with one teal accent word, based on the reference reels.

* **Format:** 1080×1920 (9:16), 30 fps, H.264 MP4, no audio
* **Safe zone:** nothing important sits in the bottom 15% (y > 1632 px), because Instagram puts the username, caption and audio there.
  Captions sit between 170 px and about 450 px from the top. The CTA button ends at about 1545 px.
* **Two versions of every clip:**
  * `*_text.mp4` has English captions baked in.
  * `*_clean.mp4` has the same animation with no captions, so you can add your own Telugu/English subtitles in your editor.

## Clips (follow the script order)

| # | File | Length | Script beat | On-screen text (text version) |
|---|------|--------|-------------|-------------------------------|
| 1 | `s1` | 6s | Hook: people trust the Insta doctor more than the one next door | *Not the doctor next door… / The one on their **phone.*** |
| 2 | `s2` | 6s | After AI, people still trust a doctor they see online | *Not the chatbot. / Not the clinic nearby. / The doctor they **see** every day.* |
| 3 | `s3` | 6s | This isn't about insulting doctors. Doctors should come online and make content | *This isn't about doubting doctors. / It's time to **show up online.*** |
| 4 | `s4` | 6s | Example: Dr. Vikrant. Build a brand like him | kicker *Like Dr. Vikrant* / *Build a name people **trust.*** |
| 5 | `s5` | 6s | Not just doctors: lawyers and everyone need personal branding | *Doctors. Lawyers. **Everyone.** / Personal branding is a must today.* |
| 6 | `s6` | 5s | CTA: contact Omax Media | *Let's build your **personal brand.*** + "Contact us today →" button, with the Omax Media logo |

`out/omax_full_text.mp4` and `out/omax_full_clean.mp4` join all six clips with 0.4s crossfades (about 33s), for previewing.

> The profile/reel screens use a generic **"Dr. Your Name"** character, not a real person.
> For the Dr. Vikrant moment, cut in his actual public reels or screenshots alongside clip 4 if you want.

## Re-rendering / editing

Everything is code (Three.js and HTML), so the wording, colours and names are easy to change:

```bash
cd omax-reel
node render.mjs                 # all clips, text + clean (~1 min per clip)
node render.mjs s4              # one clip
node render.mjs --still 3 s4    # PNG preview at t=3s with the red safe-zone overlay
./montage.sh text               # stitch the full preview reel
./montage.sh clean
```

* Brand colours and name are in `lib.js` → `BRAND`.
* Captions live at the bottom of each `scenes/sN.js` (the `ov.innerHTML` block).
* Open `index.html?scene=s1&play=1` from a local web server (for example `npx serve .`) to watch a scene live in the browser.
  Add `&guide=1` to see the Instagram safe-zone overlay and `&text=0` for the clean version.

Requires Node 18+, Playwright with Chromium, and ffmpeg.
