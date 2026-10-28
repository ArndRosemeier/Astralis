"""Compose the original ethereal discovery cue with Python's standard library.

No sampled bells, external recordings, API calls, or runtime synthesizer required.
Run: python docs/assets/ethereal_cue.py
"""
from array import array
import hashlib
import json
import math
from pathlib import Path
import random
import sys
import wave

ROOT = Path(__file__).resolve().parents[2]
RATE = 44100
DURATION = 3.4
COUNT = round(RATE * DURATION)
TAU = math.tau


def envelope(t, onset, attack, release):
    age = t - onset
    if age <= 0:
        return 0.0
    # Rounded attack: no struck transient or sharp bell partials.
    return (1 - math.exp(-age / attack)) ** 2 * math.exp(-age / release)


def compose():
    rng = random.Random(20261028)
    left, right = array('d'), array('d')
    air = slow_air = 0.0
    # An open D/A/E voicing, gently staggered so it blooms rather than rings.
    voices = [(146.832, 0, .36, 1.05, .8), (220, .10, .42, 1.0, .43),
              (293.665, .20, .48, .95, .32), (329.628, .30, .54, .9, .13),
              (440, .38, .60, .8, .09), (587.33, .46, .64, .75, .035)]
    for i in range(COUNT):
        t = i / RATE
        # A restrained, band-limited breath behind the harmonic cloud.
        air += .085 * (rng.uniform(-1, 1) - air)
        slow_air += .012 * (air - slow_air)
        breath = (air - slow_air) * envelope(t, 0, .4, .65) * .18
        l = r = breath
        for j, (hz, onset, attack, release, gain) in enumerate(voices):
            amp = gain * envelope(t, onset, attack, release)
            phase = TAU * hz * t + .12 * math.sin(TAU * .24 * t + j)
            # Small, opposite detuning gives width without a bright chorus effect.
            l += amp * (math.sin(phase) + .28 * math.sin(phase - TAU * .24 * t))
            r += amp * (math.sin(phase) + .28 * math.sin(phase + TAU * .24 * t))
        left.append(l)
        right.append(r)
    # Diffuse, cross-fed reflections with no feedback or unbounded tails.
    wet_l, wet_r = array('d', left), array('d', right)
    for delay, gain in [(0.097, .20), (.173, .15), (.281, .12), (.419, .09), (.617, .06)]:
        offset = round(delay * RATE)
        for i in range(offset, COUNT):
            wet_l[i] += right[i-offset] * gain
            wet_r[i] += left[i-offset] * gain
    for i in range(COUNT):
        tail = min(1.0, max(0.0, (DURATION - i / RATE) / 1.1))
        fade = math.sin(tail * math.pi / 2) ** 2
        wet_l[i] *= fade
        wet_r[i] *= fade
    peak = max(max(abs(x) for x in wet_l), max(abs(x) for x in wet_r))
    rms = math.sqrt(sum(l*l+r*r for l, r in zip(wet_l, wet_r)) / (COUNT*2))
    gain = min(.24 / peak, .063 / rms)
    samples = array('h')
    for l, r in zip(wet_l, wet_r):
        samples.extend((round(l*gain*32767), round(r*gain*32767)))
    if sys.byteorder != 'little':
        samples.byteswap()
    return samples.tobytes(), peak*gain, rms*gain


if __name__ == '__main__':
    pcm, peak, rms = compose()
    target = ROOT / 'public/assets/discovery-ethereal.wav'
    with wave.open(str(target), 'wb') as output:
        output.setnchannels(2)
        output.setsampwidth(2)
        output.setframerate(RATE)
        output.writeframes(pcm)
    with wave.open(str(target), 'rb') as check:
        assert check.getnframes() == COUNT
        assert len(check.readframes(COUNT)) == len(pcm)
    metadata = {'asset': str(target.relative_to(ROOT)).replace('\\', '/'),
                'method': 'Original local additive synthesis, filtered noise and diffuse stereo reflections',
                'generator': 'docs/assets/ethereal_cue.py', 'model': None, 'cost_usd': 0,
                'description': 'An ethereal open-fifth bloom with rounded onset and a fading airy tail; no bell strike.',
                'duration_seconds': DURATION, 'sample_rate': RATE, 'channels': 2, 'bits_per_sample': 16,
                'peak_dbfs': round(20*math.log10(peak), 2), 'rms_dbfs': round(20*math.log10(rms), 2),
                'sha256': hashlib.sha256(target.read_bytes()).hexdigest(), 'pcm_readback': 'passed'}
    (ROOT / 'docs/assets/discovery-ethereal.json').write_text(json.dumps(metadata, indent=2)+'\n', encoding='utf-8')
    print(json.dumps(metadata, indent=2))
