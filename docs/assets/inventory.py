"""Validate media inventory and build its public manifest; optional billing reconciliation."""
import argparse
import importlib.util
import json
from pathlib import Path
import subprocess
import urllib.error
from PIL import Image
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[2]
META = ROOT / "docs" / "assets"
PUBLIC = ROOT / "public" / "assets"
parser = argparse.ArgumentParser()
parser.add_argument("--reconcile", action="store_true")
args = parser.parse_args()
if args.reconcile:
    spec = importlib.util.spec_from_file_location("generate", META / "generate.py")
    generate = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(generate)

assets = []
for path in sorted(META.rglob("*.json")):
    metadata = json.loads(path.read_text(encoding="utf-8"))
    if not metadata.get("asset"):
        continue
    if args.reconcile:
        generation_id = next((v for k, v in metadata.get("billing_headers", {}).items() if "generation-id" in k.lower()), None)
        if generation_id and not metadata.get("billing"):
            try:
                generation = generate.orcli.request("/generation?id=" + generation_id)["data"]
                metadata["billing"] = {k: generation.get(k) for k in ("id", "model", "total_cost", "generation_time", "num_media_completion")}
                metadata.pop("billing_note", None)
            except (urllib.error.URLError, ValueError, KeyError):
                metadata["billing_note"] = "Per-generation billing not yet available."
    file = ROOT / metadata["asset"]
    if not file.is_file() or file.stat().st_size < 1000:
        raise RuntimeError("Missing or implausible asset: " + str(file))
    reported = (metadata.get("usage") or {}).get("cost")
    if reported is None:
        reported = (metadata.get("billing") or {}).get("total_cost")
    metadata["cost_usd"] = reported
    item = {"path": "/" + file.relative_to(ROOT / "public").as_posix(), "model": metadata["model"], "bytes": file.stat().st_size,
            "cost_usd": reported, "provenance": path.relative_to(ROOT).as_posix()}
    if metadata.get("method"):
        item["method"] = metadata["method"]
    if file.suffix in (".webp", ".png", ".jpg"):
        with Image.open(file) as image:
            image.load()
            item["width"], item["height"] = image.size
            item["format"] = image.format
            metadata["image_verification"] = {"complete_decode": "passed", "width": image.width, "height": image.height, "format": image.format}
    elif file.suffix == ".mp3":
        process = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-v", "error", "-i", str(file), "-f", "null", "-"], capture_output=True, text=True, check=True)
        if process.stderr.strip():
            raise RuntimeError(process.stderr)
        item["full_decode"] = "passed"
        item["verification"] = metadata.get("verification", [])
    path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    assets.append(item)

# Existing ship art was the initial integration test, before this production batch.
with Image.open(PUBLIC / "hero.webp") as image:
    image.load()
    assets.append({"path": "/assets/hero.webp", "model": "meta/muse-image", "bytes": (PUBLIC / "hero.webp").stat().st_size,
                   "cost_usd": .01, "width": image.width, "height": image.height, "format": image.format,
                   "provenance": "docs/assets/hero-source.json", "preexisting_integration_test": True})

total = round(sum(item["cost_usd"] for item in assets if item["cost_usd"] is not None), 9)
pending = [item["path"] for item in assets if item["cost_usd"] is None]
manifest = {"style": "Celestial Instruments", "budget_usd": 50, "asset_subtask_ceiling_usd": 5,
            "total_confirmed_cost_usd": total, "pending_billing": pending, "assets": assets,
            "fonts": [{"path": "/assets/fonts/oxanium.ttf", "family": "Oxanium", "license": "SIL OFL 1.1", "notice": "/assets/fonts/Oxanium-OFL.txt"},
                      {"path": "/assets/fonts/space-grotesk.ttf", "family": "Space Grotesk", "license": "SIL OFL 1.1", "notice": "/assets/fonts/SpaceGrotesk-OFL.txt"}]}
(PUBLIC / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
if total > 5:
    raise RuntimeError("Asset subtask ceiling exceeded")
print(json.dumps({"verified_assets": len(assets), "confirmed_cost_usd": total, "pending_billing": pending}, indent=2))
