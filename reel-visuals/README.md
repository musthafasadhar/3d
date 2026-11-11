# War-map reel visuals (9:16, 1080×1920, 15s each)

There are two 3D infographic videos. Each has a night-lights globe with real country borders, glowing and flickering country highlights, 3D missiles with trails, explosions, warning and threat arcs, and rounded 3D "toy" characters styled after the reference reel: big round heads, small glinting eyes and soft warm/purple lighting. The only text is map labels.

| Video | What happens |
|---|---|
| `out/video1-usa-iran-war.mp4` | The USA is highlighted while Trump gives the order. A long-range strike and a carrier salvo hit Iran. The Iran commander gets angry, then Iran's warning plays: a shockwave from Tehran and red threat lines to every country backing the US (Israel, Saudi Arabia, UAE, Qatar, Iraq, Jordan, Kuwait, Bahrain), with ⚠ markers and flickering borders. |
| `out/video2-russia-ukraine-war.mp4` | Russia (red) and Ukraine (yellow) are shown with Putin and Zelensky. Missile salvos hit Ukrainian cities. An 8-axle mobile ICBM launcher drives in, raises its canister and fires. The camera then pulls back: European NATO countries light up blue, then flash red as nuclear threat arcs (☢) reach Warsaw, Berlin, Paris, London, Rome and others. |

## Re-render / tweak
```bash
./render-all.sh                                  # both videos
node render.mjs --scenes 2                       # only video 2
node render.mjs --nochars                        # globe only, no characters
node render.mjs --stills --times 2,7,12          # preview JPGs at chosen seconds
```
* All timings, camera moves, targets and labels are in the `SCENES` array in `main.js`.
* The characters and the launcher are in `chars3d.js`.
* `chars3d-lowpoly.js` and `characters.js` are the earlier faceted and flat-2D styles.
