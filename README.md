# 🔦 Survive Gus's PlayPlace — Jonathan's Night Shift

### ▶ [Play it](https://jordancarney.github.io/survive-gus-playplace/)

A game my kid is making, inspired by Five Nights at Freddy's: Security Breach. A 3D survival
game starring **Jonathan**, fifteen, who takes the night security job at **Gus's PlayPlace**:
watch the cameras, fix the kids' games, zap the animatronics, and survive twenty nights.

Plays with mouse and keyboard on desktop and touch on phones and tablets. Click the game to
capture the mouse; the full control list is in the pause menu, and touch controls appear on
their own the first time you touch the screen. Landscape is recommended, and it works nicely
added to a home screen.

It's spooky on purpose, and the jumpscares are loud (the designer asked for super scary), but
nothing is gory: a zapped animatronic just powers down with a sad whirr, and getting caught
means starting the night over.

## Features

- Gus's PlayPlace in 3D: a show stage, dining hall, arcade, ball pit, slide tower, party room,
  prize counter, kitchen and the dreaded Parts & Service room. By day it's full of kids and
  upbeat techno; at night it's silent except for the footsteps
- Twelve live security cameras with night vision, slow pans and static. What you see on a
  camera is exactly where an animatronic is, and anything broken gets marked on the map
- Five animatronics, each with one trick you can learn: **Cranker** the penguin squeaks when
  he walks and never gives up, **Chomper** the beaver chews wires, **Gerald** the gorilla
  takes two zaps, **Flipper** the dolphin hides in the ball pit and hears you running, and
  **Gus** the platypus
- A taser with three zaps before it needs to recharge. Zap them, then drag them to the junk
  pile in Parts & Service, where they stay until morning
- Broken kid games to fix with arrow-key puzzles. Happy kids make happy animatronics, so the
  Kids' Happiness meter makes every night easier or harder
- Blackouts: when the power goes out, Gus leaves the stage. He senses you through walls,
  bosses the others into moving faster, frees everyone from the junk room, and nothing stops
  him except the Magnum. Find the fuse box that tripped before he finds you
- New gear as the nights go on: a baseball, running shoes, a knife, a stronger taser, a bigger
  flashlight, and finally the Magnum
- A story told in cutscenes: getting the job, the night Gus first turns his head, the boss
  fights, and how it all ends
- After Night 10 Jonathan goes home to sleep — and they follow him. Zap them all through his
  house and load them into the PlayPlace van to send them back
- A boss fight with Gus on Night 20, and a secret Night 21 where your new animatronic friends
  help you take down the Junk Monster
- A manager's note before every night teaches whatever is new tonight
- Saves automatically at 6 AM, and you can replay any night you've reached

## Built with

Vanilla JavaScript ES modules and [Three.js](https://threejs.org) for WebGL. No build step
and nothing to install — Three.js is committed in [vendor/](vendor/) and loaded through an
import map, so the game works offline and doesn't depend on a CDN. There are no model,
texture or audio files either: every mesh is built from primitives in code, every texture is
painted onto a canvas at startup, and every sound (the techno included) is synthesized at
runtime.

## Run locally

ES modules can't load from `file://`, so serve the folder. Use the included dev server —
it disables caching, which plain `http.server` does not (browsers will happily serve you
stale JS after an edit otherwise):

```bash
python3 dev_server.py 8642
```

Then open http://localhost:8642 — or use `npx serve`, VS Code Live Server, etc.

Open with `?debug=1` for dev handles; [DESIGN.md](DESIGN.md) lists them.

## Deploys

The repo root is the site — no build step, no dependencies:

1. Push to `main`.
2. Repo **Settings → Pages → Source**: deploy from a branch, `main`, `/ (root)`.
3. The game is live at https://jordancarney.github.io/survive-gus-playplace/.

Every push to `main` publishes automatically. All asset paths are relative, so it works
from a subpath like `/survive-gus-playplace/` without configuration. The `.nojekyll` file
tells Pages to publish the files as-is instead of running them through Jekyll.

### Releasing an update

**Bump `VERSION` in [js/version.js](js/version.js) as part of the deploy.** Live sessions
poll that file with caching disabled (on load, every 10 minutes, and whenever the tab is
foregrounded) and reload themselves when it changes — immediately on the menus or by day,
or deferred until the current night ends. This is what rescues a phone/iPad tab that's been
open since before the deploy; without the bump, devices still update, but only after their
normal cache expiry and a manual reload. The running build is stamped in the corner of the
title screen.

## Project layout

See [DESIGN.md](DESIGN.md) for the full design document — the PlayPlace, the animatronics,
the twenty-one nights, balance tables, and the file map.
