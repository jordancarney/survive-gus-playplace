#!/usr/bin/env python3
"""Sing the daytime song with the robot band.

Gus and the band sing a song over the daytime techno (TRACKS.day in js/audio.js). Until a real
person sings it with dev/record.html, the singing is a robot's, made here: macOS's built-in
voices (Fred, Ralph and Junior) say every syllable, and a channel vocoder re-sings each one on
its note of the melody, stretched to the note's length, so the words land exactly on the beat.
Robots singing, which is what animatronics should sound like.

It writes audio/song/line-<n>.m4a (one per line of the song, each starting on the line's first
bar) and js/song.js (the words, the notes, the song's form and how loud each line is 30 times
a second, for the animatronics' jaws). Change the words or the tune here, then run it again.
Pure Python plus the Mac's `say` and `afconvert`: nothing to install. Takes a minute or two.

Usage: python3 dev/sing.py
"""
import array
import json
import math
import random
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'audio' / 'song'
SR = 22050
BPM = 128
STEP = 60 / BPM / 4            # a sixteenth note, as in TRACKS.day
LINE_STEPS = 32                # every line is two bars
TAIL = 0.35                    # seconds of ring after the line's two bars
HOP = 105                      # analysis frame: 210 frames a second
FPS_JAW = 30

# Every line has seven syllables on the same rhythm: six eighth notes from beat 2, then a long
# note on the next bar's downbeat. (start step, length in steps) within the line's 32 steps.
RHYTHM = [(4, 2), (6, 2), (8, 2), (10, 2), (12, 2), (14, 2), (16, 8)]

# The words, how to say each syllable (spelled for the speech voice), and the tune (MIDI notes,
# written in the high octave; the robots sing lower). Odd lines sit on C–Am, even on F–G.
LINES = [
    ("Come on in, it's time to play!",     'come on in its time to play',         [64, 64, 67, 67, 69, 67, 64]),
    ('Pizza, games and fun all day!',      'peet suh games and fun all day',      [65, 65, 69, 69, 72, 69, 67]),
    ('Grab your friends and grab a slice!', 'grab your friends and grab uh slice', [64, 64, 67, 67, 72, 71, 69]),
    ("Gus's place is extra nice!",         'gus iz place is ex truh nice',        [69, 69, 72, 69, 67, 65, 67]),
    ("Hey, hey, hey, it's Gus's day!",     'hey hey hey its gus iz day',          [72, 72, 72, 67, 69, 71, 72]),
    ('Pizza, prizes, hip hooray!',         'peet suh pry zez hip hoo ray',        [72, 72, 69, 69, 72, 72, 74]),
    ('Ball pit, slides and games galore!', 'ball pit slides and games guh lore',  [72, 72, 72, 67, 69, 71, 72]),
    ('Everybody wants some more!',         'ev ree bah dee wants some more',      [72, 72, 69, 69, 72, 72, 67]),
    ("Gerald's on the big bass drum!",     'jer ulds on the big base drum',       [64, 64, 67, 67, 69, 67, 64]),
    ("Chomper's chewing bubble gum!",      'chom purrs chew ing bub bull gum',    [65, 65, 69, 69, 72, 69, 67]),
    ('Cranker dances, Flipper sings!',     'crank ur dan sez flip ur sings',      [64, 64, 67, 67, 72, 71, 69]),
    ('Gus the platypus is king!',          'gus the plat ih puss is king',        [69, 69, 72, 69, 67, 65, 67]),
]
CHORUS = {4, 5, 6, 7}

# The song's 48 bars (90 seconds), then round again: the line that starts on each bar.
# Intro, verse, chorus, a break, the band's verse, chorus, a longer break.
FORM = [-1] * 48
for bar, line in zip([4, 6, 8, 10, 12, 14, 16, 18, 24, 26, 28, 30, 32, 34, 36, 38],
                     [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 4, 5, 6, 7]):
    FORM[bar] = line

# The band: Gus's lead (Fred), the big low voices an octave under (Ralph), and on the chorus
# the little high ones (Junior). (voice, semitones from the written tune, gain, cents detune)
LEAD = ('Fred', -12, 1.0, 0)
LOW = ('Ralph', -24, 0.5, 0)
HIGH = ('Junior', 0, 0.3, 8)

# Vocoder bands: 18 of them, 200 Hz to 6.8 kHz.
BANDS = [200 * (6800 / 200) ** (i / 17) for i in range(18)]
Q = 3.0


def bandpass(fc):
    w = 2 * math.pi * fc / SR
    al = math.sin(w) / (2 * Q)
    a0 = 1 + al
    return al / a0, -al / a0, -2 * math.cos(w) / a0, (1 - al) / a0


FILTERS = [bandpass(f) for f in BANDS]
HI_BANDS = [i for i, f in enumerate(BANDS) if f >= 3000]


def read_wav(path):
    """Sample rate and samples (-1..1) of a 16-bit mono WAV."""
    b = path.read_bytes()
    i = 12
    while i + 8 <= len(b):
        cid, size = b[i:i + 4], int.from_bytes(b[i + 4:i + 8], 'little')
        if cid == b'data':
            a = array.array('h', b[i + 8:i + 8 + size - size % 2])
            return [x / 32768 for x in a]
        i += 8 + size + size % 2
    raise ValueError(f'no audio in {path}')


def write_wav(path, samples):
    a = array.array('h', (max(-32767, min(32767, int(x * 32767))) for x in samples))
    data = a.tobytes()
    head = (b'RIFF' + (36 + len(data)).to_bytes(4, 'little') + b'WAVEfmt ' + (16).to_bytes(4, 'little')
            + (1).to_bytes(2, 'little') + (1).to_bytes(2, 'little') + SR.to_bytes(4, 'little')
            + (SR * 2).to_bytes(4, 'little') + (2).to_bytes(2, 'little') + (16).to_bytes(2, 'little')
            + b'data' + len(data).to_bytes(4, 'little'))
    path.write_bytes(head + data)


_said = {}


def say(voice, text, tmp):
    """The voice saying one syllable: its band envelopes and how noisy each frame is."""
    key = (voice, text)
    if key not in _said:
        f = Path(tmp) / f'{voice}-{text}.wav'
        subprocess.run(['say', '-v', voice, '-o', str(f), '--file-format=WAVE',
                        f'--data-format=LEI16@{SR}', text], check=True)
        _said[key] = analyze(read_wav(f))
    return _said[key]


def analyze(s):
    nf = len(s) // HOP
    env = []
    for b0, b2, a1, a2 in FILTERS:
        x1 = x2 = y1 = y2 = 0.0
        e = [0.0] * nf
        i = 0
        for f in range(nf):
            acc = 0.0
            for k in range(i, i + HOP):
                x = s[k]
                y = b0 * x + b2 * x2 - a1 * y1 - a2 * y2
                x2 = x1; x1 = x; y2 = y1; y1 = y
                acc += y * y
            e[f] = math.sqrt(acc / HOP)
            i += HOP
        env.append(e)
    # trim the quiet at both ends
    tot = [sum(env[b][f] ** 2 for b in range(len(BANDS))) for f in range(nf)]
    peak = max(tot) if tot else 0
    a, z = 0, nf - 1
    while a < z and tot[a] < peak * 0.004:
        a += 1
    while z > a and tot[z] < peak * 0.004:
        z -= 1
    env = [e[a:z + 1] for e in env]
    noisy = []
    for f in range(a, z + 1):
        hi = sum(env[b][f - a] ** 2 for b in HI_BANDS)
        ratio = hi / (tot[f] or 1)
        noisy.append(min(1.0, max(0.0, (ratio - 0.25) / 0.35)))
    return env, noisy


def stretch_map(m, n):
    """For each of n output frames, which (fractional) frame of an m-frame syllable to use.
    The consonants at the start and end keep their speed; the vowel in the middle stretches
    (or squeezes) to fill the note."""
    if m <= 1:
        return [0.0] * n
    a = min(9, m * 0.25)
    r = min(12, m * 0.3)
    if n <= a + r + 2:
        return [j * (m - 1) / max(1, n - 1) for j in range(n)]
    out = []
    for j in range(n):
        if j < a:
            p = j
        elif j >= n - r:
            p = m - 1 - (n - 1 - j)
        else:
            p = a + (j - a) * (m - 1 - r - a) / (n - r - a)
        out.append(min(m - 1.0, max(0.0, p)))
    return out


def sing_layer(syllables, notes, voice, transpose, detune, nsamp, tmp, rng):
    nframes = nsamp // HOP + 2
    env = [[0.0] * nframes for _ in BANDS]
    noisy = [0.0] * nframes
    freq = [0.0] * nsamp
    prev_f = None
    for (start, length, midi), syl in zip(notes, syllables):
        senv, snoisy = say(voice, syl, tmp)
        f0 = 440 * 2 ** ((midi + transpose - 69 + detune / 100) / 12)
        s0 = round(start * STEP * SR)
        dur = length * STEP - (0.05 if length > 2 else 0.03)
        f_start = s0 // HOP
        n = max(2, round(dur * SR / HOP))
        m = len(snoisy)
        for j, p in enumerate(stretch_map(m, n)):
            i0 = int(p); i1 = min(m - 1, i0 + 1); fr = p - i0
            fo = f_start + j
            if fo >= nframes:
                break
            for b in range(len(BANDS)):
                env[b][fo] = senv[b][i0] * (1 - fr) + senv[b][i1] * fr
            noisy[fo] = snoisy[i0] * (1 - fr) + snoisy[i1] * fr
        # the pitch: a quick slide from the last note, then vibrato on long notes
        end = round((start + length) * STEP * SR)
        glide = int(0.03 * SR)
        for k in range(s0, min(nsamp, end if length <= 2 else nsamp)):
            t = (k - s0) / SR
            f = f0
            if prev_f and k - s0 < glide:
                f = prev_f * (f0 / prev_f) ** ((k - s0) / glide)
            if dur > 0.4 and t > 0.22:
                depth = min(1.0, (t - 0.22) / 0.3) * 0.3
                f *= 2 ** (depth * math.sin(2 * math.pi * 5.5 * t) / 12)
            freq[k] = f
        prev_f = f0
    first = next((f for f in freq if f), 200)
    for k in range(nsamp):
        if freq[k]:
            break
        freq[k] = first
    last = first
    for k in range(nsamp):
        if freq[k]:
            last = freq[k]
        else:
            freq[k] = last

    # the carrier: a band-limited buzz at the note's pitch, turning to hiss on "s" and "t"
    car = [0.0] * nsamp
    ph = 0.0
    # (a sawtooth: every band gets evened out below, so its slope doesn't matter)
    for k in range(nsamp):
        dt = freq[k] / SR
        ph += dt
        if ph >= 1:
            ph -= 1
        s = 2 * ph - 1
        if ph < dt:
            t = ph / dt
            s -= t + t - t * t - 1
        elif ph > 1 - dt:
            t = (ph - 1) / dt
            s -= t * t + t + t + 1
        u = noisy[k // HOP]
        car[k] = s * 0.5 * (1 - u) + (rng.random() * 2 - 1) * (u * 0.35 + 0.004)

    # every band of the carrier, shaped by the voice's loudness in that band
    out = [0.0] * nsamp
    for bi, (b0, b2, a1, a2) in enumerate(FILTERS):
        e = env[bi]
        x1 = x2 = y1 = y2 = 0.0
        g_prev = 0.0
        power = None
        for f in range(nframes):
            i0 = f * HOP
            if i0 >= nsamp:
                break
            i1 = min(nsamp, i0 + HOP)
            buf = []
            acc = 0.0
            for k in range(i0, i1):
                x = car[k]
                y = b0 * x + b2 * x2 - a1 * y1 - a2 * y2
                x2 = x1; x1 = x; y2 = y1; y1 = y
                buf.append(y)
                acc += y * y
            # how loud the carrier is in this band, smoothed so the gain doesn't jitter
            p = acc / (i1 - i0)
            power = p if power is None else power * 0.6 + p * 0.4
            g = e[f] / (math.sqrt(power) + 0.003)
            step = (g - g_prev) / len(buf)
            gg = g_prev
            for j, y in enumerate(buf):
                gg += step
                out[i0 + j] += y * gg
            g_prev = g
    return out


def loudness(s):
    step = SR // FPS_JAW
    rms = [math.sqrt(sum(x * x for x in s[i:i + step]) / step) for i in range(0, len(s) - step + 1, step)]
    loud = sorted(rms)[int(len(rms) * 0.95)] or 1
    floor = loud * 0.12
    return ''.join(str(round(9 * min(1, max(0, (r - floor) / (loud * 0.9 - floor))))) for r in rms)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    nsamp = round((LINE_STEPS * STEP + TAIL) * SR)
    notes_of = lambda tune: [(st, ln, m) for (st, ln), m in zip(RHYTHM, tune)]
    rendered = []
    with tempfile.TemporaryDirectory() as tmp:
        for i, (text, said, tune) in enumerate(LINES):
            rng = random.Random(i)
            syl = said.split()
            assert len(syl) == len(RHYTHM) == len(tune), text
            layers = [LEAD, LOW] + ([HIGH] if i in CHORUS else [])
            mix = [0.0] * nsamp
            for voice, tr, gain, det in layers:
                part = sing_layer(syl, notes_of(tune), voice, tr, det, nsamp, tmp, rng)
                for k in range(nsamp):
                    mix[k] += part[k] * gain
            rendered.append(mix)
            print(f'  sung {i + 1:2}: {text}')
        # One volume for every line: loud enough to sing over the techno, with the few
        # sharpest peaks rounded off rather than clipped.
        every = sorted(abs(x) for m in rendered for x in m if x)
        gain = 0.8 / (every[int(len(every) * 0.999)] or 1)

        def limit(x):
            a = abs(x)
            return x if a < 0.7 else math.copysign(0.7 + 0.25 * math.tanh((a - 0.7) / 0.25), x)

        envs = []
        for i, mix in enumerate(rendered):
            fade = int(0.02 * SR)
            s = [limit(x * gain) * min(1, (nsamp - 1 - k) / fade) for k, x in enumerate(mix)]
            wav = Path(tmp) / f'line-{i + 1}.wav'
            write_wav(wav, s)
            subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '64000', str(wav),
                            str(OUT / f'line-{i + 1}.m4a')], check=True)
            envs.append(loudness(s))
    js = ['// Written by dev/sing.py: the daytime song Gus and the band sing over TRACKS.day in audio.js.',
          '// form: for each of the song\'s 48 bars, the line that starts there (-1: none). Every line',
          '// is two bars; its robot singing is audio/song/line-<n>.m4a and a real recording of it is',
          '// voice id song-<n>. notes: [start step, length in steps, MIDI] within the line. env: how',
          f'// loud the robots sing it, {FPS_JAW} times a second (0-9), for the jaws.',
          'export const SONG = {',
          f'  bpm: {BPM},',
          f'  lineSteps: {LINE_STEPS},',
          f'  form: [{", ".join(str(x) for x in FORM)}],',
          '  lines: [']
    for (text, _, tune), env in zip(LINES, envs):
        notes = ', '.join(f'[{st}, {ln}, {m}]' for st, ln, m in notes_of(tune))
        js.append(f'    {{ text: {json.dumps(text)}, notes: [{notes}],\n      env: \'{env}\' }},')
    js += ['  ],', '};', '']
    (ROOT / 'js' / 'song.js').write_text('\n'.join(js))
    print(f'{len(LINES)} lines sung into {OUT.relative_to(ROOT)}/ and js/song.js')


if __name__ == '__main__':
    main()
