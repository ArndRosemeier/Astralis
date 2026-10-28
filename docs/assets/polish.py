"""Normalize final short effects after trimming; full decode and measure every output."""
import json
from pathlib import Path
import re
import subprocess
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[2]
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
MUSIC = {"title-theme", "exploration", "battle"}


def measure(path):
    process = subprocess.run([FFMPEG, "-hide_banner", "-i", str(path), "-af", "volumedetect", "-f", "null", "-"], capture_output=True, text=True, check=True)
    mean = float(re.search(r"mean_volume: ([-\d.]+) dB", process.stderr)[1])
    peak = float(re.search(r"max_volume: ([-\d.]+) dB", process.stderr)[1])
    lines = [line.strip() for line in process.stderr.splitlines() if any(t in line for t in ("Duration:", "Audio:", "mean_volume:", "max_volume:"))]
    return mean, peak, lines


for path in sorted((ROOT / "public" / "assets").glob("*.mp3")):
    if path.stem in MUSIC:
        continue
    meta_path = ROOT / "docs" / "assets" / (path.stem + ".json")
    metadata = json.loads(meta_path.read_text(encoding="utf-8"))
    if metadata.get("post_trim_level_polish"):
        continue
    mean, peak, _ = measure(path)
    gain = min(-23 - mean, -4 - peak)
    temporary = ROOT / "docs" / "assets" / (path.stem + ".polished.mp3")
    subprocess.run([FFMPEG, "-v", "error", "-y", "-i", str(path), "-af", f"volume={gain}dB", "-ac", "1", "-ar", "44100", "-codec:a", "libmp3lame", "-b:a", "96k", str(temporary)], check=True)
    decode = subprocess.run([FFMPEG, "-v", "error", "-i", str(temporary), "-f", "null", "-"], capture_output=True, text=True, check=True)
    if decode.stderr.strip():
        raise RuntimeError(decode.stderr)
    new_mean, new_peak, verification = measure(temporary)
    if new_peak > -2:
        raise RuntimeError("Unexpected audio peak")
    temporary.replace(path)
    metadata.update({"post_trim_level_polish": {"gain_db": round(gain, 2), "target_mean_db": -23, "peak_ceiling_db": -4}, "verification": verification, "bytes": path.stat().st_size, "full_decode": "passed"})
    meta_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    print(f"{path.name}: mean {new_mean} dB, peak {new_peak} dB; complete decode passed")
