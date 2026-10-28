# Title nebula artwork

Four original background assets, generated with the built-in image-generation tool on 2026-10-28. Original PNGs are copied into the project; no external image service is required at runtime. Only the randomly selected background is requested at startup. The choice remains in App state through the click-to-start gate, quality changes, dialogs and returns to the title. It is independent of simulation randomness.

| Palette | Workspace asset |
| --- | --- |
| Magenta / violet / gold | `public/assets/title-nebula-violet.png` |
| Blue / cyan | `public/assets/title-nebula-azure.png` |
| Emerald / teal | `public/assets/title-nebula-emerald.png` |
| Crimson / amber | `public/assets/title-nebula-ember.png` |

## First generation prompt

Create a premium cinematic deep-space nebula background texture for the title screen of Astralis, a friendly colorful space strategy game. Landscape 16:9 composition, high resolution. The image is ONLY distant interstellar space: enormous luminous magenta and violet nebula clouds with richly detailed golden and warm amber illuminated filaments, dense overlapping wisps and dark branching dust lanes that convey real depth, restrained tiny scattered white stars and a few warm stars. Photorealistic astronomical space art inspired by high-resolution telescope photography, expansive, dramatic, elegant; physically textured gaseous formations, not smooth gradients or painted smoke. Compose the bright magenta/violet cloud ridge diagonally from upper middle towards lower right, golden highlights in the upper right and lower middle. Leftmost quarter is quieter dark plum space with faint filaments, because readable game menu text overlays that part; right-center should have dark dust pockets so a separately rendered blue planet remains distinguishable. Nebula should be prominent and colorful at normal screen brightness without white burned-out patches. Fill the entire image edge to edge. NO planets, NO moons, NO spacecraft, NO stations, NO horizon or ground, NO text, logos, borders, UI or watermarks. This will be behind an existing animated 3D world; don't add foreground objects.

## Additional generation prompts

The following complete shared prompt was used once per palette, substituting the palette text below for `{palette}`:

Create a premium cinematic deep-space nebula BACKGROUND TEXTURE for the title screen of Astralis, a colorful space strategy game. Landscape 16:9, high resolution. ONLY distant interstellar space: enormous luminous nebula clouds in this palette: {palette} Richly detailed overlapping wisps, fine turbulent cloud filaments and dark branching dust lanes give real depth. Photorealistic astronomical space art inspired by high-resolution telescope photography, expansive and elegant, physically textured gas, not smooth gradients or painted smoke. Scatter small crisp white stars and a handful of brighter stars. The image must be colorful and clearly visible at normal screen brightness but preserve deep shadow pockets and avoid burned-out white patches. Compose the most detailed cloud formations diagonally through the upper middle, upper right, and lower right, leaving the left quarter relatively dark and quiet for menu text. Keep some dark dust pockets around the right-center where a separately rendered blue planet will appear. Fill edge to edge. NO planets, moons, spacecraft, stations, foreground objects, ground, horizons, text, logos, UI, border or watermarks. This is one of four interchangeable background nebulae behind an existing live 3D world.

- Azure: luminous electric blue and cyan clouds, pale icy-white filaments, deep navy dust pockets. No dominant magenta or gold.
- Emerald: luminous emerald and turquoise clouds with pale mint and soft ivory illuminated filaments, deep teal dust pockets. No dominant magenta or blue.
- Ember: luminous crimson and burnt-orange clouds with bright amber and golden illuminated filaments, deep burgundy dust pockets. No dominant violet or blue.

## Rendering

The background covers the observatory behind its transparent WebGL canvas. The planet, moving clouds, moon, orbital habitats and brighter soft star sprites remain live scene objects. The same background is used as the WebGL fallback. Nebula images are stationary; the existing orbit pause and motion settings continue to control the live scene.
