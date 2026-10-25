# Survive Gus's PlayPlace — Design Document

A 3D first-person survival game in the spirit of Five Nights at Freddy's: Security Breach.
You play **Jonathan**, fifteen, the new night security guard at **Gus's PlayPlace**, a kids'
fun centre full of slides, arcade games and five singing animatronics. Survive twenty nights.

The game is designed by a nine-year-old. His ideas are the spec; this document turns them
into numbers. Where he made a call, it's noted below in **The designer's decisions**.

## Story

Jonathan needs a job. The PlayPlace needs a night guard. The manager makes it sound easy:
watch the cameras, fix what the kids broke, and if the animatronics wander off the stage, zap
them and drag them to Parts & Service — they're always back on stage by morning. Oh, and
don't let Gus find you if the power goes out.

The first time the lights flicker (Night 5), Gus turns his head to watch. After Night 10,
Jonathan goes home to sleep and the four of them follow him: he has to zap them all over
again in his own house and load them into the PlayPlace van, which takes them back. The
manager gives him a raise and doesn't ask. Gus never left the stage — he was waiting.

Night 20 is the reason for that warning: Gus goes haywire, the fuse boxes fry, and Jonathan
has to stop him with the Magnum. Beating him fixes his glitch, and the animatronics become
Jonathan's friends — just in time for Secret Night 21, when every broken part ever thrown in
the junk pile pulls itself together into the **Junk Monster**, and the friends fight it with
him.

## Tone

Scary like a haunted house is scary. The jumpscare is loud and in your face, the nights are
dark and quiet, and the music box means Gus is coming. But:

- The animatronics are robots. Zapped, they power down with a whirr and slump. Nothing
  bleeds, nothing breaks apart (except the Junk Monster, which was junk to begin with).
- Getting caught is "GOTCHA!" and a retry of the same night, never a death screen.
- Daytime is the opposite of night on purpose: bright, loud, full of kids, the five of them
  dancing on stage.

## The designer's decisions

Asked directly, he chose:

- **Title:** Survive Gus's PlayPlace.
- **Jumpscares:** super scary — the face rushes the screen with a scream.
- **Gus:** can't be knocked out, and only comes out when the power goes out at night. He
  frees the others from the junk room, senses you through walls, bosses the others into
  moving faster, and is super tough — only the Magnum works on him.
- **Night 20:** a boss fight against Gus, won with the Magnum.
- **After Night 20:** the animatronics become friends, and a secret Night 21 unlocks.
- **Night 21's boss:** a monster built from all the broken parts in the junk room.
- **On Night 21 the friends** fight the boss with you and fix games for you.

After playing the first build, he asked for:

- **A taser with three shots** before it has to recharge.
- **Cranker can't slide.** (His belly-slide is gone; he squeaks and never gives up instead.)
- **More story, with cutscenes.**
- **After Night 10, at daytime, you go home and they follow you** — you stop them and put
  them back in the PlayPlace.

His original brief also fixed: Jonathan is 15 and found the job opening; five animatronics
(Gus the platypus is the leader, Gerald the gorilla, Chomper the beaver, Cranker the penguin,
Flipper the dolphin); upbeat techno by day and eerie silence by night; cameras to spot
anything weird, then go out and investigate; tase animatronics and chuck them in the junk
room until morning; twenty nights, losing restarts the night; fix kid games with key presses
to raise a kids' happiness meter that makes nights easier; weapon upgrades over time ending
with the Magnum.

## The PlayPlace

A 60 × 44 m building on a 1 m grid ([js/map.js](js/map.js)). Rooms are rectangles with a
one-cell wall between neighbours; doors are carved openings.

| Room             | What's there                                                      |
|------------------|-------------------------------------------------------------------|
| Show Stage       | The stage (all five start here), the dining tables, Stage Lights  |
| Main Hall        | The corridor joining everything; the office opens off it          |
| Security Office  | Your desk and monitors, the flashlight charger, the time clock    |
| Lobby            | Front doors (locked), Gus's Spin Ride; the office's second door   |
| Kitchen          | Ice Cream Machine, a fuse box                                     |
| Parts & Service  | Shelves of spare heads, and the junk pile                         |
| Ball Pit         | The pit (slows you down), Ball Blower, a fuse box                 |
| Slide Tower      | The tower and its tube slides, Slide Lights                       |
| Party Room       | Karaoke Machine, birthday tables                                  |
| Arcade           | Three repairable cabinets among the rest, Air Hockey              |
| Prize Counter    | Claw Machine, Ticket Muncher, plushies of the five, a fuse box    |

The office has two doors — one to the hall, one to the lobby — and no way to close either.

### Cameras

Twelve, each a real camera in the building ([js/decor.js](js/decor.js) `cameras()`), rendered
live from where it hangs ([js/cameras.js](js/cameras.js)). The picture is brightened for
night vision, tinted green and slowly pans. Static rises when you switch, when something big
walks under the camera, and fills the screen when Chomper has chewed its cable (25 s) or the
power is out. Broken games seen on a camera get a ⚠ on its room in the map — you have to look
to find out. While you're on the monitor, a red alert warns you when something is within 8 m
of you, since you can't see behind you.

The three office monitors cycle through CAM 01 (stage), 07 and 08 (the halls outside).

## Jonathan

First person. Walks at 4.0 m/s, sprints at 6.6 with 5 s of stamina (run it dry and you're
winded until it's half full). Dragging an animatronic slows you to 2.9; the ball pit to 60%.

**Flashlight** (F): about 75 s of battery, slowly recharges while off and quickly in the
office. A dying battery flickers. Shining it on an animatronic gets its attention from much
farther away than it would otherwise notice you.

## Weapons and gear

Unlocked by reaching a night — the reward for surviving is the next tool. Numbers in
`WEAPONS` and `GEAR` ([js/config.js](js/config.js)).

| Item           | Night | What it does                                                              |
|----------------|-------|---------------------------------------------------------------------------|
| Taser          | 1     | 3.6 m, three zaps (0.35 s apart), then a 4 s recharge. Tops itself up one zap per 2.5 s while you're not zapping |
| Baseball       | 3     | Thrown, freezes an animatronic 3.5 s from range. 3 of them; walk over thrown balls to pick them up |
| Running Shoes  | 6     | Twice the stamina                                                         |
| Knife          | 7     | 2.3 m, one hit, 0.55 s between swings — no recharge, but get close       |
| Taser Mk II    | 9     | Taser range ×1.45, recharge and top-up twice as fast                     |
| Big Flashlight | 11    | Wider, brighter beam; battery lasts twice as long                        |
| Magnum         | 15    | 45 m, one shot powers anything down (freezes Gus 8 s). 6 shots a night. Loud: every awake animatronic comes to look |

## The animatronics

Each has one readable trick ([js/animatronics.js](js/animatronics.js), stats in
`ANIMATRONICS`).

| Name    | Species  | Zaps | Walk | Chase | Trick                                                         |
|---------|----------|------|------|-------|---------------------------------------------------------------|
| Cranker | Penguin  | 1    | 2.3  | 3.4   | Squeaky feet you can hear from 42 m away; once he's after you he takes twice as long to give up |
| Chomper | Beaver   | 1    | 3.0  | 4.4   | Goes looking for games to chew; chews camera cables (static)  |
| Gerald  | Gorilla  | 2    | 2.2  | 3.7   | Smashes games; the first zap only staggers him               |
| Flipper | Dolphin  | 1    | 3.2  | 4.8   | Sinks into the ball pit to hide; hears you sprint within 15 m |
| Gus     | Platypus | —    | 3.6  | 3.9+  | Only moves in a blackout (see below)                          |

Speeds scale with aggression level: ×(0.85 + 0.015 × level).

### How they think

Every animatronic is a physical thing walking the navigation grid (A*, smoothed by
string-pulling) — no teleporting, so the cameras never lie.

1. **On the stage** until its wake hour, then every 5 s it rolls a d20 against its aggression
   level (0–20). Nobody moves in the first 30 s of a night.
2. **Roam** to a destination: with probability 0.05 + 0.02 × level + 0.025 × hour it heads for
   wherever you are; chewers and smashers usually pick a working game; Flipper often picks
   the ball pit; otherwise a room it likes (×3 weight) or any other.
3. **Linger** 16 − 0.6 × level seconds (+ up to 4). Chomper and Gerald break the game they
   came for.
4. **Notice** you (0.45 s, head snaps round) if you're in its view cone within sight range
   with a clear line, within 2.6 m in any direction, sprinting within 7 m (15 for Flipper),
   or shining your flashlight on it.
5. **Chase**: straight at you when there's a clear line, pathing round otherwise. Out of sight
   for 5 s and it goes to search where it last saw you.
6. Within catching distance — **GOTCHA**.

Zapped to zero, it **powers down** for 28 s (scaled by the kids' mood, ×0.85 from night 12),
eyes flickering as it's about to wake. Press E to drag it; in Parts & Service press E again
to chuck it in the junk pile, where it stays all night. If it wakes in your arms, it shrugs
you off and you're dazed.

### Gus and the blackouts

From Night 5, the power goes out at random times between 1 and 5 AM (1, then 2 from Night 10,
3 from Night 16). Lights die, cameras show NO POWER, and one of the three fuse boxes trips —
the HUD says which. Then:

- 6 s later Gus steps off the stage and hunts you. He always knows where you are. A music box
  plays from wherever he is — louder means closer.
- Everyone else moves 25% faster while he's out.
- 10 s in, he wakes everyone in the junk pile.
- The taser, knife and baseball bounce off him. A Magnum shot freezes him for 8 s.

Fix the tripped fuse box (a long Rewire puzzle) and the lights come back, and Gus walks back
to the stage.

## Kids' happiness

0–100, starting at 50 ([js/config.js](js/config.js) `HAPPINESS`, `MOODS`). It carries from
night to night.

| Event                              | Change |
|------------------------------------|--------|
| Fix a game during the night        | +3     |
| A game still broken at 6 AM        | −4     |
| Every day of kids playing          | −3     |

| Mood        | Range  | Aggression levels | Power-down time |
|-------------|--------|-------------------|-----------------|
| Grumpy 😠   | 0–24   | +3                | ×0.75           |
| Bored 😐    | 25–49  | +1                | ×0.9            |
| Happy 🙂    | 50–74  | 0                 | ×1.0            |
| Super Happy 😄 | 75–100 | −2             | ×1.25           |

Games start each night already broken (1 + ⌈night/4⌉, max 6) and another breaks on its own
every 66 − 2.2 × night seconds (min 24), on top of what Chomper and Gerald wreck. By day, the
happier the kids, the more of them there are.

## Repairs

Walk up to a broken game and press E ([js/repair.js](js/repair.js)). The night keeps running
and you can't walk while you work — check the cameras first. Escape or a movement key gives
up. Difficulty level is 1 on night 1, +1 every four nights, up to 5.

| Puzzle            | Games                                       | How it scales                     |
|-------------------|---------------------------------------------|-----------------------------------|
| Rewire it!        | Arcade cabinets, Ice Cream, Ticket Muncher  | 4 + level arrows; from level 3 a mistake starts you over |
| Copy the lights!  | Stage Lights, Slide Lights, Karaoke         | 3 + level/2 lights, faster flashes |
| Hit the green!    | Claw, Air Hockey, Ball Blower, Spin Ride    | Smaller zone, faster needle; 3 hits |
| Fuse box          | The three fuse boxes                        | A Rewire with 2 extra arrows      |

## Cutscenes

The story is told in the game world itself ([js/cutscene.js](js/cutscene.js) plays them,
[js/story.js](js/story.js) holds the scripts): letterboxed shots with a moving camera,
characters walking and posing, and dialogue typed out with the speaker's name. Space or a
click finishes the line or moves on; Escape or Skip ends it. Jonathan and the manager appear
only here, built from the same parts as the daytime kids.

| Cutscene   | When                                  | What happens                                         |
|------------|---------------------------------------|------------------------------------------------------|
| intro      | Start of a new game                   | Jonathan takes the job; "don't let Gus find you"     |
| blackout   | Before Night 5 (first time)           | The lights flicker and Gus turns his head            |
| home       | After Night 10                        | He goes home to sleep — and hears squeaky feet       |
| homeDone   | House level cleared                   | The van drives them back; Jonathan gets a raise      |
| haywire    | Before Night 20 (first time)          | Gus's eyes go red and the fuse boxes fry             |
| gusDown    | Gus beaten                            | His glitch is gone; everyone's friends; the junk pile moves |
| junkRises  | Before Night 21 (first time)          | The Junk Monster climbs out of Parts & Service       |
| finale     | Junk Monster beaten                   | Employee of the Month                                |

## They followed me home

After Night 10's 6 AM, instead of the daytime at the PlayPlace, Jonathan goes home
([js/house.js](js/house.js)): a bedroom, bathroom, kitchen, hallway, living room and a garage
with the PlayPlace van backed in. It's a second building on the same grid system, 100 m east
of the PlayPlace; only one is ever visible. Cranker, Chomper, Gerald and Flipper are loose in
it (Gus stays on the stage — he only comes out in a blackout). Flipper hides in the bathtub.

There's no clock: zap all four and load each one into the back of the van (E near its open
doors). They wake up after the usual power-down time, so don't dawdle. Everyone is at
aggression level 8 (adjusted by the kids' mood) and starts moving after 6 seconds. Caught?
Try the house again. Done, and the van takes them back; then it's Night 11.

## A night

12 AM to 6 AM, one minute per hour. Each night starts with the manager's note (the tutorial —
it explains exactly what's new tonight) and a roster of who wakes when. You start at your desk.
At 6 AM: bells, the happiness report, then the daytime — walk around as long as you like and
clock in at the time clock in the office when you're ready. Caught: GOTCHA, then the same
night again from 12 AM with the happiness you started it with. The save only changes at 6 AM,
which is what makes that work.

## The twenty-one nights

Aggression levels per animatronic (0 = stays on the stage). Everyone wakes at midnight from
Night 6; before that Cranker wakes at 12 (1 AM on Night 1), the others at 1 AM (Gerald at 2 AM
on Night 3). `NIGHTS` in [js/config.js](js/config.js).

| Night | Title                  | Cranker | Chomper | Gerald | Flipper | Blackouts | Gus | New       |
|-------|------------------------|---------|---------|--------|---------|-----------|-----|-----------|
| 1     | First Shift            | 4       | –       | –      | –       | –         | –   | Taser     |
| 2     | Chewed Wires           | 5       | 3       | –      | –       | –         | –   |           |
| 3     | Heavy Footsteps        | 6       | 4       | 3      | –       | –         | –   | Baseball  |
| 4     | Something in the Balls | 6       | 5       | 4      | 3       | –         | –   |           |
| 5     | Lights Out             | 7       | 6       | 5      | 4       | 1         | 4   |           |
| 6     | Running Late           | 8       | 7       | 6      | 5       | 1         | 5   | Shoes     |
| 7     | Sharp Thinking         | 9       | 8       | 7      | 6       | 1         | 6   | Knife     |
| 8     | Smash Hour             | 10      | 9       | 8      | 7       | 1         | 7   |           |
| 9     | Supercharged           | 10      | 10      | 9      | 8       | 1         | 8   | Taser Mk II |
| 10    | Halfway There          | 11      | 11      | 10     | 9       | 2         | 9   |           |
| 11    | Bright Idea            | 12      | 11      | 11     | 10      | 2         | 10  | Big Flashlight |
| 12    | The Music Box          | 12      | 12      | 12     | 11      | 2         | 11  |           |
| 13    | Unlucky                | 13      | 13      | 12     | 12      | 2         | 12  |           |
| 14    | Overtime               | 14      | 13      | 13     | 13      | 2         | 13  |           |
| 15    | The Magnum             | 14      | 14      | 14     | 14      | 2         | 14  | Magnum    |
| 16    | Flicker                | 15      | 15      | 15     | 15      | 3         | 15  |           |
| 17    | No Sleep               | 16      | 16      | 15     | 16      | 3         | 16  |           |
| 18    | Full House             | 17      | 17      | 16     | 17      | 3         | 17  |           |
| 19    | The Last Normal Night  | 18      | 18      | 18     | 18      | 3         | 18  |           |
| 20    | Gus                    | 12      | 12      | 12     | 12      | all night | boss |          |
| 21★   | The Junk Monster       | friend  | friend  | friend | friend  | –         | friend |        |

## Bosses

**Night 20 — Gus.** No clock; the boss bar replaces it. The power is out from the start and
never comes back, the other four are bossed, and Gus hunts you from 3 s in. Only Magnum hits
hurt him: 15 to win, each freezing him 2 s (freezes don't stack). He speeds up at two-thirds
and one-third health (3.9 → 4.4 → 5.0 m/s). Four ammo crates (yellow glow, +6 shots, back
after 30 s) are spread around the building. When he falls, everyone else stops hunting you.

**Night 21 — the Junk Monster.** Rises out of the junk pile at midnight. 90 health; every
weapon works on it (taser 3, knife 2, baseball 1, Magnum 4). It hunts you like Gus, lobs
junk at where you're about to be (a hit dazes you), and swats any friend in its face. Gus,
Gerald and Cranker fight it (1.2 per hit); Chomper and Flipper fix games instead. At
two-thirds health it speeds up; at one-third it rips out the power and the friends' blue
eyes are the only lights left.

## Controls

Bindings live in `KEYMAP` ([js/config.js](js/config.js)) and reach players through the
control lists in the pause menu and How to Play, which render from the same table.

Movement is WASD only — the arrow keys belong to the repair puzzles and the camera monitor.
E uses whatever you're looking at (cameras, a broken game, a fuse box, a powered-down
animatronic, the junk pile, the time clock). Click uses your weapon; 1–4, Q or the wheel
switch. Losing the mouse (Escape) pauses the game. Touch: a floating stick on the left, look
on the right, buttons for weapon, E, flashlight, swap, sprint and pause; the monitor and
puzzles have their own on-screen buttons.

## File map

```
index.html        Canvas, HUD, camera monitor, repair panel, every menu, the import map
style.css         All styling
vendor/           Three.js r169, committed so there's nothing to install and no CDN
js/main.js        Boot, renderer setup, fixed-timestep loop
js/game.js        State machine and glue: title → story → day → card → night → morning
js/config.js      Every tuning number and content table — animatronics, weapons, nights
js/map.js         Floor plan, walls, collision, line of sight, A* navigation
js/decor.js       Furniture, kid games, fuse boxes, signs, cameras and room lights
js/textures.js    Every texture, painted onto canvases
js/models.js      Every character mesh and its poses, and Jonathan's hands
js/lighting.js    Day / night / blackout / title light rigs
js/player.js      Jonathan: movement, stamina, flashlight, camera
js/weapons.js     Taser, baseballs, knife, Magnum
js/animatronics.js  The five's AI, Gus's hunts, the friends, the Junk Monster
js/night.js       The clock, wake-ups, breakages, blackouts, bosses, the 6 AM report
js/day.js         Daytime: kids, music, the show
js/house.js       Jonathan's house: its floor plan, furniture and the van
js/cutscene.js    The cutscene player
js/story.js       Every cutscene script
js/machines.js    Broken/fixed state and looks for games and fuse boxes
js/repair.js      The three repair puzzles
js/cameras.js     The security monitor and office monitor feeds
js/hud.js         HUD updates and screen contents
js/touch.js       Phone and tablet controls
js/physics.js     Circle-vs-box sliding collision
js/audio.js       Synthesized sound, ambience, Gus's music box, and the music
js/save.js        localStorage profile
js/updates.js     Detects new deploys and refreshes stale sessions
js/version.js     Build version — bump on every deploy
dev/preview.html  Art preview: framed day/night shots of rooms and characters
```

## Debug handles

Load with `?debug=1` to get:

- `window.__game` — the running game. `__game.profile` is the save; `__game.night`,
  `__game.bots`, `__game.player`, `__game.machines` are the live state.
- `window.__input` — the input singleton.
- `window.__three` — the Three.js namespace.

Useful one-liners:

```js
__game.startNight(15);                       // jump to any night
__game.night.time = 355;                     // five seconds to 6 AM
__game.night.blackout();                     // lights out — here comes Gus
__game.machines.breakRandom();               // break a game
__game.bot('cranker').powerDown();           // zap one from the console
__game.profile.night = 20; __game.profile.best = 20;  // unlock the Gus fight
```

Note that `requestAnimationFrame` is paused whenever the tab is hidden, so stepping the game
from a background tab needs `__game.update(1/60)` called yourself.

## Save data

One profile in `localStorage` under `survive_gus_save_v1` — current night, kids' happiness,
whether the intro has been seen, whether the house level is done, which one-time cutscenes
have played, the two boss wins, the furthest night reached, and lifetime stats. It's merged over a fresh profile on load, so a save written by an older build never
arrives missing a field newer code reads, and it only changes at 6 AM (or a boss win).
