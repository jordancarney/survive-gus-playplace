#!/usr/bin/env python3
"""Add recorded voice lines to the game.

dev/record.html saves each take to the Downloads folder as gus-voice-<id>.wav. This turns
every one it finds into audio/voices/<id>.m4a (AAC: small, and it plays in every browser)
with macOS's built-in afconvert, then rewrites js/recorded.js to list every line that has a
recording, with how loud it is 30 times a second (for the speaker's mouth). When a line was
saved more than once, the newest take wins. The .wav files are left where they are.

Usage: python3 dev/add_voices.py [folder]   (default ~/Downloads)
"""
import array
import math
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'audio' / 'voices'
# Browsers add " (1)", "-1" and so on when a file of that name is already there.
NAME = re.compile(r'^gus-voice-([A-Za-z]+-\d+)(?: ?\(\d+\)|-\d+)?\.wav$')


FPS = 30


def read_wav(path):
    """Sample rate and 16-bit mono samples. (afconvert writes the extensible WAV header,
    which Python's wave module can't read.)"""
    b = path.read_bytes()
    i, rate = 12, None
    while i + 8 <= len(b):
        cid, size = b[i:i + 4], int.from_bytes(b[i + 4:i + 8], 'little')
        if cid == b'fmt ':
            rate = int.from_bytes(b[i + 12:i + 16], 'little')
        if cid == b'data':
            return rate, array.array('h', b[i + 8:i + 8 + size - size % 2])
        i += 8 + size + size % 2
    raise ValueError(f'no audio in {path}')


def loudness(m4a):
    """How loud the recording is, FPS times a second, as a string of digits 0-9."""
    with tempfile.TemporaryDirectory() as tmp:
        wav_path = Path(tmp) / 'line.wav'
        subprocess.run(['afconvert', '-f', 'WAVE', '-d', 'LEI16', '-c', '1', str(m4a), str(wav_path)], check=True)
        rate, samples = read_wav(wav_path)
    step = rate // FPS
    rms = [math.sqrt(sum(x * x for x in samples[i:i + step]) / step) / 32768
           for i in range(0, len(samples) - step + 1, step)]
    if not rms:
        return ''
    loud = sorted(rms)[int(len(rms) * 0.95)] or 1
    floor = loud * 0.12
    return ''.join(str(round(9 * min(1, max(0, (r - floor) / (loud * 0.9 - floor))))) for r in rms)


def main():
    src = Path(sys.argv[1]).expanduser() if len(sys.argv) > 1 else Path.home() / 'Downloads'
    newest = {}
    for f in src.iterdir():
        m = NAME.match(f.name)
        if m and (m.group(1) not in newest or f.stat().st_mtime > newest[m.group(1)].stat().st_mtime):
            newest[m.group(1)] = f
    OUT.mkdir(parents=True, exist_ok=True)
    for vid, f in sorted(newest.items()):
        subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '96000', str(f), str(OUT / f'{vid}.m4a')],
                       check=True)
        print(f'  {vid}  ←  {f.name}')
    files = sorted(OUT.glob('*.m4a'))
    (ROOT / 'js' / 'recorded.js').write_text(
        '// Written by dev/add_voices.py: every voice line that has a recording in audio/voices/,\n'
        f'// and how loud it is {FPS} times a second (0-9), for the speaker\'s mouth.\n'
        'export const RECORDED = {\n' + ''.join(f"  '{f.stem}': '{loudness(f)}',\n" for f in files) + '};\n')
    print(f'{len(newest)} added, {len(files)} lines recorded in all.')


if __name__ == '__main__':
    main()
