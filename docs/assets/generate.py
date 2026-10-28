"""Reproducible OpenRouter media generation. Key is loaded privately from project .env."""
import argparse
import base64
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import urllib.request
import urllib.error
from types import SimpleNamespace
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "assets"
META = ROOT / "docs" / "assets"


def load_key():
    values = {}
    dotenv = ROOT / ".env"
    if dotenv.exists():
        for line in dotenv.read_text(encoding="utf-8-sig").splitlines():
            match = re.match(r"\s*(?:export\s+)?(\w+)\s*=\s*(.*)", line)
            if match:
                value = match[2].strip()
                if value[:1] in ("'", '"') and value[-1:] == value[:1]:
                    value = value[1:-1]
                else:
                    value = re.split(r"\s+#", value, maxsplit=1)[0].strip()
                values[match[1]] = value
    for name in ("OPEN_ROUTER_KEY", "OPENROUTER_API_KEY"):
        value = os.environ.get(name) or values.get(name)
        if value:
            return value
    raise RuntimeError("No OpenRouter key in project environment")


def json_request(path, payload=None):
    with api(path, payload) as response:
        return json.loads(response.read())


orcli = SimpleNamespace(BASE="https://openrouter.ai/api/v1", load_key=load_key, request=json_request)


def api(path, payload=None, stream=False):
    body = None if payload is None else json.dumps(payload).encode()
    request = urllib.request.Request(orcli.BASE + path, data=body,
        headers={"Authorization": "Bearer " + orcli.load_key(), "Content-Type": "application/json"})
    return urllib.request.urlopen(request, timeout=240)


def resolve(task):
    if task == "image":
        models = orcli.request("/images/models")["data"]
        models = [m for m in models if "muse" in m["id"] and "image" in m["id"]
                  and "image" in m.get("architecture", {}).get("output_modalities", [])]
    else:
        models = orcli.request("/models?output_modalities=all")["data"]
        if task == "sfx":
            models = [m for m in models if "bytedance-seed/seed-audio" in m["id"]
                      and "speech" in m.get("architecture", {}).get("output_modalities", [])]
        else:
            models = [m for m in models if "lyria" in m["id"] and "pro" in m["id"]
                      and "audio" in m.get("architecture", {}).get("output_modalities", [])]
    models = [m for m in models if ":batch" not in m["id"]]
    aliases = [m for m in models if m["id"].startswith("~") and "latest" in m["id"]]
    if len(aliases) > 1 or not models:
        raise RuntimeError("Missing or ambiguous model family")
    model = aliases[0] if aliases else max(models, key=lambda m: (m.get("created", 0), tuple(int(n) for n in re.findall(r"\d+", m["id"]))))
    print("Resolved " + task + ": " + model["id"], flush=True)
    return model["id"]


def usage():
    return float(orcli.request("/key")["data"]["usage"])


def make(task, name, prompt, duration=None, size="1920x1080"):
    raw_path = META / (name + ".raw.mp3")
    out = OUT / (name + (".webp" if task == "image" else ".mp3"))
    out.parent.mkdir(parents=True, exist_ok=True)
    raw_path.parent.mkdir(parents=True, exist_ok=True)
    if out.exists():
        raise RuntimeError("Refusing to overwrite " + str(out))
    model = resolve(task)
    before = usage()
    if task == "image":
        payload = {"model": model, "prompt": prompt, "size": size, "n": 1}
        result = orcli.request("/images", payload)
        data = base64.b64decode(result["data"][0]["b64_json"], validate=True)
        if data.startswith(b"\x89PNG"):
            out = out.with_suffix(".png")
        elif data.startswith(b"\xff\xd8"):
            out = out.with_suffix(".jpg")
        elif not (data.startswith(b"RIFF") and data[8:12] == b"WEBP"):
            raise RuntimeError("Unknown image bytes")
        out.write_bytes(data)
        info = {"usage": result.get("usage")}
    elif task == "music":
        payload = {"model": model, "messages": [{"role": "user", "content": prompt}],
                   "stream": True, "modalities": ["text", "audio"], "stream_options": {"include_usage": True}}
        chunks = []
        info = {}
        with api("/chat/completions", payload, True) as response:
            for raw_line in response:
                if not raw_line.startswith(b"data: "):
                    continue
                data_line = raw_line[6:].strip()
                if data_line == b"[DONE]":
                    break
                event = json.loads(data_line)
                if event.get("error"):
                    raise RuntimeError(str(event["error"]))
                if event.get("usage"):
                    info["usage"] = event["usage"]
                for choice in event.get("choices", []):
                    audio = choice.get("delta", {}).get("audio", {})
                    if audio.get("data"):
                        chunks.append(audio["data"])
        data = base64.b64decode("".join(chunks), validate=True)
        if len(data) < 1024:
            raise RuntimeError("No music bytes returned")
        raw_path.write_bytes(data)
        info.update(process_audio(raw_path, out, False, duration))
    else:
        payload = {"model": model, "input": prompt, "response_format": "mp3"}
        with api("/audio/speech", payload) as response:
            data = response.read()
            billing_headers = {k: v for k, v in response.headers.items() if any(word in k.lower() for word in ("cost", "usage", "generation-id"))}
        if len(data) < 1024:
            raise RuntimeError("No sound bytes returned")
        raw_path.write_bytes(data)
        info = process_audio(raw_path, out, True, duration)
        info["billing_headers"] = billing_headers
    after = usage()
    metadata = {"asset": str(out.relative_to(ROOT)).replace("\\", "/"), "model": model,
        "prompt": prompt, "seed": None, "api_request": payload, "bytes": out.stat().st_size,
        "key_usage_before": before, "key_usage_after": after, "cost_delta_usd": round(after - before, 8), **info}
    generation_id = next((v for k, v in metadata.get("billing_headers", {}).items() if "generation-id" in k.lower()), None)
    if generation_id:
        try:
            generation = orcli.request("/generation?id=" + generation_id)["data"]
            metadata["billing"] = {k: generation.get(k) for k in ("id", "model", "total_cost", "generation_time", "num_media_completion")}
        except (urllib.error.URLError, ValueError, KeyError):
            metadata["billing_note"] = "Per-generation billing not yet available; reconcile later."
    reported_cost = (metadata.get("usage") or {}).get("cost")
    if reported_cost is None:
        reported_cost = (metadata.get("billing") or {}).get("total_cost")
    metadata["cost_usd"] = reported_cost
    (META / (name + ".json")).write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    if raw_path.exists():
        raw_path.unlink()
    print(json.dumps({field: metadata.get(field) for field in ("asset", "model", "cost_usd", "bytes", "full_decode")}), flush=True)
    return metadata


def process_audio(raw, out, sfx, duration):
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    effects = []
    if sfx:
        effects.append("silenceremove=start_periods=1:start_duration=0.02:start_threshold=-55dB")
        if duration:
            effects.append(f"atrim=duration={duration}")
        effects.append("loudnorm=I=-20:TP=-2:LRA=7")
    else:
        effects.extend(["loudnorm=I=-22:TP=-2:LRA=11", "afade=t=in:d=1.5"])
    if duration:
        fade = 0.08 if sfx else 2.0
        effects.append(f"afade=t=out:st={max(0, duration - fade)}:d={fade}")
    effects.append("alimiter=limit=0.65:level=false")
    command = [ffmpeg, "-hide_banner", "-y", "-i", str(raw), "-vn", "-af", ",".join(effects)]
    if duration:
        command += ["-t", str(duration)]
    command += ["-ac", "1" if sfx else "2", "-ar", "44100", "-codec:a", "libmp3lame", "-b:a", "96k" if sfx else "160k", str(out)]
    processed = subprocess.run(command, capture_output=True, text=True)
    if processed.returncode:
        raise RuntimeError(processed.stderr[-2000:])
    decode = subprocess.run([ffmpeg, "-v", "error", "-i", str(out), "-f", "null", "-"], capture_output=True, text=True)
    if decode.returncode or decode.stderr.strip():
        raise RuntimeError("Full audio decode failed: " + decode.stderr)
    probe = subprocess.run([ffmpeg, "-hide_banner", "-i", str(out), "-af", "volumedetect", "-f", "null", "-"], capture_output=True, text=True)
    # ffprobe is unavailable on this machine. ffmpeg reports identical codec/duration/rate fields
    # while also decoding the complete audio and measuring loudness.
    lines = [line.strip() for line in probe.stderr.splitlines() if any(t in line for t in ("Duration:", "Audio:", "mean_volume:", "max_volume:"))]
    return {"verification": lines, "full_decode": "passed", "ffprobe": "unavailable; ffmpeg stream inspection used"}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("task", choices=["image", "music", "sfx"])
    parser.add_argument("name")
    parser.add_argument("prompt")
    parser.add_argument("--duration", type=float)
    parser.add_argument("--size", default="1920x1080")
    args = parser.parse_args()
    try:
        make(args.task, args.name, args.prompt, args.duration, args.size)
    except Exception as error:
        message = str(error).replace(orcli.load_key(), "[redacted]")
        print(message, file=sys.stderr)
        sys.exit(1)
