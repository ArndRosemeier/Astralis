"""Prepare efficient runtime portrait variants, preserving the generated source bytes."""
import hashlib
import json
from pathlib import Path
import shutil
from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / "public" / "assets" / "species"
ORIGINALS = ROOT / "docs" / "assets" / "originals" / "species"
ORIGINALS.mkdir(parents=True, exist_ok=True)
ORDER = ["humans", "vael", "oolu", "brathak", "sylphae", "corundi", "myriad", "lattice", "tessit", "skethi", "hallowfleet", "qelloth", "mur", "kiriel", "ulqua", "tharn", "wardens", "mycel", "ixit", "vorr", "sorrin", "kith", "aumaru", "abyssals", "keth-ra", "seren"]
for species_id in ORDER:
    path = PUBLIC / (species_id + ".webp")
    metadata_path = ROOT / "docs" / "assets" / "species" / (species_id + ".json")
    if not path.is_file() or not metadata_path.is_file():
        raise RuntimeError("Portrait generation incomplete: " + species_id)
    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    if metadata.get("runtime_optimization"):
        continue
    source = ORIGINALS / path.name
    if source.exists():
        raise RuntimeError("Original source already exists; inspect before retrying: " + species_id)
    shutil.copy2(path, source)
    with Image.open(source) as image:
        image.load()
        original_dimensions = list(image.size)
        portrait = image.convert("RGB").resize((768, 768), Image.Resampling.LANCZOS)
        portrait.save(path, format="WEBP", quality=88, method=6)
    metadata["runtime_optimization"] = {"source": source.relative_to(ROOT).as_posix(), "source_dimensions": original_dimensions,
        "source_sha256": hashlib.sha256(source.read_bytes()).hexdigest(), "width": 768, "height": 768,
        "operation": "Lanczos downsample and WebP quality88 encoding; no creative edits"}
    metadata["bytes"] = path.stat().st_size
    metadata_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    print(f"{species_id}: {source.stat().st_size} -> {path.stat().st_size} bytes")

sheet = Image.new("RGB", (1280, 344 * ((len(ORDER) + 3) // 4)), "#08131d")
draw = ImageDraw.Draw(sheet)
for index, species_id in enumerate(ORDER):
    x, y = (index % 4) * 320, (index // 4) * 344
    with Image.open(PUBLIC / (species_id + ".webp")) as image:
        sheet.paste(ImageOps.contain(image, (312, 312)), (x + 4, y + 4))
    draw.text((x + 12, y + 320), species_id.upper(), fill="#e9dfc5")
sheet.save(ROOT / "docs" / "assets" / "portrait-review.jpg", quality=93)
expanded = Image.new("RGB", (1280, 1376), "#08131d")
draw = ImageDraw.Draw(expanded)
for index, species_id in enumerate(ORDER[12:]):
    x, y = (index % 4) * 320, (index // 4) * 344
    with Image.open(PUBLIC / (species_id + ".webp")) as image:
        expanded.paste(ImageOps.contain(image, (312, 312)), (x + 4, y + 4))
    draw.text((x + 12, y + 320), species_id.upper(), fill="#e9dfc5")
expanded.save(ROOT / "docs" / "assets" / "portrait-review-expanded.jpg", quality=93)
