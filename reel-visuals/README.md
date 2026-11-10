# War-map reel visuals (9:16, 1080×1920)

These are motion graphics for the Trump–Iran / Russia–Ukraine reel. The characters are 3D low-poly "clay" figures (`chars3d.js`) with warm and purple cinematic lighting. Each clip shows a 3D night-lights globe with real country borders, glowing country highlights, 3D missiles with trails, explosions and shockwaves, dashed "threat" arcs and animated cartoon characters. The overlays include a BREAKING/LIVE HUD and English headlines with Telugu captions.

| Clip | Length | Narration it covers |
|---|---|---|
| `01-midterms` | 5.5s | Midterm elections complete |
| `02-trump-vs-iran` | 7.5s | Trump starts the war: missiles from the USA and the Arabian Sea hit Iran |
| `03-iran-warning` | 7s | Iran warns that anyone who supports the USA gets pulled into the war (Gulf states and Israel highlighted) |
| `04-russia-vs-ukraine` | 7.5s | Russia strikes Ukraine (Kyiv, Kharkiv, Odesa…) |
| `05-nuclear-warning-nato` | 8s | Russia's nuclear warning to NATO: NATO turns blue, then red, with threat arcs from Moscow |
| `06-ww3-not-yet` | 7.5s | WW3 hasn't started, no need to panic, but the situation is dangerous (danger meter) |

The output files are in `out/`:
* `NN-*.mp4` clips include the headlines and Telugu captions.
* `NN-*-clean.mp4` clips show only the globe and characters, so you can add your own captions.
* `FULL-REEL.mp4` joins all the captioned clips in order.

## Re-render / tweak
```bash
./render-all.sh                         # everything
node render.mjs --scenes 2,3            # only some clips
node render.mjs --clean --nochars       # globe only
node render.mjs --stills                # quick preview JPGs
```
To get a live preview, serve this folder (for example `npx serve .`) and open `index.html`.

All text, timings, camera moves and missile targets are in the `SCENES` array in `main.js`, and the characters are in `chars3d.js` (`characters.js` holds the old flat 2D versions).
