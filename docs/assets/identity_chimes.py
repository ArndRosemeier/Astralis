"""Compose 26 deterministic identity motifs from existing generated cues, with no API calls."""
import hashlib
import json
from pathlib import Path
import re
import subprocess
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / "public" / "assets"
META = ROOT / "docs" / "assets" / "identity"
META.mkdir(parents=True, exist_ok=True)
(PUBLIC / "identity").mkdir(exist_ok=True)
SPECIES = ["humans", "vael", "oolu", "brathak", "sylphae", "corundi", "myriad", "lattice", "tessit", "skethi", "hallowfleet", "qelloth", "mur", "kiriel", "ulqua", "tharn", "wardens", "mycel", "ixit", "vorr", "sorrin", "kith", "aumaru", "abyssals", "keth-ra", "seren"]
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
PENTATONIC = [0, 3, 5, 7, 10, 12]

for number, species_id in enumerate(SPECIES):
    out = PUBLIC / "identity" / (species_id + ".mp3")
    if out.exists():
        continue
    seed = int.from_bytes(hashlib.sha256(species_id.encode()).digest()[:4], "big")
    # Each four-note motif is deliberately distinct, drawn from a common minor pentatonic.
    notes = [PENTATONIC[(number // (6 ** index)) % 6] for index in range(3)] + [0]
    register = -5 if species_id in {"brathak", "corundi", "qelloth", "tharn", "abyssals"} else 0
    source = PUBLIC / "ui-confirm.mp3"
    graphs = ["[0:a]asplit=4[a0][a1][a2][a3]"]
    for index, semitones in enumerate(notes):
        factor = 2 ** ((semitones + register) / 12)
        graphs.append(f"[a{index}]atrim=start=0.03:duration=0.55,asetpts=PTS-STARTPTS,asetrate={44100 * factor:.6f},aresample=44100,afade=t=in:d=0.025,afade=t=out:st=0.35:d=0.22,adelay={index * 720}:all=1[n{index}]")
    graphs.append("[n0][n1][n2][n3]amix=inputs=4:duration=longest:normalize=0,apad=pad_dur=0.25,loudnorm=I=-25:TP=-4:LRA=7,alimiter=limit=0.6:level=false[out]")
    subprocess.run([FFMPEG, "-v", "error", "-y", "-i", str(source), "-filter_complex", ";".join(graphs), "-map", "[out]", "-t", "3.7", "-ac", "1", "-ar", "44100", "-codec:a", "libmp3lame", "-b:a", "96k", str(out)], check=True)
    decode = subprocess.run([FFMPEG, "-v", "error", "-i", str(out), "-f", "null", "-"], capture_output=True, text=True, check=True)
    if decode.stderr.strip():
        raise RuntimeError(decode.stderr)
    result = subprocess.run([FFMPEG, "-hide_banner", "-i", str(out), "-af", "volumedetect", "-f", "null", "-"], capture_output=True, text=True, check=True)
    lines = [line.strip() for line in result.stderr.splitlines() if any(t in line for t in ("Duration:", "Audio:", "mean_volume:", "max_volume:"))]
    peak = float(re.search(r"max_volume: ([-\d.]+) dB", result.stderr)[1])
    if peak > -2:
        raise RuntimeError("Unsafe identity cue peak for " + species_id)
    metadata = {"asset": out.relative_to(ROOT).as_posix(), "model": "bytedance-seed/seed-audio-1-0",
        "method": "local procedural composition of existing Seed Audio material; no new inference",
        "source": "public/assets/ui-confirm.mp3", "source_provenance": "docs/assets/ui-confirm.json",
        "prompt": f"A quiet four-note minor-pentatonic identity motif for {species_id}, derived from the common starship instrument timbre.",
        "seed": None, "identity_fingerprint": seed, "motif_semitones": [note + register for note in notes],
        "derivation": {"note_spacing_ms": 720, "trim_start_seconds": 0.03, "source_note_seconds": 0.55,
                       "composition": "pitched copies, temporal placement, fades, mix, normalization and headroom limiter"},
        "usage": {"cost": 0}, "cost_usd": 0, "bytes": out.stat().st_size,
        "full_decode": "passed", "verification": lines,
        "ffprobe": "unavailable; ffmpeg stream inspection used"}
    (META / (species_id + ".json")).write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    print(species_id + ": identity motif complete, no API cost", flush=True)
