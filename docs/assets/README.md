# Astralis asset library

The visual direction is **Celestial Instruments**: midnight ink, parchment white,
sea-glass teal, and restrained amber. The world is realistic and immense; interface
feedback is warm, precise, slightly playful, and never frantic. No existing franchise
logos, characters, or musical themes are reproduced.

## Files and intended use

| File under `public/assets/` | Purpose |
| --- | --- |
| `title-panorama.webp` | Dedicated title/reduced-motion background; quiet left side for the menu |
| `hero.webp` | Secondary research-ship artwork, retained from the initial Muse integration test |
| `title-theme.mp3` | Original optimistic title theme, 109 seconds |
| `exploration.mp3` | Quiet exploration underscore, 121 seconds |
| `battle.mp3` | Restrained tactical tension, 119 seconds |
| `ui-confirm.mp3` | Short instrument confirmation |
| `discovery-ethereal.wav` | Soft ethereal bloom for launch, discoveries and title interactions; original local synthesis |
| `discovery.mp3` | Original discovery chime, retained as a legacy asset; no longer used by the game |
| `turn.mp3` | Turn processing completes |
| `alert.mp3` | Advisory requiring attention |
| `weapon.mp3` | Restrained pulse weapon cue |
| `impact.mp3` | Distant hull-impact cue |
| `victory.mp3` | Mission-success flourish |
| `fonts/oxanium.ttf` | Variable sci-fi display/navigation face, SIL OFL 1.1 |
| `fonts/space-grotesk.ttf` | Variable readable information/body face, SIL OFL 1.1 |
| `species/{id}.webp` | Twenty-six calibrated-roster species portraits, 768px square runtime versions |
| `identity/{id}.mp3` | Twenty-six short species identity motifs, locally composed without new API calls |

The species portraits were generated **after** the applicable pre-roster specials calibration
and subsequent roster budget checks completed. The fourteen expanded-roster portraits
were produced only after the final full-engine calibration and legal 26-species
roster were completed. Each portrait uses the same midnight
observatory backdrop, sea-glass rim light and warm amber highlights, with visibly
distinct nonhuman anatomy. `portrait-review.jpg` is the visual QA contact sheet.
The original 1600px Muse outputs are retained unchanged under
`originals/species/`; `optimize_portraits.py` prepares the 768px runtime versions.
This reduces the portrait set from approximately 12.8 MB to 2.8 MB without changing
the designs. The runtime image files were all completely decoded and visually
reviewed together for consistency, silhouette clarity, framing and absence of
labels. The set contains Humans, Vael, Oolu, Brathak, Sylphae, Corundi, Myriad,
Lattice, Tessit, Skethi, Hallowfleet, Qelloth, Mur, Kiriel, Ulqua, Tharn, Wardens,
Mycel, Ixit, Vorr, Sorrin, Kith, Aumaru, Abyssals, Keth'ra and Seren.
`portrait-review-expanded.jpg` isolates the final fourteen for visual review.

`identity_chimes.py` composes distinct four-note minor-pentatonic identity motifs
from the existing generated confirmation cue. It uses pitch shifting, placement,
fades, mixing and level/headroom control. These approximately 3-second motifs
cost **$0 in additional inference**. Their provenance explicitly identifies local
composition; the original Seed Audio source is accounted only once. They can play
on species selection or first contact and should use the effects volume control.

## Reproduction and accounting

Every generated asset has a same-named JSON provenance file in this directory.
These contain the exact prompt, live-resolved model ID, request parameters, seed
(`null` when no seed was supplied), and returned usage metadata.

`generate.py` is a small Python asset-authoring tool. It reads an OpenRouter key from
the process environment or the untracked project `.env`, never from command-line
arguments. It supports the user's preferred Muse Image, Lyria Pro, and Seed Audio
families and resolves their current IDs from the live modality-specific catalogs
before use. It requires the authoring-only `imageio-ffmpeg` Python package.

Example:

```powershell
python docs/assets/generate.py sfx new-cue "The sound of a brief crystalline chime" --duration 2
python docs/assets/polish.py
```

`usage.cost` in a generation response and `billing.total_cost` from the generation
metadata endpoint are authoritative per-request costs. Immediate `/key` usage
deltas are retained only for diagnostics: the aggregate counter updates later and
must not be mistaken for a free request or used to sum individual costs.

The public asset manifest records the verified inventory and known charges. The
original hero test cost $0.01 before the asset-production batch; it is accounted
once, as a pre-existing integration test.

The completed 64-asset inventory has **$0.586505875** in confirmed OpenRouter
charges including the initial $0.01 test. Twenty-six portraits cost $0.26, the title
panorama $0.01, three full music tracks $0.24, and seven effects $0.066505875.
The twenty-six locally derived identity motifs add no inference cost. All charges
have authoritative response/generation metadata; none are pending.

## Audio engineering and checks

The replacement discovery cue is stereo 44.1 kHz, 16-bit PCM WAV. Run
`python docs/assets/ethereal_cue.py` to reproduce it without extra packages or API
calls. Its rounded attack, low harmonic voicing and diffuse reflections replace
the original struck chime. `discovery-ethereal.json` records its level, format and
PCM verification. It uses the same effects-volume and mute controls as other cues.

Music is stereo 44.1 kHz MP3 at 160 kbps and should stream through an HTML audio
element. Only short effects should be decoded into Web Audio buffers. Effects are
trimmed, converted to mono 44.1 kHz MP3 at 96 kbps, and given a final level pass so
their measured mean is about -23.5 dB, with headroom below clipping.

All delivered audio files were inspected for codec, duration, sample rate, and
channels, fully decoded without errors, and measured using `volumedetect`.
`ffprobe` was unavailable on the authoring machine; the bundled FFmpeg stream
inspection supplied the same format fields in addition to the full-decode check.
The evidence is in each asset's JSON file. No audio or image bytes were decoded as
text. The final subjective listening assessment remains a human review; automated
checks establish technical validity, not musical taste or the absence of all
speech-like artifacts.

Sound must begin after a user gesture, offer independent music/effect controls and
a visible mute action, and respect persisted settings. Short cues should be rate
limited so rapid interface actions do not become a wall of overlapping sounds.

## Credits

- Image generation: Meta Muse Image via OpenRouter.
- Original music generation: Google Lyria via OpenRouter.
- Sound-effect generation: ByteDance Seed Audio via OpenRouter.
- Oxanium by Severin Meyer: <https://github.com/google/fonts/tree/main/ofl/oxanium>.
- Space Grotesk by Florian Karsten: <https://github.com/google/fonts/tree/main/ofl/spacegrotesk>.

Both font license notices are bundled beside the fonts. Fonts load locally; no
third-party font service is needed at game runtime. OpenRouter is used only during
asset authoring, and its private API key must never be included in the web bundle.
