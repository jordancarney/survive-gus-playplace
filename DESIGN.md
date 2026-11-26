# Survive Gus's PlayPlace — Design Document

A 3D first-person survival game in the spirit of Five Nights at Freddy's: Security Breach.
You play **Jonathan**, fifteen, the new night security guard at **Gus's PlayPlace**, a kids'
fun centre full of slides, arcade games and five singing animatronics. Survive twenty nights.

The game is designed by a nine-year-old. His ideas are the spec; this document turns them
into numbers. Where he made a call, it's noted below in **The designer's decisions**.

## Story

Jonathan needs a job. The PlayPlace needs a night guard. The manager makes it sound easy:
watch the cameras, fix what the kids broke — the animatronics just stand on the stage all
night, and nothing ever happens here. **Nobody knows they move at night.** Not the manager,
not anyone.

Then, on his first night, Jonathan hears squeaky footsteps. Cranker is off the stage. Stuck
under the office desk is a note from the **old night guard**, who knew all along and quit:
they walk at night; zap them, drag them to Parts & Service and throw them on the junk pile;
keep the kids happy; and if the power ever goes out, don't let Gus find you. From then on
every night card is a page of his notebook, and the gear he left behind turns up in the
office.

The first time the lights flicker (Night 2), Gus turns his head to watch. After Night 10,
Jonathan goes home to sleep and the four of them follow him: he has to zap them all over
again in his own house and load them into the PlayPlace van, which takes them back. The
manager gives him a raise and doesn't ask. Gus never left the stage — he was waiting.

On Night 2 there's a kid crying in the ball pit: **Timmy**, who fell asleep there and woke up
alone. He sticks behind Jonathan until morning, and the next day remembers his gramma's
number; Jonathan calls her from the office phone and she comes to pick him up.

On Day 11, back from the house, the manager has a surprise: while Jonathan was home they
built a whole **new wing** — a Mega Arcade, a go-kart track, laser tag and a giant play maze.
Twice the fun. And two new animatronics live out there: **Moony**, a possessed Gus, in Laser
Tag, and **Sunny**, made of fog, in the Play Maze. A lot more places for them to hide.

Night 20 is the reason for that warning: Gus goes haywire, the fuse boxes fry, and Jonathan
has to stop him with the Magnum. Beating him fixes his glitch, and the animatronics become
Jonathan's friends. Then, on Secret Night 21, the junk pile pulls all five of them in and
spits out one **Junk Monster** — Gerald's body, Gus's head with Chomper's and Cranker's on its
shoulders, Flipper's face in its belly. The **old originals**, retired to Parts & Service under
dust sheets years ago, wake up and fight it with Jonathan. When it falls apart, the five pop
back out.

(After the very end, one more scene: **Old John**, the old night guard, comes to the office.
He tells Jonathan the secret — years ago lightning hit the sign in the middle of a blackout,
and the next night they walked; Gus's music box was playing when it hit and has never
stopped; Moony was built from Gus's old parts in the junk pile; and nobody knows where Sunny
came from — then gives him his gold badge, which shows on the title screen from then on.)

## Tone

Scary like a haunted house is scary, and on realistic graphics it looks like a real place:
old fur suits, grubby floors, a flashlight beam full of dust. The jumpscare is loud and in your face, the nights are
dark and quiet, and the music box means Gus is coming. But:

- The animatronics are robots. Zapped, they power down with a whirr and slump. Nothing
  bleeds, nothing breaks apart (except the Junk Monster, which was junk to begin with).
- Getting caught is "GOTCHA!" and a retry of the same night, never a death screen.
- Daytime is the opposite of night on purpose: bright, loud, full of kids, the five of them
  dancing on stage and singing a happy song.

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

After the second build, he asked for:

- **All of them combine to make the Junk Monster** — and on Night 21, "the old versions of
  the animatronics fight with you while the new ones attack you."
- **On Night 2 you meet a kid** who lost his parents and follows you. The next day he gives
  you his gramma's phone number, you type it on the keyboard, and she picks him up. He's
  **Timmy**; the number is **145-247-3719**; and the animatronics **try to catch him too**.

After the third build, he asked for:

- **Graphics that look like real life** — everything, not just one thing. Up close the
  animatronics are **old furry costumes, worn and dirty, like FNAF 1**, and the **nights are
  darker** so the flashlight matters more. Then: **make the day less bright**.
- **No zapping them before they wake up.** Asleep on the stage, the zap just bounces off.

After the fourth build, he asked for:

- **A Settings tab in the bottom middle** of the title screen, with the graphics and **Easy,
  Medium and Hard**. Asked what should change, he picked all four: how fast they move, how
  often they leave the stage, how long your gear lasts, and a **second chance** on Easy (the
  first time you're caught each night, you get away). Settings are on the title screen only,
  and **every night beaten on Hard gets a ⭐**. Then: **put How to Play in Settings** too.
- **Before you, nobody knows the animatronics wander at night.** Jonathan **hears footsteps
  first**, then finds a **note from the old night guard** in the office that tells him what
  to do.
- **Jonathan and Timmy talk out loud** in the cutscenes: Jonathan like a regular teenager,
  Timmy with a high little-kid voice.
- **The voices should sound like real life** — so they're **recorded by real people**
  instead of a computer voice.
- **A debug mode where you can play all the nights, like in Ship Dash.**
- **Make the mouths move when they talk.**
- **A crouch where the animatronics can't see you, except Gus — but you can't zap or
  carry.** Asked what happens if one walks right into you while you're crouching: **it walks
  past.** (Changed later: **bumping into one while crouching gets you caught.**)
- **Timmy has a bowl cut.**
- **On Day 11 the place gets a lot bigger:** a **new wing** the manager built while Jonathan
  was home, with all four rooms offered — **laser tag, a go-kart track, a giant play maze and
  a second arcade.**
- **Two new animatronics in the new wing, each living there**, with **Laser Tag made a lot
  bigger** and the **Play Maze made a real, giant maze.** His own designs: **Moony, the
  possessed Gus,** lives in Laser Tag — only the Magnum stops him, and he teleports; **Sunny,
  made of fog,** lives in the Play Maze, which is foggy — she hides in the fog (you only see
  her in your flashlight) and drifts through the walls.
- **A Gallery tab next to Settings** with the pictures taken while making the game.
- **Make Sunny's head fog too.**
- **Make Sunny and Moony always awake.**
- **Make Timmy's crying sound better** — a real sobbing cry instead of beeps, and it can be
  recorded like the voices.

- **After Night 21 you meet the old night guard:** **Old John** — "first option but name is
  old john": a grumpy old man with a grey beard, his old faded uniform and a cane. Asked what
  happens, he chose both: he **tells the secret** of how it all started, **and gives you his
  badge.**
- **The title screen says seven animatronics** now, not five.
- **Rename Easy, Medium and Hard to Spooky, Horror and Nightmare,** and "if you're in
  Nightmare mode everything is 50× more scary, even the title screen — like the title is
  curved down and dripping black liquid and worn down." Then: the Nightmare tagline is
  **"Nobody makes it out alive,"** and the title song **whispers** instead of a heartbeat.
  Then: **"on Horror make it a little scarier."**

Bugs he found and had fixed: on an iPad you always ran when you tried to walk; and an
animatronic you'd zapped got back up behind the menu after you were caught. Later: **"the
animatronic tails aren't aligned"** — they floated behind the legs, under the body. Every
tail now grows out of the small of the back (`tailRoot` in [js/models.js](js/models.js)) and
leans with the body: Gus, Moony and the baby Gus's, Chomper, Flipper (a tail with a fluke on
the end now), the Junk Monster, DJ Rocco, Sparky, Pjork and Peter.
- **On Easy: unlimited flashlight, taser zaps and running, and no power outages until
  Night 10.**
- **Make the power go out more:** "once every night starting on night 2". Nights 2–4 now
  have a blackout each (Gus comes out), the flicker cutscene moved to Night 2, and the later
  nights keep their two and three.

After the fifth build, he asked for:

- **A 2 Players button: split screen, one player on the arrow keys and one on WASD and the
  trackpad**, in **everything** — the players pick which game to play. Asked the rest, he
  chose: since a laptop has one trackpad, the arrow-keys player **turns with the arrows, or
  uses a game controller if one's plugged in (both ways)**; the two are **on the same team**;
  when one is caught they're **out until morning** and the other survives alone; the screen
  splits **side by side or top and bottom, the players' choice**; in Max's bedroom and
  Jackson's office they **split the doors**; and in the Pizzaplex, **player 1 is whoever the
  chapter's about**. Player 2 is always **"Jimmy, who is 5 and likes space"**: **Jonathan's
  little brother, in an astronaut suit**.
- **Make Thomas look less fat.** (His baggy sweatshirt hangs loose now instead of puffing out.)
- **Fix the crouching animation** — the other player squished flat when they crouched. Then:
  **"the crouching looks weird"** — with no knees, they sat on thin air. The players' bodies
  have knees now (`addKnees` in models.js), and crouching is a real squat.
- **Emotes, by pressing T or up on the controller.** Asked which, he picked all four offered
  (wave, dance, thumbs up, point and scream) "plus the worm and chicken and spinning on your
  head"; **you see yourself** while you do one; and you pick from an **emote wheel**. Then:
  **on point and scream, "make your mouth open so wide it covers your whole face and make a
  high pitched scream."**
- **"Make emotes and 2 player work on mobile."** Asked how two people play on one phone or
  iPad, he picked **"Screen + controller"**: Jonathan is the touch screen, and Jimmy has a
  game controller (like the PS5 one). Emotes got a 😀 button.
- **"Fix on mobile where gallery and settings can cover other options."** On a phone the
  Gallery and Settings tabs sat on top of the title's buttons. Now they come after the
  buttons, and the title scrolls.
- **"Its hard to get out of 2 player."** Turning it off used to mean opening the 2 Players
  screen and picking 1 Player. Now there's a one-tap **👤 Back to 1 player** beside **2
  Players: ON** on the main menu, and in the pause menu while two are playing.
- **"Make the daytime music have words like in FNAF."** Asked the rest, he chose: **Gus and
  the band sing it, all five together on the stage**; the words are **just happy** (pizza,
  games and fun, nothing creepy); **"robot now, real later"**: robots sing it straight away,
  and a real person's recording takes over once someone sings it; and it plays **in the
  daytime at the PlayPlace and on the jukebox at When Jonathan Was Five's pizza place**. See
  [The daytime song](#the-daytime-song).
- **"Add gus tokens where you get 1 per arcade machene and quests and make a shop to get stuff
  like a gus mask and other things like a one use genorator."** The Shop is on the **main
  menu** (a tab beside Gallery and Settings). Asked the rest, he chose: **every fixed game
  counts**, not just the arcade ones; the Gus mask **fools everyone but Gus**, **15 seconds at
  a time**, then you take it off to breathe; the generator comes in **different types**
  (lights back on in a blackout, a full charge, the doors shut). He picked everything offered
  for the rest of the Shop (a **balloon decoy**, an **extra life**, **hats**, **new emotes**)
  plus **a skateboard and glow sticks**. The hats: **party hat, Gus cap, crown and propeller
  beanie**. The emotes: **the floss, the robot, a backflip and falling asleep, plus "one where
  you eat a piece of pizza and say noice."** See [Gus tokens and the Shop](#gus-tokens-and-the-shop).

His original brief also fixed: Jonathan is 15 and found the job opening; five animatronics
(Gus the platypus is the leader, Gerald the gorilla, Chomper the beaver, Cranker the penguin,
Flipper the dolphin); upbeat techno by day and eerie silence by night; cameras to spot
anything weird, then go out and investigate; tase animatronics and chuck them in the junk
room until morning; twenty nights, losing restarts the night; fix kid games with key presses
to raise a kids' happiness meter that makes nights easier; weapon upgrades over time ending
with the Magnum.

## The PlayPlace

A 60 × 44 m building on a 1 m grid ([js/map.js](js/map.js)), 97 × 44 once the new wing
opens. Rooms are rectangles with a one-cell wall between neighbours; doors are carved
openings.

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

### The new wing (Day 11 on)

East and south of the Arcade and the Prize Counter (the grid grew to 111 × 79). It's always
built, but until Day 11 its two
doorways are boarded up — plywood, hazard tape and a NEW WING · COMING SOON! sign — and
`Building.setWingOpen` makes those cells wall for walking, seeing and pathfinding. From Day
11 (`profile.night >= 11`, and any night 11 or later from Pick a Night) the boards come
down: its rooms, games, cameras and lights come on, the animatronics add its rooms to where
they wander (each has a favourite there), and daytime kids play in it. The world origin
didn't move when the grid grew, so nothing that was already there changed position.

| Room          | What's there                                                              |
|---------------|---------------------------------------------------------------------------|
| Mega Arcade   | Rows of cabinets including Gus Kart GP, plus Dance Dash and Hoop Shot      |
| Wing Hall     | The way in from the Prize Counter, and a door to everything else, each signed |
| Go-Kart Track | A lane all the way round a tyre-walled infield, karts, START · FINISH, Lap Timer |
| Laser Tag     | **Moony's home.** A 41 × 26 m maze of real walls with neon bands, and Moony's Base in a clearing in the middle: a glowing pad, a crescent moon, the Vest Charger |
| Play Maze     | **Sunny's home.** A giant 50 × 26 m maze of real walls, full of fog, and Sunny's Spot in a clearing in the middle: a sun on a pole and two fog machines |

That's five more games to fix (17 in all). The wing joins the old building through the
Arcade (into the Mega Arcade) and the Prize Counter (into the Wing Hall).

**The mazes** ([js/map.js](js/map.js) `maze()`) are 3 m cells — a 2 m corridor and a 1 m
wall, walls up to the ceiling, so they block sight. Each is carved by a depth-first walk from
a fixed seed, so it's the same maze every time; Laser Tag then knocks through 60% of its
dead ends so there are loops to run round, the Play Maze only 12% (it's a proper maze), and
each has a 2 × 3-cell clearing in the middle for its animatronic. Doors into them line up
with their corridors. **Fog:** wherever the camera is in the Play Maze (you, or a cutscene),
the scene fog thickens and greys over a second or so.

### Cameras

Twelve (nineteen once the new wing opens: Mega Arcade, Wing Hall, Go-Karts, two in Laser
Tag including Moony's Base, and two in the Play Maze including Sunny's Spot), each a real
camera in the building ([js/decor.js](js/decor.js) `cameras()`), rendered
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

**Crouching** (C, or the ⤓ touch button) drops your eyes to 1 m and slows you to 2.0 with no
sprinting. While crouched, no animatronic except Gus can see or hear you — one that was
chasing you loses you and goes searching. But **bump into one, or let one bump into you, and
you're caught** (the designer, later: "if animatronics run into you or you run into them
while crouching you get caught"), so keep out of their way. The Shop's Gus mask still fools
the ones it fools, even up close.
Gus still hunts and catches you, and so does the Junk Monster (it has Gus's head, and it
never needed to see you). In exchange you can't use a weapon or drag anything, and you
can't crouch while dragging. A tag at the bottom of the HUD says you're crouched. Timmy
doesn't crouch: they still go after him.

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
| Moony   | Possessed Gus | — | 3.0 | 4.1 | Lives in Laser Tag (Night 11 on). Teleports; only the Magnum stops him; crouching doesn't hide you |
| Sunny   | Made of fog | 1 | 2.0 | 2.9 | Lives in the Play Maze (Night 11 on). Nearly invisible unless lit; drifts through walls; silent |

Speeds scale with aggression level: ×(0.85 + 0.015 × level).

### Moony and Sunny

The new wing's two (`WingBot` in [js/animatronics.js](js/animatronics.js)). They exist only
while the wing is open, from Night 11 to 20 (`wingLevel`: Moony 5, Sunny 4 on Night 11,
plus one a night, and out during the Gus fight too; on Night 21 they're in the Junk Monster
with everyone else). The designer asked for them to be **always awake**: they never sleep at
home, but are out wandering from the first second of the night, and they wander and hunt
**only in their own room**: they only notice you there, and the moment you leave they give
up. Gus's blackouts free them from the junk pile
like anyone else.

- **Moony** is Gus, possessed — Gus's costume gone midnight purple, pale moon eyes, a black
  hat with a glowing crescent. Every 9–16 s while wandering he vanishes in a puff of sparks
  and pops up somewhere else in Laser Tag (never within 8 m of you); he does the same when
  he loses you. The taser, knife and baseball go right through him; a Magnum hit freezes
  him for 8 s, then he vanishes. Crouching doesn't hide you from him.
- **Sunny** is made of fog, head and all: a body of see-through cloud puffs, a misty head
  ringed with little puffs for the sun's rays, and glowing sun-yellow eyes. She's
  at 8% opacity in the dark and fades up to solid when your flashlight beam is on her (or
  when she's powered down, dragged or catching you; 70% by day). She senses you within about
  8 m through the walls, and drifts in a straight line right through them — slower than you
  walk, so run the corridors. She makes no footsteps. One zap powers her down, and she drags
  to Parts & Service like the others.

### How they think

Every animatronic is a physical thing walking the navigation grid (A*, smoothed by
string-pulling) — no teleporting, so the cameras never lie.

1. **On the stage** until its wake hour, then every 5 s it rolls a d20 against its aggression
   level (0–20). Nobody moves in the first 30 s of a night. While it's asleep up there no
   weapon works on it: the zap bounces off with a fizz ("Cranker is still asleep").
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

From Night 2, the power goes out at random times between 1 and 5 AM — at least once every
night (2 from Night 10, 3 from Night 16). The old guard's note teaches the fuse boxes. Lights die, cameras show NO POWER, and one of the three fuse boxes trips —
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

Jonathan and Timmy also say their lines out loud, in real people's voices
([js/voices.js](js/voices.js)). Every one of their shots in story.js has a `voice` id;
recordings are plain files at `audio/voices/<id>.m4a`, and [js/recorded.js](js/recorded.js)
lists which lines have one. A line without a recording is subtitles only, and so is everyone
else. A shot waits for the line to finish (up to six seconds past its length).

**Mouths move when they talk.** People have a dark mouth on the face that is a thin line when
shut and opens up (`setMouth` in [js/models.js](js/models.js)); the animatronics drop their
jaw. With a recording, the mouth follows how loud the line is at that moment —
`add_voices.py` measures every recording 30 times a second and stores it in
`js/recorded.js` as a digit 0–9 — so it opens on the words and shuts in the pauses. Lines
without a recording (the manager, Gramma, the animatronics) flap for about as long as it
would take to say them. The cutscene player works out who's talking from `who`.

To record: open `dev/record.html` on the local server in Chrome or Safari. It lists all
nineteen lines in story order, with the line before each for context. Record, listen, save:
each take is trimmed of silence, evened out in volume and downloaded as
`gus-voice-<id>.wav`. Then `python3 dev/add_voices.py` turns everything in Downloads into
the game's `.m4a` files with macOS's built-in `afconvert` and rewrites `js/recorded.js`
(with each line's loudness, for the mouths). The
newest take of a line wins.

| Cutscene   | When                                  | What happens                                         |
|------------|---------------------------------------|------------------------------------------------------|
| intro      | Start of a new game                   | Jonathan takes the job; "nothing EVER happens here"  |
| timmyMeet  | Night 2, when you find the crying kid | Timmy got left behind; "stay right behind me"        |
| timmyNumber | The morning after Night 2            | Timmy remembers his gramma's phone number            |
| gramma     | The phone call goes through           | Gramma comes to the lobby to pick him up (+10 happiness) |
| blackout   | Before Night 2 (first time)           | The lights flicker and Gus turns his head            |
| home       | After Night 10                        | He goes home to sleep — and hears squeaky feet       |
| homeDone   | House level cleared                   | The van drives them back; Jonathan gets a raise      |
| newWing    | Day 11 (first time)                   | The manager shows off the new wing, and Moony and Sunny |
| haywire    | Before Night 20 (first time)          | Gus's eyes go red and the fuse boxes fry             |
| gusDown    | Gus beaten                            | His glitch is gone; everyone's friends; the junk pile moves |
| junkRises  | Before Night 21 (first time)          | The pile pulls the five in; the Junk Monster rises; the old crew wakes up |
| finale     | Junk Monster beaten                   | The five pop back out; Employee of the Month         |
| oldJohn    | After the finale (first time)         | "One more thing...": Old John, the old night guard, tells the secret and gives Jonathan his badge |

## The daytime song

By day, Gus and the band sing over the techno: the same four chords (C, Am, F, G at 128 BPM),
now a 48-bar song that goes round again. Every line is two bars, seven syllables on one
rhythm (six eighth notes from beat 2, then a long note on the next downbeat).

| Bars  | Part                                   |
|-------|----------------------------------------|
| 1–4   | Intro (the band plays)                 |
| 5–12  | Verse: *Come on in, it's time to play! / Pizza, games and fun all day! / Grab your friends and grab a slice! / Gus's place is extra nice!* |
| 13–20 | Chorus: *Hey, hey, hey, it's Gus's day! / Pizza, prizes, hip hooray! / Ball pit, slides and games galore! / Everybody wants some more!* |
| 21–24 | Break                                  |
| 25–32 | The band's verse: *Gerald's on the big bass drum! / Chomper's chewing bubble gum! / Cranker dances, Flipper sings! / Gus the platypus is king!* |
| 33–40 | Chorus again                           |
| 41–48 | Break                                  |

The words say "Gus's", never "PlayPlace", because the same song plays on the jukebox at
Gus's Giant Pizza Palace in When Jonathan Was Five (it plays for 30 seconds: the intro, the
first verse and the start of the chorus). Cutscenes that use the day music get it without the singing
(`playMusic('day', { words: false })`), so nobody sings over the talking.

**Robot now, real later.** Until someone records it, robots sing it.
[dev/sing.py](dev/sing.py) has macOS's built-in Fred, Ralph and Junior voices say every
syllable, then re-sings each one with a channel vocoder: an 18-band envelope of the spoken
syllable shapes a buzz at the note's pitch, with the consonants kept at speed and the vowel
stretched to fill the note, so every word lands on the beat. Gus's lead is Fred an octave
under the tune, the big voices are Ralph an octave under that, and on the chorus Junior
sings it up high. (macOS's own singing input, `[[inpt TUNE]]`, is gone from its voices, which
is why it's done this way.) It writes `audio/song/line-<n>.m4a`, each starting on its line's
first bar, and [js/song.js](js/song.js): the words, the notes, the form and how loud the
robots sing each line, 30 times a second. To change the words or the tune, edit the top of
sing.py and run `python3 dev/sing.py` (about a minute and a half; nothing to install).

In the game, `TRACKS.day` in [js/audio.js](js/audio.js) starts each line on its bar, on the
audio clock, so it stays in time. A line that has a real recording (voice id `song-<n>`) is
sung by that, with the robots quietly singing along under it (it's a band); the rest stay
robots. On stage the five's jaws open and shut with the singing (`songNow()`), and while
you're in the Show Stage the words come up at the bottom of the screen: ♪ like this ♪.

**To record the real version:** open `dev/record.html`, put **headphones on**, and scroll to
*The daytime song*. Each line has **🔊 Hear the robots** to learn the tune and **● Record**:
four clicks count you in, the band plays the line's two bars (the robots singing along in
your headphones, unless you untick that), you sing, and it stops by itself. The take is
recorded on the game's own audio clock, allowing for the speakers' and microphone's delay,
then lined up with the line's notes by its loudness, and kept exactly the line's length, so it
lands on the beat. **▶ With the band** plays it back in the song. Save, then run
`python3 dev/add_voices.py` like the other voices.

## Timmy

Night 2 only ([js/timmy.js](js/timmy.js)). 45 seconds in, a kid starts crying in the ball pit
— you can hear it, positional, and see him on CAM 05. Walk up and press E to talk; after a
short cutscene he follows a step behind you for the rest of the night, path-finding round
furniture and catching up if he falls behind. He wears a white shirt so he stands out against
the balls.

His crying ([js/audio.js](js/audio.js) `cry`) is two or three sobbing wails — a buzzy child's
voice through "aa" formants, cracking up and falling away with a tremble — with shaky
breaths between and a sniff at the end, different every time, and the next one starts when
it finishes. If a real cry has been recorded (voice id `cry-1` on the recorder's Sounds
section, which can also play the built-in one to compare), that plays instead.

The animatronics hunt him as well as you: anything that sees him and not you goes for him,
and if it reaches him it's "OH NO! Chomper caught Timmy!" and the night starts over. Zap
anything that gets close.

The morning after, he remembers his gramma's number. He follows you around the daytime
PlayPlace (the time clock is off until he's home) to the office, where the desk phone opens a
keypad: type 145-247-3719 with the number keys (or tap it), Backspace to fix a digit. A wrong
number beeps and clears. The right one rings, gramma answers, and she comes to the lobby to
pick him up: kids' happiness +10. Saved as `timmyHome`, so it only happens once (if you quit
before calling, Continue brings you back to that morning).

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

12 AM to 6 AM, one minute per hour. Each night starts with a note (the tutorial — it explains
exactly what's new tonight; `NIGHT_NOTES` in [js/config.js](js/config.js)) and a roster of who
wakes when. Night 1's note is from the manager and says nothing about them moving; every
night after is a page from the old night guard's notebook. You start at your desk.

**Finding out.** Until you've read the old guard's note, the roster says everyone stays on
stage and the objective is just "Keep watch". The first time one steps off the stage, its
footsteps play a few metres away ("Squeak... squeak... What was THAT?!"), and pressing E at
the office desk reads the note instead of opening the cameras. Reading it pauses the night;
it's then remembered in the save (`seen.guardNote`) and never shows again.
At 6 AM: bells, the happiness report, then the daytime — walk around as long as you like and
clock in at the time clock in the office when you're ready. Caught: GOTCHA, then the same
night again from 12 AM with the happiness you started it with — and everyone is back on the
stage behind the menu (anything you'd zapped used to get back up there). The save only changes at 6 AM,
which is what makes that work.

## The twenty-one nights

Aggression levels per animatronic (0 = stays on the stage). Everyone wakes at midnight from
Night 6; before that Cranker wakes at 12 (1 AM on Night 1), the others at 1 AM (Gerald at 2 AM
on Night 3). `NIGHTS` in [js/config.js](js/config.js).

| Night | Title                  | Cranker | Chomper | Gerald | Flipper | Blackouts | Gus | New       |
|-------|------------------------|---------|---------|--------|---------|-----------|-----|-----------|
| 1     | First Shift            | 4       | –       | –      | –       | –         | –   | Taser     |
| 2     | Chewed Wires           | 5       | 3       | –      | –       | 1         | 2   |           |
| 3     | Heavy Footsteps        | 6       | 4       | 3      | –       | 1         | 3   | Baseball  |
| 4     | Something in the Balls | 6       | 5       | 4      | 3       | 1         | 3   |           |
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

**Night 21 — the Junk Monster.** The five are inside it, so they're gone from the stage. It
rises out of the junk pile at midnight. 90 health; every weapon works on it (taser 3, knife
2, baseball 1, Magnum 4). It hunts you like Gus, lobs junk at where you're about to be (a hit
dazes you), and swats any friend in its face. The **old originals** are your friends here
(faded, dusty versions of the same five, one eye dead, built by `buildAnimatronic(id, { old:
true })`): Old Gus, Old Gerald and Old Cranker fight it (1.2 per hit); Old Chomper and Old
Flipper fix games instead. The rest of the time they stand under dust sheets in the
north-east corner of Parts & Service. At
two-thirds health it speeds up; at one-third it rips out the power and the friends' blue
eyes are the only lights left.

## When Jonathan Was Five

A second story, on its own title-screen button (🧸 When Jonathan Was Five), set ten years
before the PlayPlace ([js/escape/](js/escape/)). It plays in the same engine with the same
look, but it's a different game: Jonathan is five, he has no weapons, and every level is an
escape. Its progress is saved beside the main game's (`profile.escape`) and a New game of the
main story leaves it alone.

### The designer's decisions

He drew the first three levels' maps (Pjork's Daycare, the Library, the School) and answered:

- **It's Jonathan's story from when he was five**: at the overnight daycare he and his friend
  see a Night Bot go after somebody, and Jonathan escapes — to a library, then a school, then
  more places, then a giant pizza place. **One friend, named Jack.**
- **3D, through your own eyes**, like the PlayPlace. **Find things, then escape.**
- **Pjork the pig is nice by day, scary at night**, and **moves when you aren't looking** — and
  then: **"make Pjork stay on the stage."**
- **The Night Bots walk around and catch you.** The librarian and the custodian walk around:
  **don't get caught.**
- **Four more levels** after the school: **the hospital, the shopping mall, the museum and the
  movie theater** (from the options he was offered, he picked all four).
- **The giant pizza place: survive until 6 AM, and it takes one real hour.** Baby Gus's walk
  around and you try not to get caught. **Save points like the one on his School map** (a box
  with a big smiling face that says *save*), **lots of them at the pizza place.** **A lot of
  quests on your Gus Watch.**
- **Show the fuses on the map** in the Daycare.
- **A box you can hide in, but only for 30 seconds** — then: **you can move in the box,
  like in Rainbow Friends.**
- **A Night Bot tracker on your Gus Watch** — then: **an entity tracker that tracks the bots
  and other stuff.**
- **Make the pictures like Gus's PlayPlace** (same graphics).
- **Normal vision in the hiding spots.**
- **A secret ending if you get all the quests done.**

### The levels

Each level is its own Building on the same grid system, parked 150 m apart far east of the
PlayPlace and built the first time you reach it (`EscapeMode.build`); one file each in
[js/escape/levels/](js/escape/levels/) holds its floor plan, furniture, enemies and quests.

| # | Level | Find / do | Watch out for |
|---|-------|-----------|---------------|
| 1 | Pjork's Daycare | 3 fuses (on the Gus Watch map) → the generator → the front door | 3 Night Bots (the third wakes when the generator starts, and then they all come for you); Pjork |
| 2 | The Library | 4 glowing books, each with one number of a 4-digit code → the emergency exit's keypad | The librarian (hears running from 12 m); 4 sweeping security cameras that call her over. Bonus: the power switch turns the cameras off; her fuzzy slippers under the monitor desk mean nothing can hear you run |
| 3 | Maple Street School | The custodian's 3 keys → the front doors | The custodian; a Night Bot that followed you, waiting by the front doors until you pick up the first key |
| 4 | City Hospital | 3 batteries → the elevator | 2 Nurse Bots (squeaky) |
| 5 | Sunnyvale Mall | A gate key in each of 4 stores → the Main Gate | 2 Mall Cop Bots. Bonus: the Security Office cameras make your watch beep when one is close |
| 6 | The City Museum | 3 gems (Dinosaurs, Egypt, Space) → the golden lock | 3 statues, one waking with each gem; the Guard Bot |
| 7 | Starlight Cinema | 3 film reels → the projector: the Ticket Bots go and watch the movie, the doors open | 2 Ticket Bots. Bonus: make popcorn for Jack |
| 8 | Gus's Giant Pizza Palace | Survive until 6 AM (60 real minutes), then walk out | Baby Gus's: 4 at midnight, another every hour (8 by 4 AM), each hour 5% faster |

Every level ends with a story card, and Level 1 opens with a cutscene (`daycareIntro`, in
[js/escape/story.js](js/escape/story.js)): Jack wakes Jonathan, a Night Bot chases Miss Penny
the night teacher into Storage, and they decide to run. The pizza place ends with `finale`:
6 AM, their moms, nobody believing them — and ten years later, the NOW HIRING sign at Gus's
PlayPlace.

### How it plays

- **Little Jonathan** is 1 m tall at the eye and a bit slower (walk 3.6, run 6.0 — `KID` in
  [js/config.js](js/config.js)), with a toy flashlight and the Gus Watch on his wrist. Jack
  follows a step behind, points out things you're looking for, gets scared, and hides with
  you. Nothing goes after Jack.
- **Things to find** glow and float; walk into one to pick it up. Quest targets (a generator, a
  keypad, a projector) and exits are E.
- **Save boxes** — the smiling box from the School map — save where you are (E): the level,
  what you've found and done, the clock. Caught, you're back at the last one you touched
  (or the start of the level). Leaving a level by escaping clears the save.
- **Hiding spots** (lockers, toy boxes, tubes, curtains, under beds, under counters): E to get
  in and look out. The view from inside is clear — the spot's own door, curtain or tube end
  isn't drawn while you're in it. Anything that was chasing you and **saw you get in** walks over and pulls
  you out ("…saw you hide!"); anything that didn't loses you and goes back to its rounds.
- **Your box** (B, or 📦 on touch): hide anywhere, for **30 seconds**, and **walk around in
  it** — slowly (2.25 m/s, no running), low down, with the box going along with you, and you
  still pick things up. Anything that didn't see you get in can't see you in it; anything
  that did follows the box and gets you. When time's up you pop out, and it takes a minute
  to fill back up (the 📦 bar on the HUD).
- **Stalkers** (Night Bots, the grown-ups, the robots, the baby Gus's,
  [js/escape/enemies.js](js/escape/enemies.js)) walk their rounds, notice you in their view
  cone, from 2.4 m away in any direction, when your flashlight is on them, or when they hear
  you run; crouching halves how far they see and they can't hear you. Out of sight for ~4 s
  and they search where they last saw you.
- **Watchers** (Pjork, the statues) only move when you aren't looking at them — and then
  fast. Pjork stays on his stage: he comes as close to you as the edge allows, so walk past
  with your eyes on him.
- **Difficulty** carries over: speeds scale with it, Spooky's unlimited flashlight and running
  and its one second chance per level apply, and a level beaten on Nightmare gets a ⭐.

### The Gus Watch

G (or ⌚ on touch) holds it up; the game keeps running; 1, 2, 3 (or ← →) pick the page.
**Quests** lists what to do (main quests in order, bonus ones alongside, secrets marked).
**Map** shows the level from above: you, Jack, every monster (its picture in a ring — red when
it's after you, blue when it's about, grey when it's asleep or still), the things you still
need to find (yellow ◆), the save boxes, the exit and a ★ on every quest target. **Tracker** is
the Entity Tracker: every monster with the room it's in, how far away and what it's doing
(asleep, walking, looking for you, CHASING YOU, or — for Pjork and the statues — keep
watching / MOVING), then Jack, the things to find (nearest first), the nearest save box and
the exit. The little face in the corner always shows the time, what's next, and the closest
monster that's awake.

**At the pizza place it's full of quests** — 17 bonus ones that open up as you go, some of
which upgrade the watch: 8 Gus tokens (**sneaky socks**: nothing hears you run), the claw
machine (**running shoes**: twice the stamina), 5 golden pizza slices (**super flashlight**),
the Security Office cameras (**danger beeper**), the wishing well (**lucky Gus coin**: get away
once). The rest: touch a save box, hide, bake a pizza, turn on the Arcade, the jukebox (the baby
Gus's hear it), the stage lights, 4 party stars, the birthday cake, 6 balloons, the Play Maze,
Jack's lost sock, and the golden Gus plushie.

### The secret ending

Do **every quest in every level** — the main ones, the bonus ones, the golden plushies, all 17
at the pizza place: 49 in all — and the secret ending (`secretEnding` in
[js/escape/story.js](js/escape/story.js)) plays after the escape that finishes the last one
(straight after the normal ending, if that was at the pizza place). Every quest ever done is
remembered level by level (`profile.escape.quests`), so they don't all have to be done on the
same run; the level list shows how many are done, and each "You escaped" screen shows that
level's count.

At 6:01 AM a young man in a night guard's uniform walks into Gus's Giant Pizza Palace: **John**,
starting as the night guard there that night. The kids tell him everything; he gives Jonathan
his spare flashlight; the golden Gus in the lobby blinks, its eyes a friendly blue. Ten years
later, the note under the desk at Gus's PlayPlace is from the old night guard — and the old
night guard is John (the main story's Old John), who'd been waiting for those two kids to come
back. Afterwards a ⭐ badge shows on the title screen and the level list can play it again.

### Debug handles

With `?debug=1`, `__game.escape` is the story mode: `__game.escape.start(n)` jumps to a level,
`__game.escape.skip()` finishes every quest but the last, and `__game.escape.clock.t = 3590`
puts the pizza place ten seconds from 6 AM. Debug mode (Settings) opens every level.

## Lost in the Pizzaplex

A third story, on its own title-screen button (🍕 Lost in the Pizzaplex), set six years
before the PlayPlace and four after When Jonathan Was Five ([js/plex/](js/plex/)). It's one
long night told in **50 chapters**, and every chapter you play as somebody else. Its progress
is saved beside the others (`profile.plex`) and a New game of the main story leaves it alone.

### The designer's decisions

- **Story mode. Jonathan is the main character**; the others are **Max, Jackson, Jack and
  Thomas** — and **Timmy, who doesn't appear until Chapter 27**, and then **joins the team**
  as a character you play.
- **You play every character at least once.** When you finish something, you do something
  else as a new character.
- **Each one plays like a different game:** Max like FNAF 4, Jackson like FNAF 1, Jack like
  Sister Location, Thomas like Into the Pit — and Jonathan's chapters like Security Breach.
- **They all meet as kids at Gus's Pizzaplex, and they get lost.** The Pizzaplex is **brand
  new and way bigger** than anything before it.
- **Each kid gets lost in their own spot:** Jonathan roams the whole Pizzaplex, Max hides in
  the Sleepover Suite, Jackson is in the security office, Jack ends up in the tunnels under
  the Pizzaplex, and Thomas falls into the ball pit and goes back in time.
- **Ages:** Thomas 7, Jonathan 9, Jack 10, Max 11, and **Jackson 22 — the Pizzaplex's night
  guard.**
- **Who's after them: the old ones and new ones.** (Gus, Cranker, Chomper, Gerald, Flipper,
  plus animatronics that only live at the Pizzaplex. The first new one is **DJ Rocco**, the
  Pizzaplex's raccoon DJ — made up for this build, for the designer to change.)
- **Chapter 50: they all escape together.**
- **50 chapters**, built a few at a time, with more details coming from the designer.

After playing the first five chapters, he asked for:

- **Make the rest** — all fifty.
- **Timmy's chapters: play tubes hide & seek.** He's the smallest, so he crawls through the
  play tubes and hides where nobody else fits, while they hunt for him.
- **Max is a girl, with red hair.** **Jonathan has a perm.** **Thomas has no glasses, brown
  hair, green eyes and a baggy green sweatshirt.** **Everyone's hair is different.**
- **Jumpscares like the real FNAF game** — everywhere in the game, not just here.
- **Graphics like the original FNAF game** (Settings → FNAF look).

Later, he asked for:

- **A running animation in Max's chapters, like in the real FNAF 4.** Then: **"make the
  footsteps slower."** (See *Max's chapters* below.)

### The night

Gus's Pizzaplex has just opened, and its first Sleepover Night has kids camping out in
sleeping bags under the Atrium's giant stage. Jonathan is nine. He meets Max, Thomas — and
Jack, his best friend from Pjork's daycare, who he hasn't seen in four years. Jackson, the
new night guard, says goodnight and heads up to the security office. At midnight the
lights go out, Gus's music box starts to play, and every animatronic in the place opens its
eyes. The kids scatter in the dark and lose each other.

The whole story is that one night, from midnight to 6 AM: the chapters move the clock on,
each character's piece happening at the same time as the others', and the walkie-talkies
they find tie them together. Chapter 50 is 6 AM, and the way out.

### The characters, and how each one plays

| Who | Age | Where | Plays like | How it works |
|-----|-----|-------|------------|--------------|
| Jonathan | 9 (perm, blue hoodie) | All over the Pizzaplex | Security Breach | Free roam with the Gus Watch: quests, hiding spots, save boxes; Party Passes open locked doors ([js/plex/chapters/](js/plex/chapters/)) |
| Max | 11 (a girl: long red hair) | The Sleepover Suite | FNAF 4 | You don't walk: you go to the left door, the right door, the closet or turn to the bed ([js/plex/bedroom.js](js/plex/bedroom.js)) |
| Jackson | 22 (locs under his guard's cap) | The security office | FNAF 1 | Two doors, two hall lights, the cameras and a power meter ([js/plex/office.js](js/plex/office.js)) |
| Jack | 10 (messy sandy hair, red) | The tunnels under it | Sister Location | A voice on the speakers (P.A.L.) gives you one job after another: vents, standing still in the dark, controlled shocks |
| Thomas | 7 (spiky brown hair, green eyes, baggy green sweatshirt) | The giant ball pit | Into the Pit | Jump in the ball pit and you come out long ago, at Gus's first restaurant; jump back to come home |
| Timmy | 6 (bowl cut, white t-shirt) | The play tubes | Hide & seek | From Chapter 27: crawl through the tubes and hide in the play houses where nothing else fits ([js/plex/timmy/tubes.js](js/plex/timmy/tubes.js)) |

### DJ Rocco

The Pizzaplex's new star, and its first animatronic that's never been anywhere else: a grey
raccoon DJ with a black bandit mask, a ringed tail, neon-pink headphones, a glowing record on
a chain, and purple eyes ([js/plex/cast.js](js/plex/cast.js)). He's fast and quiet —
raccoons sneak. He lives in his Party Room with the light-up dance floor, sleeps until you
pick up something he wants, and his line when he sees you is *"Nobody leaves the dance
floor!"* Made up for the first build; the designer can change any of it.

### The chapters

The characters take turns: Jonathan, Max, Jackson, Jack, Thomas, then round again. From
Chapter 27 Timmy is in the rotation too. It's one night, midnight to 6 AM; the times are when
each chapter happens, and Max's and Jackson's chapters have a clock that runs over that time.

**The story in four parts.**

1. **Lost (12–1:30 AM, Ch 1–10).** Everyone gets split up. Each of them finds a walkie-talkie,
   and Jackson, up in the office with the cameras, becomes the one voice that ties them
   together.
2. **The plan (1:30–3 AM, Ch 11–26).** The Pizzaplex locks itself at night and only unlocks at
   6 AM. Jackson's plan: hold out, and meet at the Main Entrance at 6. Meanwhile they find out
   what's going on. **P.A.L.**, the Pizzaplex computer that runs the animatronics' schedule,
   is "a little bit wrong": it thinks the party never ends. And Gus's old **music box**, kept
   backstage, is what wakes them all up. Thomas keeps falling through time and seeing where
   it all started. In Chapter 25 he reaches *years from now* — Gus's PlayPlace, Night 2 —
   and a crying kid in the ball pit follows him back.
3. **Timmy (3–5 AM, Ch 27–45).** The kid is **Timmy**, from the future. He's the smallest of
   all, so he can squeeze through the play tubes where nothing else fits. Together they
   go after the two things keeping the night going: P.A.L.'s Core (Jack) and the music box
   (Jonathan, Thomas). Max and Jackson hold the line.
4. **The great escape (5–6 AM, Ch 46–50).** Jack switches P.A.L. off for good (49), Jonathan
   gets everyone to the Main Entrance (46, 50), and at 6 AM the doors unlock. They all escape
   together — and Timmy jumps back in the ball pit to go home, which is how a crying kid ends
   up in the ball pit at Gus's PlayPlace on Night 2.

| # | Who | Time | Chapter | What happens |
|---|-----|------|---------|--------------|
| 1 | Jonathan | 12:00 | Sleepover Night | Walkie-talkie, 3 Party Passes, the STAFF ONLY door |
| 2 | Max | 12:00–1:00 | The Sleepover Suite | Doors, closet, bed: hold out until 1 AM |
| 3 | Jackson | 12:00–1:00 | Night Guard | Doors, hall lights, cameras, power; spot the kids |
| 4 | Jack | 12:30 | Under the Pizzaplex | P.A.L.'s jobs: vent, stand still, three shocks |
| 5 | Thomas | 12:45 | Into the Ball Pit | Gus's Pizza Shack long ago; the old back door |
| 6 | Jonathan | 1:00 | Backstage | Behind the STAFF ONLY door: the backstage halls, dressing rooms and Gus's room |
| 7 | Max | 1:00–1:40 | Footsteps | Gerald and Flipper in the halls now |
| 8 | Jackson | 1:00–1:40 | Night Guard, Part 2 | A phone call from John, the night guard who had this job before; faster animatronics |
| 9 | Jack | 1:20 | Night Maintenance | P.A.L. needs the generator fixed |
| 10 | Thomas | 1:30 | The Music Box | Back to the Pizza Shack: where Gus's music box came from |
| 11 | Jonathan | 1:40 | The Fun Zone | The kart track and laser tag; meet Sparky |
| 12 | Max | 1:40–2:20 | Lights Out | The night light breaks; DJ Rocco comes to the door |
| 13 | Jackson | 1:40–2:20 | The Ball Pit Cam | Watch Flipper on the Ball Pit camera, or he runs for your door |
| 14 | Jack | 2:00 | Hide and Don't Breathe | DJ Rocco checks the Workshop; stay hidden |
| 15 | Thomas | 2:10 | The Pizza Palace | Long ago, the night Jonathan was five |
| 16 | Jonathan | 2:20 | The Sleepover Suite | Find Max — and the way to the base |
| 17 | Max | 2:20–3:00 | The Music Box | A music box to keep wound, on top of everything else |
| 18 | Jackson | 2:20–3:00 | Chewed Wires | Chomper chews the camera wires |
| 19 | Jack | 2:40 | P.A.L.'s Secret | Jack finds out P.A.L. is running the animatronics |
| 20 | Thomas | 2:45 | Opening Day | The day the Pizzaplex opened, and P.A.L. was switched on |
| 21 | Jonathan | 3:00 | The Prize Counter | Batteries for every walkie-talkie |
| 22 | Max | 3:00–3:30 | Sparky | Sparky the robot dog at a door: fast |
| 23 | Jackson | 3:00–3:30 | Sparky Runs | Sparky skips rooms |
| 24 | Jack | 3:10 | The Core Key | P.A.L.'s Core needs a key |
| 25 | Thomas | 3:20 | Years From Now | Gus's PlayPlace on Night 2 — a crying kid in the ball pit follows him home |
| 26 | Jonathan | 3:30 | Gus's Room | Backstage, Gus's old music box |
| 27 | Timmy | 3:30 | The Kid in the Ball Pit | Timmy wakes up in the wrong place; play tubes |
| 28 | Jonathan | 3:40 | Up the Stairs | The upstairs party rooms |
| 29 | Max | 3:30–4:00 | Plushie Party | The bed fills up fast |
| 30 | Jackson | 3:30–4:00 | Gus Walks | Gus leaves the stage when the cameras are down |
| 31 | Jack | 3:45 | The Core | Down to P.A.L.'s Core |
| 32 | Thomas | 3:50 | The Storm | The night lightning hit the sign |
| 33 | Timmy | 4:00 | Hide and Seek | DJ Rocco and Sparky count to twenty |
| 34 | Jonathan | 4:00 | The Kitchen | Through the Pizzaplex kitchen |
| 35 | Max | 4:00–4:30 | Everything At Once | Doors, closet, bed and music box |
| 36 | Jackson | 4:00–4:30 | Timmy on Camera | Guide Timmy through the Pizzaplex by camera |
| 37 | Jack | 4:15 | Reboot | P.A.L. reboots the animatronics |
| 38 | Thomas | 4:20 | Gus's Workshop | Long, long ago: where Gus was built |
| 39 | Timmy | 4:30 | The Tube Maze | The music box key, through tubes only Timmy fits |
| 40 | Jonathan | 4:40 | The Music Box | Stop the music box |
| 41 | Max | 4:30–5:00 | The Old Ones | The old originals come to the doors |
| 42 | Jackson | 4:30–5:00 | Everyone's Coming | All of them, and the power drains faster |
| 43 | Jack | 4:45 | Three Levers | Three levers, three corners of the tunnels |
| 44 | Thomas | 4:50 | Home Time | Everything he learned, brought back |
| 45 | Timmy | 5:00 | The Long Way Round | Through the tubes to the Main Entrance |
| 46 | Jonathan | 5:10 | The Main Entrance | Get to the front doors |
| 47 | Max | 5:30–6:00 | The Last Half Hour | Max's hardest night |
| 48 | Jackson | 5:30–6:00 | 6 AM | Jackson's hardest night |
| 49 | Jack | 5:40 | Goodbye, P.A.L. | Switch P.A.L. off for good |
| 50 | Everyone | 5:50 | The Great Escape | All of them together, out the front doors at 6 AM |

Everyone's hair is different (the designer's call): Jonathan's perm, Max's long red hair,
Jack's messy tufts, Thomas's spikes, Jackson's locs (`style` on buildPerson, in
[js/models.js](js/models.js)).

### Jonathan's chapters (like Security Breach)

Free roam with the Gus Watch, like Chapter 1: things to find, doors that only open when the
quests are done, hiding spots, save boxes, and a golden Gus plushie hidden in every chapter
([js/plex/chapters/jonathan.js](js/plex/chapters/jonathan.js)). Each happens in a different
part of the Pizzaplex, with its own map in [js/plex/maps/](js/plex/maps/):

| Map | File | Chapters |
|-----|------|----------|
| Backstage: Loading Hall, Backstage Hall, Dressing Rooms, Costume Storage, Stage Wings, Prop Room, Sound Booth, Gus's Room | backstage.js | 6, 26, 40 |
| The Fun Zone: Sparky Speedway (the kart track), Laser Tag (a maze), Pit Garage, Snack Bar, Prize Booth | funzone.js | 11 |
| Upstairs: three party rooms, the Sleepover Wing and Suite, Bathrooms, Pajama Shop, Laundry (the roof hatch) | upstairs.js | 16, 28 |
| The kitchen: ovens, Dish Pit, Walk-in Freezer, Pantry, Staff Room, Loading Dock | kitchen.js | 34 |
| The Main Entrance: Entry Hall (the front doors, the big Gus statue), Gift Shop, Ticket Booths, Main Hall, Security Desk, Coat Check | lobby.js | 46, 50 |
| The main floor | pizzaplex.js | 1, 21 |

- **6 Backstage** — three fuses power the stage lift down to the Fun Zone. A spare Cranker
  suit in Costume Storage moves when you aren't looking.
- **11 The Fun Zone** — P.A.L.'s kiosk won't open the gate without three checkered flags.
  Sparky wakes up when you take the first.
- **16 The Sleepover Suite** — the key and three batteries, and Jonathan finds Max. She
  stays to keep the Suite safe as everyone's base.
- **21 The Prize Counter** — five batteries, one for every walkie, all over the main floor.
- **26 Gus's Room** — three keys to Gus's Room and the old music box inside. Touch it and it
  plays, Gus opens his eyes, and everything hunts harder.
- **28 Up the Stairs** — the walkie antenna, rebuilt at the roof hatch: everybody can hear
  everybody, Timmy too.
- **34 The Kitchen** — pizza and juice for everyone at the base.
- **40 The Music Box** — the key Timmy sent through the tubes to the Prop Room; stand at
  the music box for six seconds to wind it down. Gus sits behind it, so looking at the box
  keeps him still. It stops, everything drops — and then P.A.L. reboots them all.
- **46 The Main Entrance** — three beacon lights so everyone can find the way, then the
  radio call: everybody to the front doors.

New things to find: checkered flags, antenna pieces, slices of pizza, juice boxes and the
music box key (registered in [maps/kit.js](js/plex/maps/kit.js)). Sparky barks when he spots you.

### Timmy's chapters (play tubes hide & seek)

Timmy's chapters ([js/plex/chapters/timmy.js](js/plex/chapters/timmy.js)) are free roam like
Jonathan's, on floors full of **play tubes** and little **play houses** where tubes meet
([js/plex/timmy/tubes.js](js/plex/timmy/tubes.js)). Timmy's the only one who fits: in a tube
you crawl, and more than an arm's length inside one — or in the middle of a play house —
nothing can see you or grab you. Anything that saw you go in comes to the opening and waits,
so you come out somewhere else. The animatronics walk the open floor in between.

| # | Chapter | Do |
|---|---------|----|
| 27 | The Kid in the Ball Pit | The walkie-talkie Thomas dropped, 4 glow stars, out the Jungle Gym gate. Flipper, Chomper, and Sparky after the second star |
| 33 | Hide and Seek | DJ Rocco and Sparky count to twenty, then hunt. Stay hidden until the timer runs out — but stay in one hiding place too long and Sparky *sniffs you out*: move, or he gets you |
| 39 | The Tube Maze | The music box key broke into 3 pieces in the Tube Tower, whose tubes only join up in places: cross the floor to get them, send them down the tube chute to the backstage Prop Room for Jonathan |
| 45 | The Long Way Round | Through the tubes behind the walls — the Arcade, the Kitchen, Storage — to the Main Entrance |

### Max's chapters (like FNAF 4)

Max stands in the middle of the Sleepover Suite. **A / ←** walks to the left door, **D / →**
the right door, **W / ↑** the closet, **S / ↓** turns round to the bed, and the opposite key
goes back to the middle. At a door or the closet, **hold Space** (or the 🚪 button) to hold it
shut, and **hold F** (or 🔦) to shine the flashlight.

**Running, like FNAF 4** (`RUN` in [js/plex/bedroom.js](js/plex/bedroom.js)): to a door or
the closet, Max turns to face it and runs — 0.6 s and three big strides, the view bouncing
with each one, leaning in and rocking side to side, her feet thumping on the carpet
(`sfx.plexDash`, soft and close so it's never mistaken for the footsteps in the halls). Coming
back she backs away to the middle the same way (0.5 s, two strides). Turning round to the bed
is a quick spin with no running (0.32 s). Re-tested with the slower run (Horror): doing
nothing still gets you caught in under a minute, and going round the doors, closet and bed
still makes it through Chapters 2, 17, 35, 41 and 47.

- **The doors.** Something comes down each hall. Far away, at the end of the hall, it's in
  your flashlight — shine it and it backs off. When it's right outside, you don't see it:
  you **hear it breathing**. Then *don't* shine the light: hold the door shut until its
  footsteps go away. Leave it there too long and it comes in.
- **The closet.** A baby Gus is in there, getting a little further out every time you look
  away. Hold the closet shut to push it back in.
- **The bed.** Tiny Gus plushies climb onto the bed when you aren't looking. Turn round and
  shine the light to scatter them; three at once and they get you.


### Max's chapters after the first

Every one of Max's chapters is a night in the Sleepover Suite, the same room and controls
as Chapter 2 ([js/plex/chapters/max.js](js/plex/chapters/max.js), the room in
[ch2-suite.js](js/plex/chapters/ch2-suite.js)), each with something new and a little harder:

| # | Chapter | What's new |
|---|---------|------------|
| 7 | Footsteps | Gerald in the left hall, Flipper in the right |
| 12 | Lights Out | The night light breaks: only the moon and your flashlight. DJ Rocco, a bit faster, on the right |
| 17 | The Music Box | A lullaby box on a table in the middle: while it's wound, Gus sleeps |
| 22 | Sparky | The robot dog barks when he turns up, and gets to the door much faster than anyone |
| 29 | Plushie Party | Four plushies on the bed to get you, but they climb on fast |
| 35 | Everything At Once | Rocco and Sparky, the closet, the bed and the music box together |
| 41 | The Old Ones | The old originals: they don't breathe, they knock, and they push harder on the door |
| 47 | The Last Half Hour | Max's hardest night, all the way to 6 AM |

**The music box** (Chapter 17 on): from the middle of the room, hold SPACE (or the 🎵 WIND
IT UP button) to wind it; a meter at the top shows how wound it is. It runs down all the
time. Nearly empty, it warns you; empty, Gus's own music box starts playing somewhere behind
you, and if it isn't wound back up within about three seconds, Gus comes.

**Knocking** (Chapter 41): the old ones make no breathing sound at the door; they knock.
Knocking means the same as breathing: it's right outside, so hold the door shut.

Each animatronic can have its own speed on top of the room's (`tune`): Sparky is the
fastest, Rocco a little faster than the old ones, and the old ones take longer to push away.

Tested (Horror): doing nothing gets you caught in under a minute in every chapter, sooner
each time (about 55 s in Chapter 2, under 40 s in Chapter 47). A player going round the
doors, closet and bed in turn, winding the music box whenever it drops under halfway, makes
it every time, even with a pause in the middle each round. Chapter 47 is the closest call.

### How the chapters are built

Lost in the Pizzaplex runs on When Jonathan Was Five's engine ([js/escape/mode.js](js/escape/mode.js)),
given a story of its own (`PLEX` in [js/plex/mode.js](js/plex/mode.js)): its chapters, its
save, its menu words, nobody tagging along, no box. A chapter is a level file like the
escape levels — floor plan, furniture, quests, what walks around — plus `hero` (who you play,
[js/plex/heroes.js](js/plex/heroes.js)). Chapters where you don't walk about name a
`controller` instead (Max's `Bedroom`, Jackson's `Office`), which runs the chapter while the
engine keeps the clock, the quests, getting caught and winning. Each one's clock covers its
own stretch of the night (`clock: { seconds, from, minutes }` — from 12:00–1:00 in Chapter 2
to 5:30–6:00 in Chapters 47 and 48), over four to five real minutes. Only the last six
chapters you played stay built; older ones are taken down and built again if you go back.

Tested balance (Horror): in the Sleepover Suite, doing nothing gets you in about a minute,
and checking the doors, closet and bed in turn gets you to 1 AM every time. In the office,
doing nothing gets you in one to two and a half minutes; checking both hall lights and only
shutting a door when someone's there gets you to 1 AM with about a third of the power left.

### Jackson's chapters (like FNAF 1)

Jackson sits at his desk in the security office. **A / D** look left and right, **Q / E**
close or open the left and right doors, **hold Z / C** for the hall lights, **Space** (or the
📹 button) brings up the cameras, and on them **← →** or the map switch camera. The power
starts at 100% and drains faster with every door shut, every light on, and the cameras up.
The animatronics come one room at a time, closer every few seconds; when one is in a
doorway, the hall light shows it — shut that door. If the power runs out the doors open, the
lights go out, and Gus's music box starts playing. The kids are out there too: spot them on
the cameras for bonus quests.


### Jackson's chapters after the first

Every one of Jackson's chapters is the same security office, the same eleven cameras and the
same rules (doors, hall lights, cameras, power), each a little harder, each with one twist
([js/plex/chapters/jackson.js](js/plex/chapters/jackson.js), built from Chapter 3's office in
[ch3-office.js](js/plex/chapters/ch3-office.js)). And every one starts with the phone ringing:
**John**, the night guard at Gus's Giant Pizza Palace across town, years before he's Old John.
He knows they walk at night ("they walk at my place too"), and he calls with tips.

| # | Chapter | Time | The twist |
|---|---------|------|-----------|
| 8 | Night Guard, Part 2 | 1:00–1:40 | John's first call; everyone's a bit faster. Spot Jonathan, Jack and Thomas |
| 13 | The Ball Pit Cam | 1:40–2:20 | **Flipper** waits in the ball pit (CAM 06). Watch him and he stays down; stop watching and he climbs out — then RUNS up the West Hall. Shut the left door in time and he bangs on it and goes back |
| 18 | Chewed Wires | 2:20–3:00 | **Chomper** chews camera wires: a camera shows NO SIGNAL for a while (and sometimes the one he's standing under). The hall lights always work |
| 23 | Sparky Runs | 3:00–3:30 | **Sparky** the robot dog skips rooms, two at a time, barking |
| 30 | Gus Walks | 3:30–4:00 | **Gus** leaves his stage — but he only moves while the cameras are DOWN. A music box plays every step. Spot the new kid, Timmy |
| 36 | Timmy on Camera | 4:00–4:30 | Follow Timmy across the Pizzaplex: the Ball Pit, the Atrium, the Food Court, the Gus Shop — a bonus for each |
| 42 | Everyone's Coming | 4:30–5:00 | All of them, Gus walking and Flipper in the pit too, and the power drains faster |
| 48 | 6 AM | 5:30–6:00 | Everything at once, chewed wires included, until the bells at 6 AM. Watch the others head for the Main Entrance |

How the twists work (all switched on from a chapter's `office` numbers, [office.js](js/plex/office.js)):
`runner` (Flipper: seconds of not being watched before he runs, how fast watching pushes him
back down, a few seconds' warning while he runs — you hear him, and the screen says which door);
`chew` (how often a camera goes, for how long); a bot's `skip` (rooms per move) and `whenDown`
(only moves with the cameras down); the chapter's `calls` (John's lines, and when); `kids`
(a kid walking from a to b on one camera; `key` lets the same kid be found more than once).

Tested balance (Horror): a guard who does nothing is caught within about two minutes; a careful
guard (each hall light every few seconds, a door only when someone's in it, a look at CAM 06
every ten seconds) reaches the end every time, with about a third of the power left early on
and about a quarter in Chapter 48. It's still winnable on Nightmare.

### Jack's chapters (like Sister Location)

P.A.L., the Pizzaplex Assistant Line, gives Jack one job at a time on the Gus Watch — polite,
cheerful, and a little bit wrong. It starts out helpful; in Chapter 19 Jack reads its schedule
(PARTY: FOREVER) and finds out P.A.L. is the one keeping the animatronics awake, and from then
on he's going after it. Chapters 4–24 happen in the tunnels under the main floor; 31–49 in
the **Deep Tunnels** down the service elevator, where P.A.L.'s Core is ([js/plex/tunnels/maps.js](js/plex/tunnels/maps.js)).

The jobs ([js/plex/tunnels/kit.js](js/plex/tunnels/kit.js)), mixed differently in every chapter:

- **Vents:** too low to stand in, and too small for an animatronic — they can't follow you in.
- **Stand still:** the lights go out and something walks a loop round you. Move while it's
  close and it hears you.
- **Controlled shocks:** something walks up to a thick window. Shock it only while it's AT the
  glass; too early wastes the shock and makes it faster; too slow and it breaks through.
- **The inspection:** it checks every hiding spot in a room. Out in the open it sees you;
  hidden, it can still hear you breathe — hold SPACE (or SHIFT or F) when it's close. Your
  breath only lasts about 7 seconds.
- **Reboots:** every 22 seconds P.A.L. reboots them all: 9 seconds of dark when they can't see.
- **Gates, levers, keys, chips, cables and a code** (the code goes on the Gus Watch in 37 and
  is typed on the keypad in 49).

| # | Chapter | The jobs |
|---|---------|----------|
| 9 | Night Maintenance | Vent, 3 fuses in the dark, fix the generator (which wakes everything up), ladder |
| 14 | Hide and Don't Breathe | Hide from DJ Rocco's rounds, hold your breath, his 3 records, play them, ladder |
| 19 | P.A.L.'s Secret | 3 memory chips, plug them in, read the schedule, stand still, vent back to the hatch |
| 24 | The Core Key | 3 shocks, open the Charging Bay, grab the Core Key in 25 seconds, Sparky gives chase |
| 31 | The Core | Monitor Room, 3 fuses, the Core door, dodge the cameras, read the OFF book, elevator |
| 37 | Reboot | 3 code chips behind 3 guards: move while they reboot; copy the code |
| 43 | Three Levers | 3 levers, each one an alarm; Jackson on the walkie; the Core opens |
| 49 | Goodbye, P.A.L. | 3 cables, hold 30 seconds shocking DJ Rocco, type the code. P.A.L. says goodnight |

Tested balance (Horror): a careful player grabs each Reboot chip with 2–3 seconds of dark to
spare, and pulling a lever then hiding in the nearest locker gets you through the alarm.

### Thomas's chapters (like Into the Pit)

The Pizzaplex's Giant Ball Pit goes further than anyone knows. Dive in (**E** at its edge) and
you come up out of a ball pit somewhere else in time; jump back in to come home. **What you do
there changes the present**: something hidden, unlocked, switched or taken long ago is still
there (or gone) today. Every one is a single building with the present on its left and the
other times to its right, unjoined ([js/plex/pit/](js/plex/pit/), shared pieces in
[kit.js](js/plex/pit/kit.js)); the time you're in is saved as `m.flags.zone`, so a save box in
the past brings you back to the past.

| # | Chapter | When he goes | What he does there | And at home |
|---|---------|--------------|--------------------|-------------|
| 5 | Into the Ball Pit | Gus's Pizza Shack, a sunny birthday long ago | 3 tokens, unlock the old back door | the boarded back door opens |
| 10 | The Music Box | The Shack after closing | the Toymaker's present: Gus's music box ("so you'll never stop singing") starts, Old Gus wakes; hide the gate key in a loose brick | the key's still in the brick |
| 15 | The Pizza Palace | Gus's Giant Pizza Palace, the night Jonathan was five (little Jonathan and Jack are hiding there) | 3 tokens, claw machine, key into the time capsule | open the same capsule in the Palace Wing |
| 20 | Opening Day | The Pizzaplex's opening day, a frozen crowd | the manager's keycard, P.A.L.'s panel ("THE PARTY WILL NEVER END" — DJ Rocco's first switch-on), one setting: BALL PIT DOOR → ALWAYS OPEN | P.A.L.'s lockdown is gone |
| 25 | Years From Now | Gus's PlayPlace on Night 2 — the future | Timmy, crying in the ball pit, follows Thomas; 3 tickets; Jonathan, 15, frozen at the cameras | Thomas comes up alone: Timmy's lost in the balls (Ch 27) |
| 32 | The Storm | The Shack, a stormy night, a blackout | 3 fuses; the music box plays, lightning hits the sign, and the old originals open their eyes for the first time — run | flip the Shack's old fuse box, still in the Power Room |
| 38 | Gus's Workshop | The Toymaker's workshop, long, long ago | 3 gears open his desk's gear lock: the music box key (that's why it never stopped) | take the key to the others |
| 44 | Home Time | Three in a row: the Shack, the Palace, the PlayPlace | each pit lets go once you grab something from its time | run for the Main Entrance |

In the past, people are frozen still like a photo; the animatronics are not. Thomas's own
monsters get harder as the night goes on: Flipper alone at first, then Sparky, DJ Rocco and
Gerald round the Giant Ball Pit, and Old Gus, the baby Gus's, the old originals, Cranker and
Chomper in the other times. The storm has rain and thunder. Every chapter has a golden
plushie hidden in the past.

### Chapter 50: The Great Escape

You're Jonathan, at 5:50 AM in the **Main Entrance** ([js/plex/maps/lobby.js](js/plex/maps/lobby.js),
[js/plex/chapters/finale.js](js/plex/chapters/finale.js)). Everybody's hiding in a different
corner of it — Max at the Security Desk, Jack in the Coat Check, Thomas and Timmy in the Gift
Shop, Jackson behind the Ticket Booths — and they're all on the Gus Watch map. Find each one
(E) and they fall in behind you, a little group that follows wherever you go
([js/plex/followers.js](js/plex/followers.js)); every friend you find wakes up another
animatronic. Bring everyone to the front doors and the last minute starts: every animatronic
in the Pizzaplex comes for you, and the big Gus statue moves when you aren't looking. At 6 AM
P.A.L.'s steel shutters roll up, the doors unlock, and you all run out together.

The ending (`plexFinale` in [js/plex/story.js](js/plex/story.js)): sunrise through the doors,
every animatronic stopping where it stands, Jackson counting heads, and Timmy going home
through the ball pit — which is how a crying kid comes to be in the ball pit at Gus's
PlayPlace on Night 2, years later, for Jonathan to find. Nobody believes them; the Pizzaplex
closes, and its animatronics are sent to a little fun centre across town: Gus's PlayPlace.
Six years later: NOW HIRING. Finishing it puts a badge on the title screen.

### Debug handles

With `?debug=1`, `__game.plex` is this story: `__game.plex.start(n)` jumps to a chapter,
`__game.plex.skip()` finishes every quest but the last, and in Max's and Jackson's chapters
`__game.plex.clock.t = __game.plex.clock.len - 5` is five seconds from the end.
`__game.plex.ctrl` is the bedroom or office: `ctrl.power = 1` nearly runs Jackson's power
out, `ctrl.closet = 95` nearly lets the baby Gus out.

## Sushi's Pizzaplex

A fourth story, on its own title-screen button (🐧 Sushi's Pizzaplex), set four years before
the PlayPlace ([js/sushi/](js/sushi/)). It's a free-roam escape like Security Breach, in the
same engine as When Jonathan Was Five: four parts, a Gus Watch, save boxes and hiding spots.
Its progress is saved beside the others (`profile.sushi`) and a New game of the main story
leaves it alone. The designer drew both maps and wrote the rules on two more pages
([gallery/sushi-map.jpg](gallery/sushi-map.jpg), [gallery/sushi-notes.jpg](gallery/sushi-notes.jpg),
[gallery/daycare-map.jpg](gallery/daycare-map.jpg), [gallery/daycare-notes.jpg](gallery/daycare-notes.jpg)).

### The designer's decisions

From his maps and notes:

- **Sushi's Pizzaplex**, about 200 ft across: **Laser Tag** (a maze, top left), the
  **Entrance/Exit** with a **"See you soon"** sign, the **Gift Shop**, the **Main Area** with
  **VIP Seating**, round tables, the **Show Stage** and a pizza counter, the **Go-Karts**, and a
  **Play Area** with a **roller coaster** from "start" round the right and bottom edges to
  "end". **Sushi the penguin** is drawn in the corner.
- **"You can collect cards to enter locked places (like VIP seating). Hide in shelves, carts
  etc. You collect plushes. You have to find your friends and you crawl through vents to
  escape the very old pizzeria. Vents can go above and below the pizza[ria]."**
- **Gerald's Daycare:** the Bathroom, Gerald's Stage, the Daycare Exit (with bars), the
  Security Desk, the Generator, a big winding Ball Pit, a climbing frame, the Pool, a
  **Distraction** by the pool, and ropes to reach fuses. Its way out leads to Sushi's
  Pizzaplex. **"Gerald has strings and tries to eat you. You have to collect all five fuses
  to make Gerald good, then you get the security badge to escape."**

Asked directly, he chose:

- **You play Tom, 12, with a perm** — and then **"delete his hat."** A brand-new kid.
- His friends are **Bob, 11, Billy, 13, and Tim, 9½**. They **snuck in on a dare**.
- **"You do some of the Pizzaplex, then when trying to upgrade your card you get a daycare
  card."** Cards upgrade **a mix of all three ways**: some are hidden, your friends give you
  some, and some come from doing jobs.
- **Sushi's Pizzaplex is the very old pizzeria** — the whole place is old, dusty and falling
  apart.
- **Sushi is a bad guy** who walks around and tries to catch you. Also there: **"Chomper who
  runs you over with a roller coaster cart, and Flipper who runs you over with a go-kart, and
  Moony who is in the laser tag."**
- **Gerald hangs from the ceiling on strings like a puppet and swoops down to grab you — and
  somebody else is pulling his strings.** That's the secret: **Peter, who is 27 and is in a
  springlock suit.** The suit is **an otter: "he was the original Gus"**, and **Peter is the
  bad guy behind everything** — behind **all the stories**, not just this one. What he did:
  **he controls them without strings, he wound the music box, he made the blackout, he built
  Moony, and he controls them all.** At the end, **he gets away**.
- **The roller coaster is broken** and one of your friends is stuck at the end of it: **you
  fix it to save him.**
- The plushies are for **all three**: a shelf of the ones you've found, trading them at the
  Gift Shop for better cards or gear, and a secret ending for finding them all.
- **Tom has just a flashlight** — no weapons. Hide, sneak and run.
- The Distraction is **"like in Security Breach"**: something that makes a noise so the
  animatronic goes to look while you sneak past.
- Where each friend is stuck, he left to us ("you pick"): **Bob in Laser Tag, Billy at the
  Go-Karts, Tim on the roller coaster** — made up for this build, his to change.

### The story

Sushi's Pizzaplex has been closed for years: the old pizza place across town with go-karts,
laser tag and a roller coaster, boarded up after things kept going wrong at night. Billy dares
the others to spend one night inside. They squeeze in through the front doors under the
"See you soon" sign — the doors slam, the chains rattle, an old music box tune starts up
somewhere, and in the dark Sushi the penguin opens his eyes. The four of them scatter.

Tom finds his way through the Pizzaplex with Billy's walkie-talkies, a card at a time: Bob in
Laser Tag, then the card machine that should have given him a better card and printed a
DAYCARE card instead. Behind the daycare door, Gerald the gorilla dangles from his strings
above the ball pit. Five fuses into the generator, and the strings go slack: Gerald was never
bad. Somebody was making him do it. He gives Tom the Security Badge. With it Tom opens the
Go-Karts (Billy, and Flipper's kart going round and round) and the Play Area, where Tim is
stuck at the end of the broken roller coaster and Chomper rides a runaway cart up and down
the track. Fixed, the coaster brings Tim down. The front doors are still chained — so the
four of them climb into the vents.

Up in the vents above the stage there's a room nobody was meant to find, with monitors on
every camera, a workbench and an old otter costume slumped in a chair. It isn't empty. It's
**Peter**.

### Peter, and what he did

Peter tells the secret behind every story, and it fits what everyone else found:

- **The very first Gus was an otter**, a springlock suit — half costume, half animatronic,
  with spring latches that snap the robot parts open so a person can fit inside. Peter, a
  teenager working for the Toymaker, wore it at the Pizza Shack's first birthday parties. The
  springlocks were too dangerous, so the Toymaker built a robot platypus instead — a Gus that
  didn't need anyone inside — and the otter suit went into a cupboard. Peter wanted to be Gus
  forever.
- **He wound the music box.** The night the Toymaker brought Gus's music box to the Shack
  ("so you'll never stop singing" — Lost in the Pizzaplex, Chapter 10), it was Peter who wound
  it up. When the Toymaker locked the key in his desk (Chapter 38), nobody could ever stop it.
- **He made the blackout.** The stormy night at the Shack (Chapter 32), the lights didn't go
  out on their own: Peter pulled the fuses, and the lightning hit the sign while the music box
  was playing. That's Old John's secret, and Old John never knew the blackout had a reason.
- **He built Moony**, out of Gus's old parts from the junk pile, and the rest of Sushi's
  animatronics — Sushi, Gerald the puppet, and this place's Chomper and Flipper.
- **He controls them all without strings**: the music box's tune is how. Gerald's strings were
  just for show. (Sunny? Even Peter doesn't know where she came from.)

Then the fan stops, the kids drop down the shaft into the vents under the floor, too tight for
the suit, and crawl out a drain grate into the moonlight. When they look back, the otter is
standing under the "See you soon" sign. In the morning Sushi's Pizzaplex is empty; its
animatronics are sold off (Moony goes to Gus's PlayPlace, for the new wing). **Peter got away.**

The timeline this fixes: Peter is 27 here, four years before the PlayPlace. He was 17 in the
otter suit at the Shack (fourteen years before the PlayPlace), 19 the night of the storm,
21 the night Jonathan was five, 25 at Gus's Pizzaplex and 31 when the PlayPlace's wing opens.

### The parts

Each part is a Building on the grid like the escape levels, parked further east; the
Pizzaplex is one floor plan ([js/sushi/maps/pizzaplex.js](js/sushi/maps/pizzaplex.js)) built
again for parts 1 and 3.

| # | Part | Find / do | Watch out for |
|---|------|-----------|---------------|
| 1 | The Dare | The 🟦 blue card (hidden) → Laser Tag → find Bob (he gives you the 🟩 green card) → the card machine (it prints a 🟪 DAYCARE card) → the Daycare door | Sushi (Entrance, Main Area, Gift Shop); Moony in Laser Tag (he blinks from place to place) |
| 2 | Gerald's Daycare | 5 fuses (Bathroom, Ball Pit, top of the climbing frame, the Pool, the cubby tower) → the generator → talk to Gerald → the 🟨 Security Badge → the barred Daycare Exit | Gerald on his strings, everywhere at once from the ceiling. The noisy toys pull him away |
| 3 | The Badge | Billy at the Go-Karts → 3 coaster parts → fix the coaster at its control booth → get Tim at the End station → everyone to the Back Room's vent | Sushi; Flipper's go-kart on its track; Chomper's runaway coaster cart |
| 4 | The Vents | Crawl through the upper vents → Peter's room: 3 clues → Peter wakes → turn off the big fan → drop down the shaft → crawl out the under-floor vents | Peter, in the upper vents |

### How it plays

- **Tom** is 12: eye height 1.36 m, walk 4.0, run 6.6. A flashlight and the Gus Watch (a
  cheap one from the Gift Shop's old stock — Billy's idea), and **no weapons**.
- **Cards** open the coloured doors: walk up to one with the right card and it beeps open;
  without it, the door says which card it needs. Blue opens the Gift Shop and Laser Tag; the
  DAYCARE card opens the daycare; the Security Badge opens everything with a staff lock (the
  Go-Karts, the Play Area and the vent grates); the 💗 VIP card opens VIP Seating. The card
  you're carrying shows at the top of the screen.
- **Vents** go above (along the top of the building) and below (under the floor, the stage
  end): too low to stand up in, so you crawl, and nothing that walks fits in them. In parts 1
  and 3 they're shortcuts; part 4 is all vents.
- **Hiding** in shelves, carts, lockers and boxes works like the other stories: anything that
  saw you get in pulls you out.
- **Riders** (Flipper's kart, Chomper's cart) stay on their track and run you over if you're on
  it when they come by; when they spot you near the track they speed up. Cross behind them.
- **Gerald** rides the ceiling on his strings, straight over the ball pit and the pool, with
  his feet dangling a metre off the floor. When he sees you he swoops down. The noisy toys
  (E to wind one up) play for 10 seconds and he swings over to look.
- **Moony** blinks: when you aren't looking, he can vanish and turn up somewhere else in
  Laser Tag. He never leaves it.
- **Peter** is slow, with his springlocks clicking as he crawls, and he never stops coming.
  He can't fit in the vents under the floor.

### The plushies

Twelve plushies, three in each part, of everyone in the story. Picked up, they go in your
backpack; at the Gift Shop's trade counter (parts 1 and 3) they go up on its shelf, where the
ones you've traded stand in a row — and the shelf pays out as it fills: 2 on the shelf for
🧦 sneaky socks (nothing hears you run), 4 for the 💗 VIP card, 6 for 👟 running shoes, 8 for
the 🔦 super flashlight and 10 for a 🍀 lucky coin (get away once per part). Find all twelve
and the secret ending plays: back at Sushi's in the morning, behind the shelf, Peter's old
locker — and a photo of a teenager in an otter suit with a man in a toymaker's apron, both
smiling, at the Pizza Shack's opening day. On the back, in pencil: *"Gus forever."*

### Debug handles

With `?debug=1`, `__game.sushi` is this story: `__game.sushi.start(n)` jumps to a part,
`__game.sushi.skip()` finishes every quest but the last, `__game.sushi.giveCard('badge')`
hands you a card, and `__game.sushi.allPlushies()` puts every plushie on the shelf. Debug mode
(Settings) opens every part.

## In the Closets

A fifth story, after Gus's PlayPlace, on its own Survival button (🚪 In the Closets) and the
last part of Story mode ([js/closets/](js/closets/)). Timmy's house, ten nights, and every
animatronic hiding in the closets. It runs on When Jonathan Was Five's engine (free roam, story
cards, the Gus Watch, getting caught, a clock to 6 AM) with its own closets, mirrors and Gus.
Its progress is saved beside the others (`profile.closets`), and a New game of the main story
leaves it alone.

### The designer's decisions

- **"Make after Gus's PlayPlace in the closets, where you check closets, and to find Gus you
  look in the mirror, and to stop them you spam a button to keep the closet closed, and make
  10 levels that get harder and harder, and add it to Story mode also."** Its name: **"in the
  closets."**
- It's at **Timmy's house**, and **you play Timmy**. You **walk around** (like Security Breach),
  not jump between spots.
- **"5 per floor and more per level"**: five closets on every floor, and floors open up as the
  levels go, **up to 4 floors** by Level 10 (the basement, downstairs, upstairs, the attic).
- Who's in the closets: **"All of them."**
- Stopping them: **"close the closet until breathing stops"** — spam the button.
- **"Make animatronics have big teeth like in FNAF 4"** — and **"also add teeth for Max's
  chapters"** (`addBigTeeth` in [js/models.js](js/models.js), on everything in this story and
  in the Sleepover Suite).
- The mirror, **"Both"**: it shows **which closet Gus is hiding in**, and if he gets out, **him
  behind you**.
- If Gus gets out and he's behind you: **"Hide in a closet"** — an empty one.
- Level 10: **"Gramma comes home."**

The story around it is made up for this build, his to change: after everything at the
PlayPlace, Timmy (eight now) lives with his Gramma, who's working the night shift at the
bakery for a week and a half. On Night 5 a note on the basement door says **"GUS FOREVER."**:
Peter got away from Sushi's Pizzaplex, and now he knows where Timmy lives. On the last night
Gramma comes straight home at six, every light goes on, every closet swings open — empty — and
in the hall mirror, for a second, two orange eyes.

### The house

[js/closets/house.js](js/closets/house.js). The grid is flat, so each floor is its own strip of
one Building, side by side, with the stairs as the way between them. Every floor has the same
plan with different rooms: three rooms along the north (A, B, C), a long hall, two rooms along
the south (D, E), a door from each room to the hall, and **a closet against the far wall of
every room** — five a floor.

| Floor | Rooms (A B C / D E) | Closets |
|-------|---------------------|---------|
| Basement | Boiler Room, Storage Room, Workshop / Old Laundry, Fruit Cellar | boiler cupboard, storage closet, tool closet, old wardrobe, cellar closet |
| Downstairs | Kitchen, Living Room, Front Hall / Dining Room, Laundry Room | pantry, TV closet, coat closet, china cupboard, laundry closet |
| Upstairs | Timmy's Room, Bathroom, Gramma's Room / Toy Room, Guest Room | Timmy's closet, bathroom cupboard, Gramma's wardrobe, toy closet, guest closet |
| Attic | West Attic, Trunk Corner, East Attic / Old Bedroom, The Rafters | five old wardrobes and closets |

The **stairs** are in the middle of every hall, against its south wall: ⬆ on the left, ⬇ on
the right, with a sign over each (E to take them). A **mirror** hangs on the wall at the east
end of every hall. Signs over the doors name the rooms; another names the floor. Furniture is
kept clear of every door and closet (tested: every closet's front can be reached from every
other on its floor, and from the stairs).

### How it plays

- **Breathing.** Every closet with something in it waits a while (`quiet`), then starts
  **breathing** and its door starts creaking open. The top of the screen says what and where
  (**👂 BREATHING ▮▮▯▯▯ THE PANTRY · Kitchen (Downstairs)**), with a bar for how far the door's
  open, and the breathing is louder the closer you are. As the door opens you see two eyes in
  the crack, then the whole animatronic in the dark, its jaw opening wider and wider on its big
  teeth.
- **Spam it shut.** At a breathing closet: **SPAM E** (or Space, the touch E button, A on a
  controller). Every push shoves the door back a little and slows it down; enough pushes in a
  row (`taps`) and the breathing stops. Too slow — or nowhere near — and it bursts out and gets
  you, wherever you are in the house. Held shut, it goes quiet again, and on the later levels
  it may creep off to a different closet (`move`).
- **Gus** is in a closet too, and breathes like the others, but you can't see him: the screen
  only says **"...but WHERE? Look in a mirror 🪞"**. Look at any mirror and it shows **his
  closet**, his orange eyes peeking out of the door (and says which one). Hold it shut and he
  creeps off to another closet.
- **Gus gets out:** the music box plays, and he's **right behind you**, following wherever you
  go — invisible, except in a mirror, where you see him standing at your back. **Hide in an
  empty closet** (E, any closet with nothing in it; one with something in it won't open) and
  stay in until he gives up (`gusHide` seconds); take too long (`gusOut`) and he gets you.
  While he's out he counts as one of the closets breathing, so fewer others start.
- **6 AM** is the end of every night: they all go quiet, Gramma's key turns in the lock, and
  on Level 10 she comes home for good (the ending cutscene).

**The mirrors** ([js/closets/mode.js](js/closets/mode.js), `renderExtras`, called from
`game.render`): Gus's meshes (and his eyes at a closet door) are on Three.js layer 1, which
the game's cameras don't draw. When you're on a floor and looking toward its mirror, the
mirror's camera (layers 0 and 1) draws into a small render target, 20 times a second: from
in front of Gus's closet while he's in one, or your own view reflected through the glass
(with the near plane at the glass) when he's out. A lamp that's only on during that render,
and the cameras' brightening, light what's in it. The mirror itself is hidden while it draws,
so it's never in its own reflection.

### The levels

[js/closets/levels.js](js/closets/levels.js), one row each. Gus is in from Level 3.

| # | Level | Floors | In the closets | Door opens in | Taps | At once | Moves |
|---|-------|--------|----------------|---------------|------|---------|-------|
| 1 | Home Alone | downstairs | Chomper, Cranker | 15 s | 6 | 1 | — |
| 2 | Creaks in the Night | downstairs | + Gerald | 14 s | 7 | 1 | — |
| 3 | Eyes in the Mirror | + upstairs | + Flipper, **Gus** | 15 s | 7 | 2 | — |
| 4 | Upstairs, Downstairs | 2 | + Sunny | 14.5 s | 8 | 2 | 15% |
| 5 | The Basement Door | + basement | + Moony | 14.5 s | 8 | 2 | 20% |
| 6 | Down in the Dark | 3 | + DJ Rocco | 14 s | 9 | 2 | 30% |
| 7 | They Move | 3 | + Sparky | 14.5 s | 10 | 2 | 50% |
| 8 | The Attic | + attic | + Sushi | 15 s | 10 | 2 | 50% |
| 9 | Every Floor | 4 | + Old Gerald | 15 s | 11 | 2 | 60% |
| 10 | Gramma Comes Home | 4 | + Old Chomper (11 and Gus) | 15.5 s | 12 | 2 | 70% |

The nights run 2½ minutes (Level 1) to 5 (Level 10). Each row also has how long a closet stays
quiet (`quiet`, longer on the later levels because there are so many more of them), the
fewest seconds between two starting (`gap`), and Gus's `gusOut` (14 s down to 10) and `gusHide`
(6 s up to 8). Spooky (difficulty) slows it all down and gives you the second chance.

Tested (Horror) with a bot that walks the real paths at a kid's running pace, spams 5 taps a
second, finishes one closet before picking the next (the one with the least time to spare),
waits 3 s to "check the mirror" before going to Gus's closet, and hides when Gus is out:
doing nothing gets you caught in under a minute on every level (27–45 s on Level 1, 26–35 s on
Level 3, 34–36 s on Level 10); the bot
gets through Levels 1–6 every time (3 of 3), Level 7 3 of 3, Level 8 2 of 3, Level 9 3 of 4 and
Level 10 2 of 5 — the last one's meant to be the hardest. (Three breathing at once on four
floors was tried for 9 and 10 and couldn't be done, even by the bot.)

### Debug handles

With `?debug=1`, `__game.closets` is this story: `__game.closets.start(n)` jumps to a level
(after `__game.closets.showMenu()`), `__game.closets.breathe(i)` starts the i-th one breathing
now (`breathe('gus')` for Gus), `__game.closets.occ` is who's in which closet, and
`__game.closets.clock.t = __game.closets.clock.len - 5` is five seconds from 6 AM.

## 10 Nights at Culac's Daycare

A sixth story, on its own title-screen button (🛏️ 10 Nights at Culac's Daycare), set while
Jonathan is working his nights at the PlayPlace ([js/culac/](js/culac/)). You play **Jimmy**,
five, escaping the biggest daycare in the world, ten nights running. It runs on When Jonathan
Was Five's engine (save boxes, hiding, the Gus Watch, the clock to 6 AM), its progress is saved
beside the others (`profile.culac`), it's the last part of Story mode, and two can play it.
The designer drew the map ([gallery/culacs-daycare-map.jpg](gallery/culacs-daycare-map.jpg)) and
answered the rest.

### From his map

- **10 Nights at Culac's Daycare**, **10 miles by 10 miles**: a 7-mile-wide building on the
  left and a 3-mile-wide strip on the right.
- **The building, top row:** the **Pool**, with a **Deep Zone** and a swim area (**Flipper
  starts here**); the **Beds**; and the **Owl's Café** (**Ouchie starts here**).
- **The middle:** the **Arcade** under the pool (**Moony starts here**), the big **Play
  Structure** (**Roglego starts here**), and the **Pet Zone** (**Sparky starts here**). A
  narrow strip between the pool and the play structure is a measurement (below).
- **The bottom:** the **Maze** (**Sunny starts here**), the **Meal Zone**, the **Baby Zone**
  (**Mean Baby starts here**, and **Gokupug** has an arrow into it), the **Bathroom**, and the
  **Security Office** (**the security guard starts here**).
- **The right strip:** the **Forest Area, with a trail and animatronics**, and a **Play Area**
  (**Gerald starts here**), then the **Slides, into the pit**, and the **Ball Pit** (**Chomper
  starts here**).
- Drawn across the top: **Roglego**, **Ouchie**, and **Gokupug**, a pug.
- The strip by the pool is a measurement: **"the pool is 10 feet long."**

### The designer's decisions

Asked directly, he chose:

- **Culac is the owner.** He isn't in the story.
- **You play Jimmy**, and **you escape as Jimmy at night.**
- **Mean Baby** is **a cursed baby**. **Roglego** is **a bunch of wires and a face**. **Ouchie**
  is **an owl**. **Gokupug** is a fighter **in the shape of a pug, with tiny legs**.
- **It takes Jimmy 9.57 minutes to walk up, down or across.** At his walking speed (3.8 m/s)
  that's 2,182 m each way.
- **There are kids asleep in the Beds** that Jimmy has to protect: he **keeps the
  animatronics away from the beds.**
- **Every night the way out is somewhere different.** Some nights you **find things to open
  the exit**, some you **survive until 6 AM and then run for it**, and **the last night you
  wake the kids and bring them all out with you.**
- **The security guard is a bad guy** who chases Jimmy too.
- **The pool really is 10 feet long, about as long as a couch.** The rest of that corner is the
  Deep Zone and the swim area.
- **Mean Baby cries when it sees Jimmy, and the others all come running.**
- **Roglego crawls through walls**: its wires go through the vents and walls to reach you.
- **Ouchie flies over everything** and swoops down to grab Jimmy.
- **Gokupug does a super jump**: really high, and he lands right next to you. He's his own
  super-fighter pug (not a copy of anyone from another show): **spiky blue hair and a black
  karate suit with a lightning bolt on it.**
- **The guard** does both: he **watches the cameras and tells the animatronics where you
  are**, and he **walks around shining a huge flashlight; if it lands on you, he chases you.**
- **Jimmy has just a flashlight.** Hide, sneak and run.
- **In 2 Players, player 2 is a kid from the beds**, a new friend who wakes up and escapes with
  Jimmy.
- **Peter is behind it**, like he's behind all the stories.
- **Flipper, Moony, Sunny, Gerald, Chomper and Sparky are the same ones from Gus's
  PlayPlace**: they sneak over at night.
- **Player 2 is Leo**, a 6-year-old in **green dinosaur pajamas**.
- **The guard is Officer Grumble**: tall and skinny, and he never smiles.
- **The hide-until-6-AM nights take 25 minutes**, then you run for the exit.
- **If an animatronic gets to the sleeping kids, it takes one**, and you have to go and
  rescue them.

Not his — made up for this build, and his to change: why Jimmy's there (Mom and Jonathan
both work nights), the other kids' names (Mia, Sam, Ava, Noah, Lily, Ben, Zara and Theo, with
Leo in the bed next to Jimmy's), what each night asks you to find, which animatronics come in
on which night, the giant slide you can ride into the Ball Pit, Ouchie's tree in the middle of
the café, the old animatronic animals along the Forest trail, and how Peter fits: Officer
Grumble works for him, and he's in the finale.

### The story

Jimmy's mom works nights, and so does his big brother: Jonathan is the new night guard at
Gus's PlayPlace. So on school nights Jimmy sleeps at **Culac's Daycare**, the biggest daycare in
the world — it takes ten minutes just to walk across. Nobody has ever met Mr. Culac. The
night guard is **Officer Grumble**, tall and skinny, who never smiles and watches the cameras
all night. Jimmy's bed is next to **Leo**'s, who has dinosaur pajamas and a cousin who says the
animatronics from Gus's PlayPlace sneak over at night.

They do. Every night something wakes Jimmy, and every night he gets out a different way. The
animatronics keep coming, a few more each night — Sparky and **Mean Baby**, then **Roglego**,
then Flipper and Chomper, **Ouchie** and Gerald, **Gokupug** and Moony, then Sunny — and some of
them go for the kids asleep in the Beds. Officer Grumble's radio keeps crackling to someone he
calls "boss", and on Night 7 the face in the Security Office window isn't his.

On Night 10 Jimmy takes Grumble's key card off his desk while he's out on his rounds, wakes up
every kid, and leads them all out the front doors at six in the morning. Mom says no more
Culac's. And in the Security Office, Grumble radios his boss: they all got out. **Peter**, in the
old otter suit, standing behind the camera screens, says that's alright. There's always
another night.

### The size

The designer wanted 9.57 minutes across, and every other map in the game is under 120 m. The
daycare is the same 1 m grid as every other building, 2,184 cells a side, but drawn and
searched differently ([js/culac/place.js](js/culac/place.js)):

- **Paths** reuse one set of buffers instead of a fresh grid-sized one each time, give up
  after 45–70 thousand cells and walk toward the closest they got (they path again when they
  get there), and string-pull forwards in steps of at most 40 m. A path right across the
  daycare takes about 10 ms.
- **Collisions** look only at the colliders near you: the list keeps a 16 m grid of them, and
  `resolveCircle` (physics.js) asks a list for `near` when it has one. There are about 96,000.
- **Floors, walls and paint** are merged into rectangles and batched a chunk (96 m) at a time;
  **furniture** ([js/culac/world.js](js/culac/world.js)) is instanced the same way — 275,000
  beds, tables, cabinets, cribs, stalls and trees in a few thousand batches — so the camera
  only draws what's near you. The cameras draw 90 m out; the fog has gone black long before.
- **Lights**: 2,000 lamps, each a glowing bulb, and ten real lights moved to the ones nearest
  you every quarter of a second (the number of lights never changes, so nothing recompiles).
- **The ball pit** is a texture of balls everywhere, with real balls in 3 m tiles round you.
- **The roof** is at 13 m and the rooms' walls only 6.5 m, which is how Ouchie flies over them.

Building it all takes about a second, the first time you open a night.

### The daycare

From the map, a 10-mile square: on the left (7 of the 10) the **Pool**, **Beds**, **Owl's Café**,
**Play Structure**, **Pet Zone**, **Arcade**, **Meal Zone**, **Baby Zone**, **Bathroom**, **Security
Office** and **Maze**, as walled rooms in one huge carpeted hallway with pillars holding up the
roof; on the right (3 of the 10) the **Forest Area** (a winding trail, trees, and old
animatronic animals along it with glowing eyes) beside the **Play Area** (swings, slides,
sandboxes, see-saws), then the **Slides** (towers, and a giant slide you can ride down into the
pit) and the **Ball Pit** (paths round the edge and across the middle; balls everywhere else,
and they slow you down). The Pool has a railed-off **Deep Zone**, a shallow **swim area** you
wade through, and the 10-foot pool. The Maze is a real one: 10 m cells, foggy, with Sunny's
clearing in the middle. Everyone starts where the map says.

Save boxes are all over the hallway and in every room (the Gus Watch map shows the ones
within 260 m); hiding spots are in every room and along the hallway; 19 security cameras watch
the doors.

### How it plays

- **The kids.** Nine of them asleep round Jimmy's bed (Leo's is right next to his; in 2
  Players, Leo's the one playing). From Night 2, now and then one of the animatronics heads for
  the Beds for a kid: the watch toasts who and for whom. If it sees you on the way it forgets
  the kid and comes for you instead — that's how you keep them away. If it gets there it
  carries the kid off to its own room and leaves them there, crying. Go and press E on them and
  they run back to bed. **The exit won't open while anyone's missing.** The Gus Watch's
  tracker lists every kid and where they are.
- **The cameras.** While Officer Grumble's at his desk, a camera that sees you (its light goes
  bright red) gets you radioed in, and the two closest animatronics come to look.
- **Grumble's rounds.** Every minute or so he gets up and walks four legs of a patrol with his
  flashlight, then goes back to his desk. If the beam lands on you, he chases you.
- **Survive nights** are 25 minutes (6 hours at 4 minutes 10 seconds each). At 6 AM the exit
  unlocks and you run for it.
- **Night 10.** Take the key card while Grumble's away from his desk, wake each kid (E at their
  bed), and they follow you, all nine, out the front doors.

### Who's after you

| Who | Home | What they do | Night |
| --- | --- | --- | --- |
| 🐶 Sparky | Pet Zone | The robot dog: fast, barks, raids the beds | 1 (wakes when you take the key) |
| 😭 Mean Baby | Baby Zone | Slow; when it sees you it **cries**, and everything within 220 m comes to look | 1 |
| 🧶 Roglego | Play Structure | Once it's after you its wires go **straight through the walls**; it feels you walking within 9 m (crouch) | 2 |
| 👮 Officer Grumble | Security Office | The **cameras**, and his **flashlight beam**; he can catch you | 2 (asleep on Night 1) |
| 🐬 Flipper | Pool | Roams the Pool and Arcade, raids the beds | 3 |
| 🦫 Chomper | Ball Pit | Isn't slowed by the balls, raids the beds | 3 |
| 🦉 Ouchie | Owl's Café | **Flies over everything** at 9.5 m; screeches, then **swoops** at 6 m/s. Can't get into a hiding spot | 4 (asleep in his tree before) |
| 🦍 Gerald | Forest | Guards the Forest and Play Area | 4 |
| ⚡ Gokupug | Baby Zone | **Super jump**: crouches, yells, leaps 5 m into the air and lands 1.3 m from where you were. Then he needs a second | 5 |
| 🌙 Moony | Arcade | Never leaves the Arcade; blinks from place to place in it | 5 |
| ☀️ Sunny | Maze | Made of fog — only your flashlight shows her — and drifts through the maze's walls | 6 |

Everyone's faster on Night 9.

### The nights

[js/culac/nights.js](js/culac/nights.js).

| # | Night | What to do | The way out |
| --- | --- | --- | --- |
| 1 | Wake Up, Jimmy | The fire door key (Owl's Café), switch off the alarm (Pet Zone) | FIRE EXIT, top of the Beds |
| 2 | Officer Grumble | Three padlock keys: Play Structure, the Arcade's prize counter, under a lifeguard chair | POOL DOOR |
| 3 | Hide Until Six | Survive until 6 AM | the Arcade's PRIZE DOOR |
| 4 | The Trail | Four batteries (Pet Zone, Play Area, Slides, Forest), the gate's lock | the Forest's TRAIL GATE |
| 5 | Super Jump | Survive until 6 AM | the SLIDE EXIT |
| 6 | Into the Maze | The maze key, in Sunny's clearing | the Maze's SECRET DOOR |
| 7 | Lights Out | Survive until 6 AM, darker | the Bathroom WINDOW |
| 8 | Five Fuses | Five fuses (Meal Zone, Baby Zone, Bathroom, the bottom of the giant slide, Security Office), the generator | the Ball Pit's BACK DOOR |
| 9 | The Longest Night | Survive until 6 AM, everyone faster | the PLAY GATE |
| 10 | Everybody Out | Grumble's key card, wake the kids | the FRONT DOORS, then the finale |

Night 1 opens with a cutscene (`culacIntro`: Mom dropping Jimmy off, lights out next to Leo,
Sparky walking past the door); Night 10 ends with one (`culacFinale`) — both in
[js/culac/story.js](js/culac/story.js).

### Debug handles

With `?debug=1`, `__game.culac` is this story: `__game.culac.start(n)` jumps to a night (after
`__game.culac.showMenu()`), `.skip()` finishes the night's quests, `.raid()` sends one of them
for the beds now, `.tp(x, z)` puts you at a plan point (the map's metres), and
`.kids` / `.raider` are the kids and whoever's on a raid.

## Story mode

Every story in one go ([js/campaign.js](js/campaign.js)). The title screen's first page is
just **▶ Play** (and 👥 2 Players); Play leads to **📖 Story** or **🌙 Survival**. Survival is
the title as it always was: the nights, Pick a night, and each story on its own button.

### The designer's decisions

- **"Make story mode where you go Sushi's Pizzaplex, daycare, Lost in the Pizzaplex, then the
  PlayPlace, without chapters: you press Continue or New game."**
- **"Make a main menu that says Play, and it leads you to a screen that says Story or
  Survival, and Survival is how it is now."**
- Asked where When Jonathan Was Five goes: **"put it third."** Lost in the Pizzaplex: **all 50
  chapters in a row**. Survival keeps **all of the games** to pick from. **2 Players can play
  Story too.**
- After the PlayPlace: **In the Closets** ("add it to story mode also"), the fifth part.
- **10 Nights at Culac's Daycare** went on the end, sixth (not asked: it happens during
  Jonathan's nights, so it could go earlier — his call).

### How it goes

| # | Story | Where it ends |
|---|-------|---------------|
| 1 | 🐧 Sushi's Pizzaplex, all four parts (the Daycare is Part 2) | the vents, and Peter getting away |
| 2 | 🧸 When Jonathan Was Five, all eight levels | 6 AM at the pizza place |
| 3 | 🍕 Lost in the Pizzaplex, all fifty chapters | the Great Escape |
| 4 | 🔦 Gus's PlayPlace, from getting the job to Night 21 | Old John and his badge |
| 5 | 🚪 In the Closets, all ten levels | Gramma comes home |
| 6 | 🛏️ 10 Nights at Culac's Daycare, all ten nights | everybody out the front doors, and Peter |

There's no level list: **Continue** picks up the story you're on at the furthest level you've
reached (from your save box, if you touched one), and **New game** starts from Sushi's
Pizzaplex again (it asks first, and says Survival keeps its progress). Each level still has
its card, saying what's happening and what to do, but with **📖 STORY · SUSHI'S PIZZAPLEX** in
place of "PART 2 OF 4", and the win screen's button says **▶ Keep going**. When a story's last
level is won and its ending has played, a card says what's next (**📖 STORY · 2 OF 4**, its
name and what it's about, **▶ Keep going** or Main menu). After Night 20 the story goes straight
on to Night 21, and after Old John, **THE END**. Back from a card, or Main menu from any screen,
goes back to the Story menu, which says where you're up to ("🍕 Lost in the Pizzaplex — The
Music Box").

**Its own save.** Story mode plays on a profile of its own (`survive_gus_story_v1`, see *Save
data*), the same shape as Survival's, plus `campaign`: `{ key, done }`, the story you're on.
Going into Story swaps it in and Survival's is untouched; going back to the title swaps
Survival's back. So the stories' own saves (levels, quests, plushies, Gus Watch upgrades,
Timmy, the wing) all work as they always did, separately for each. The Shop's tokens are
shared: they're in their own save already.

**How it's built.** `STORY_PARTS` lists the parts in order; a part is a story mode on the game
(`game.sushi`, `game.escape`, `game.plex`, and later `game.closets`) or `'nights'`, the
PlayPlace itself. Parts the game doesn't have are skipped, so adding one is one line. The
story modes call `finished()` (escape/mode.js) when their ending is over, which in Story mode
is `campaign.partDone(key)`; the PlayPlace's `finishBoss` does the same after Old John.

Tested (Story save in a separate origin): New game opens Sushi's Part 1 card; winning a
middle level goes straight to the next card; winning each story's last level shows the next
story's card, in order, through the PlayPlace's intro; quitting goes back to Survival's save
(unchanged), and Continue picks up where you were; Gus → Night 21, the Junk Monster → Old John →
THE END, and then the Story menu offers only New game; a fifth story turns up as 5 OF 5; and
2 Players → 📖 Story opens the Story menu with Jimmy on. On a phone the menu pages scroll with
the tabs after them.

## 2 Players

The **👥 2 Players** button on the title screen opens its own screen
([js/coop.js](js/coop.js), with the glue in [js/game.js](js/game.js)): 1 or 2 players, side by
side or top and bottom, both players' keys, whether a controller is plugged in, and the three
games to play together. It's saved in `localStorage` under `survive_gus_coop`, apart from the
progress, so it stays on until you turn it off (the title button says **2 Players: ON**).
**👤 Back to 1 player** turns it off in one tap. On the main menu it sits beside 2 Players:
ON. In the pause menu it shows while two are playing, and Jonathan carries on right where he
is (`goSolo` puts down whatever Jimmy was doing first: the cameras, a repair, dragging one, an
emote). On a short screen the pause menu's buttons come before its list of keys.

**Who.** Player 1 is Jonathan — at fifteen, at five in When Jonathan Was Five, and in the
Pizzaplex whoever the chapter is about. Player 2 is always **Jimmy**, Jonathan's five-year-old
little brother, who's going to be an astronaut: a little white space suit with a blue neck
ring, chest panel and mission patch, a backpack ("his oxygen"), blue boots, and a helmet with
its gold visor flipped up (`buildJimmy` in [js/models.js](js/models.js)). He's kid-sized
everywhere (`JIMMY` in config.js: eyes at 0.98 m), a little slower than Jonathan at the
PlayPlace, and his hands on screen are white space-suit gloves (`JIMMY_LOOK`, and
`jimmyHands` in the story modes, with a Gus Watch of his own). He gets the same weapons and
gear as Jonathan each night.

**Keys.** Player 1: WASD, the trackpad to look, click to zap, left Shift, E, F, C, Q, 1–4, G,
B, Esc. Player 2 (`P2_KEYMAP`): ↑ ↓ walk, ← → turn (gently at first, then faster; the view
levels itself out, since there's nothing to look up and down with), Enter zaps, right Shift
runs, `/` uses, `.` flashlight, `,` crouch, `L` next weapon, `;` Gus Watch, `'` box. A game
controller (`PAD_HELP`; the first one plugged in is Jimmy's, a second is Jonathan's): left
stick walks, right stick looks, RT zaps, A uses, X flashlight, B crouch, Y next weapon, LB or
L3 runs, RB Gus Watch, LT box, the d-pad does the puzzles and cameras, START pauses. Each
player's keys reach the game through their own `Controls`, which answers the same questions
as `input` (down, pressed, keyPressed, drainLook, fire); the repair puzzles and the monitor
ask about arrows and SPACE by name, so player 1's WASD stand in for arrows and player 2's
Enter for SPACE. Prompts in player 2's half name their keys (`/` instead of E).

**How it runs.** Every step, the game runs each player's own part — keys, walking, what they
can press E on, their weapon, their repair puzzle — with `game.player` pointing at them
(`eachPlayer`), and each animatronic's turn with `game.player` pointing at whoever it's after
(`preyFor`: the one it can sense, the closer if both, sticking with whoever it was already
chasing), so everything that asks "where's the player?" asks about the right one. Sounds are
heard by whoever's closest. A dragged animatronic follows whoever's dragging it; either
flashlight finds Sunny; either player looking at a Watcher keeps it still; the cameras are one
desk, so one of you at a time ("Jimmy is on the cameras").

**The screen.** Two halves (`paneRects`), each drawn through the same graphics pipeline into
its own part of the canvas (Graphics.render's `rect`; the second half reuses the first's
shadow maps). Each half has its own field of view for its shape, and the hands come in a
little smaller in a tall half. You see the other one's body — Jimmy, or Jonathan as he is in
that story — walking, standing or crouching (the `crouch` pose: knees forward, hips down,
leaning in — their bodies get knees, `addKnees`, so it's a real squat), never their hands. Each half has its own HUD (`PaneHud`: crosshair, flashlight,
running, the box, weapon, what to press, what's after you, a red edge when something's
close); the clock, the kids' happiness, the objective and the toasts stay shared. The camera
monitor, the repair puzzle, the Gus Watch and the static after a scare fill only the half of
whoever's using them, with the night-vision tint over just that half.

**Caught.** Only the one who's caught sees the jumpscare, in their half; the night stops for
it, then carries on. They're out until morning (in the story modes, until the level's
escaped), the other player goes full screen, whatever caught them backs off stunned, and
nothing can catch the survivor for a couple of seconds. Both out: GOTCHA, and the night
starts over for both. In the chapters where you share one room (Max's bedroom, Jackson's
office), getting caught gets you both.

**Splitting the doors.** In **Jackson's office** there's one screen and one office: Jonathan
has the left door (E or Q) and light (hold F or Z), Jimmy the right door (`/`) and light (hold
`.`); either can work the cameras (Space or Enter) and look round. In **Max's bedroom** each of
you has your own place in the room and your own half of the screen — A/D/W/S or the arrows to
move between the doors, the closet, the middle and the bed — and a door's held shut if either
of you is holding it; a hall's light is on if either of you shines it.

**On a phone or iPad** (the designer's call: "Screen + controller"), Jonathan is the touch
screen and Jimmy has a controller; the first one connected is his. The 2 Players screen says
so: it lists the touch buttons and the controller buttons, and it says "Jimmy needs a
controller!" until one shows up. The touch controls cover only Jonathan's half (CSS shrinks
`#touchLayer` to it). Touches in Jimmy's half do nothing, and the buttons get smaller in a
short half (`--tk`). Everything the touch screen presses goes through `input`'s own touch
channel (`touchHeld`, `touchPressed`, `touchKeys`, and `touchLook` for looking), which only
Jonathan's `Controls` read, so a tap can never move Jimmy. Once Jonathan's caught, only ❚❚
still works until morning. In his half, his weapon moves up above his bars and his prompts
above the crosshair, out from under his buttons (the top row has the Shop's buttons at
night). In Max's bedroom his door and
closet buttons come back, smaller, in his half.

## Emotes

Hold **T** (player 2: **K**; a controller: **up on the d-pad**) and the emote wheel pops up
(`EMOTES` in config.js): 👋 Wave, 👍 Thumbs up, 😱 Point & scream, 🕺 Dance, 🐔 Chicken, 🪱 The
worm, 🌀 Head spin. Point at one — with the mouse, a stick, or the walking keys — and let go
(`emoteTurn` in [js/game.js](js/game.js)). The camera swings round in front of you so you
watch yourself do it, like Fortnite (from the side, for the worm), pulled in short of any
wall, and you can turn it with the mouse or stick. Walk, or press it again, to stop. The poses
are in `poseRig` ([js/models.js](js/models.js)); the worm lies you flat with a wave rolling
along, the head spin stands you on your head and spins; on point & scream the mouth pops open
so wide it covers the whole face, eyes and all, with teeth and a tongue (`screamMouth`), and
wobbles. Each has its sound (a shrill, high-pitched, wobbling AAAAAH!, a
bawk-bawk, a little tune to dance to). Two playing, the other one sees it too. You can't emote
while dragging one, and nothing stops the animatronics while you do.

On a touch screen it's the **😀** button (next to ❚❚). Hold it and slide toward one, then let
go. Or tap it, and the wheel stays open until you tap the one you want (or tap 😀 or
anywhere else to close it). Tap 😀 again during an emote to stop it ([js/touch.js](js/touch.js)).

Five more come from the Shop and go on the end of the wheel once they're yours (`SHOP_EMOTES`
in [js/shop.js](js/shop.js); the wheel grows to fit them): 🍕 **Noice** (three bites of a slice
of pizza, a thumbs up and "noice." in the device's voice), 💃 **the floss**, 🤖 **the robot**
(snapping from pose to pose), 🤸 **a backflip** (up, over backwards round the middle of the
body, and down on your feet) and 😴 **fall asleep** (flat on your back, snoring, with Zs
floating up). shop.js holds the pizza slice and does the flip and the lying down
(`Shop.dress`); the poses are in `poseRig` with the others.

## Gus tokens and the Shop

**Gus tokens 🪙.** One for every kid game you fix at night at the PlayPlace (not the fuse
boxes: `Machines.fix`), and one for every story quest, the first time it's ever done (When
Jonathan Was Five and Lost in the Pizzaplex, and any story built on their engine:
`EscapeMode.remember`). A little 🪙 +1 floats up under the clock. It's one wallet for every
story, kept apart from the save, so a New game keeps it and getting caught never takes tokens
back. The first time the Shop is opened, it gives you a token for everything you'd already
done (every game fixed in `stats.fixed`, every quest in the stories). The Gus tokens you pick
up inside a level (for the claw machines at the pizza place and the Pizza Palace) belong to that
level and stay there; finishing the quest to collect them still pays a Shop token.

**The Shop** is the **🪙 Shop** tab on the title screen, beside Gallery and Settings
([js/shop.js](js/shop.js), `SHOP_ITEMS`). Four tabs: Gear, Power-ups, Hats and Emotes.

| Thing | Price | What it does |
|-------|-------|--------------|
| 🎭 Gus Mask | 20 | Yours to keep. **R** (player 2: **M**) puts it on. Everyone but Gus walks right past you, like crouching but standing up: Gus, Moony (a possessed Gus) and the Junk Monster (Gus's head) see straight through it. **15 seconds** of air, then it comes off with a gasp and needs 6 s; take it off sooner and it's ready sooner. No zapping, running, grabbing, riding or pressing E with it on. You look out through two eye holes in purple fur, with Gus's yellow bill at the bottom and an AIR bar |
| 🛹 Skateboard | 25 | Yours to keep, in your pocket. Ride at 1.75× walking speed and never get tired, but it's loud: they hear you rolling like running, from 1.4× as far, through walls. Crouching, the mask or dragging one gets you off |
| ⚡ Power Generator | 6 | One use. In a blackout, the lights come back on and Gus goes back to the stage. Not on Night 20 (Gus fried the fuse boxes) |
| 🔋 Charger Generator | 4 | One use. Fills your flashlight, taser and running |
| 🚪 Door Generator | 5 | One use, inside the Security Office: metal shutters (grey slats, yellow and black stripes) slam down over both its doors for **20 s**. They're wall to walking, sight and paths (`setDoorsClosed` in map.js), so nothing gets in, and you can't get out |
| 🎈 Balloon Decoy | 2 | One use. Thrown like a baseball; where it lands, a balloon on a little weight bobs up. Everything it fools (not Gus, Moony or the Junk Monster) that's awake and within 30 m goes to look, and can't see you for 9 s. It pops after 14 s |
| ❤️ Extra Life | 8 | One use, by itself: the next time you're caught at night, you get away like Spooky's second chance (that's used first, if you have one) |
| 🟢 Glow Sticks ×3 | 2 | Dropped at your feet, they glow for the rest of the night. The newest three light the room (three pooled lights, so there's never a new light to compile mid-night) |
| 🎉 🧢 🚁 👑 Hats | 8–15 | Party hat, Gus cap, propeller beanie (it spins faster when you move) and crown. Pick who wears each, Jonathan or Jimmy. You see them when you emote, and on each other in 2 Players |
| Emotes | 10–12 | See [Emotes](#emotes) |

You can carry up to nine of each one-use thing. **Your pocket** shows at the bottom left at
night (in your own half, two playing): the thing you've picked, how many, its keys, the mask,
your extra lives and the shutters' countdown. **X** (player 2: **J**) picks the next thing,
**V** (player 2: **N**) uses it. Things from the Shop work at night at the PlayPlace and in the
house; hats, emotes and tokens work everywhere.

**On a controller** the rest of the d-pad does it: **←** the mask, **↓** uses the thing in your
pocket, **→** picks the next one (`PAD_ACTIONS` in [js/coop.js](js/coop.js); the d-pad is still
the arrows in the repair puzzles and on the cameras). **On a touch screen** three more round
buttons join the top row, left of 😀, only at night and only once there's something to use:
the pocket button (it shows the thing it'll use, and lights up while you're riding), **↻** for
the next one (once there are two), and **🎭** (once you own the mask; lit while it's on)
([js/touch.js](js/touch.js), `shopButtons`). The pocket moves up under the kids' happiness,
clear of 🏃 and ⤓, and its key names follow whatever you play with.

## Settings and difficulty

The **⚙️ Settings** tab hangs off the bottom middle of the title screen, beside the **📷
Gallery** tab (pictures taken while making the game, in `gallery/`, listed with captions in
`GALLERY` in [js/config.js](js/config.js); tap one to see it big). The tabs are the last thing
in the title's column, not pinned over it, so on a phone the title scrolls and they come
after the buttons instead of covering them. Settings holds the graphics
look, the difficulty and How to Play. Settings live in `localStorage` beside the save, not in
it, so a new game keeps them; difficulty is under `survive_gus_difficulty`.

`DIFFICULTIES` in [js/config.js](js/config.js). The designer named them **Spooky, Horror and
Nightmare** (the ids are still `easy`, `medium` and `hard`, so saved settings carry over).
Horror is the game as designed:

|                              | Spooky 👻 | Horror 😱 | Nightmare 💀 |
|------------------------------|---------|-----------|---------|
| Aggression level (added, like the kids' mood) | −3 | 0 | +3 |
| Animatronic speed (Gus and the Junk Monster too) | ×0.85 | ×1 | ×1.12 |
| Flashlight, taser zaps, sprinting | unlimited | normal | drain ×1.35, recharge ×1.35 |
| Power outages                | from Night 10 | from Night 2 | from Night 2 |
| Second chance                | first catch each night | — | — |
| ⭐ on the night select        | — | — | every night beaten |

**Second chance:** the first time something catches you on Spooky, it's stunned for four
seconds, nothing can catch you for three, and a toast says RUN. A green "Second chance ready"
tag under the happiness meter shows it's still there. It doesn't cover Timmy.

`blackoutCount()` gives a night's blackouts at a difficulty; the boss nights are unchanged.
The difficulty shows on the night card and next to the night number on the HUD. A night
beaten on Nightmare (including replays, the house level and the bosses) gets a star on its
button in Pick a Night, and the 6 AM screen says so.

**Horror is a little scarier** (`scare: 1`), at night only — the title screen and the
gameplay are the same as ever: nights a bit darker (ambient and room lights ×0.8, fog ×1.15),
the lights stutter now and then, every animatronic's eyes are tinted towards red, someone
whispers every couple of minutes, and a soft heartbeat starts when one is within 7 m.

**Nightmare is far scarier than the others, title screen and all** (`Game.applyNightmare`,
`body.nightmare` in [style.css](style.css), `Lighting.scare` = 2):

- **Title screen:** "DON'T TAKE THE JOB" and "Twenty nights. Seven animatronics. Nobody makes
  it out alive." The title itself is the `#nmTitle` SVG in index.html, shown instead of the
  h1: the words curved down in dried-blood red, worn and chipped by an SVG filter, with black
  liquid dripping off them (each drip grows, then a drop falls). Static lines and a pulsing
  red edge over everything, red buttons, red-eyed animatronics staring from the stage, and
  the music box slowed down, out of tune and falling apart over a sour drone, with someone
  whispering from one side then the other — now and then in real words: recorded ones once
  they've been made on the recorder's Sounds section (`whisper-1` … `whisper-7`), until then
  the device's whispering voice where it has one (`sfx.whisper` in [js/audio.js](js/audio.js)). Every 13–23 s the
  lights cut out, the screen flashes red, a music box stings and one of them glares.
- **Nights:** everything but daytime is darker and redder (ambient ×0.55, room lights ×0.5,
  fog ×1.5 and blood-dark), and the lights stutter. Every animatronic's eyes glow red. Your
  heartbeat starts when one is within 14 m and races as it closes in. Every 50–100 s
  something that isn't there: lights out, a red flash, a music box. Jumpscares hold for 2.5 s
  instead of 1.7, with a second scream.

**Debug mode** (Settings → Debug), like Ship Dash's: every night, the house level and
Secret Night 21 are open in Pick a Night, a 🛠 DEBUG badge shows on the menus, and the HUD's
night tag says DEBUG. Nothing done in debug mode is saved — not progress, stars, stats or
cutscenes seen — and turning it off reloads the real save. It's remembered under
`survive_gus_debug`. (This is separate from `?debug=1`, which adds the developer handles
below.)

## Shadows

The designer's idea, from his ninth round: **shadow versions of all the animatronics, but
really rare.** Asked the rest, he chose: they show up **everywhere** (any night at the
PlayPlace, any level of any story), **one night in a thousand**, and when one comes **"it kills
you automatically, nothing can stop them, but it's super rare."**

So once in a thousand starts (every night, level or chapter, retries included), a shadow comes
20 to 90 seconds in ([js/shadows.js](js/shadows.js)): one of the animatronics that's there that
night, painted pitch black, with white glowing eyes. It appears nine metres behind whoever
it's after, stares for a moment, then drifts straight at them through the walls; get more
than 15 m away and it's six metres behind you again. When it reaches you (or after nine
seconds) it catches you, and nothing helps: not a hiding spot, not Spooky's second chance, not
the Shop's extra life, not the lucky coin. Its jumpscare is the usual one, and the caught
screen says **A SHADOW!** — then it's a retry like any other. `stats.shadows` counts how many
you've met. (People in suits — Officer Grumble, Peter — don't have shadows.)

## Jumpscares

Like the real FNAF games (the designer's call), everywhere in the game
([js/jumpscare.js](js/jumpscare.js)): it lunges the last metre and a half into your face in
a split second; holds there, filling the screen, mouth wide open, head jerking about like
it's glitching, lit up so you see every bit of it, with an electronic screech; then the
picture cuts to TV static for a moment before the GOTCHA screen. Nightmare holds the face
longer and screams twice.

Then he asked for them to be **"x99999999999999999999999999 scarier"**, and picked
everything offered: **"just make it super scary like fnaf, louder, longer scream, face right
in yours, screen goes crazy, creepy eyes."** So now:

- **The lunge** is faster (0.1 s, from over two metres) and starts with a **bang**
  (`sfx.scareBang`), and once it's in your face it **keeps lunging at you** in spasms.
- **All teeth:** every animatronic bares two rows of big FNAF 4 teeth for the scare
  (`scareTeeth`, the same teeth as `addBigTeeth`), hidden again afterwards unless it always
  has them (In the Closets, Max's chapters). The mouth opens all the way.
- **Creepy eyes** (`creepyEyes` in models.js): for the first 0.3 s the eyes go pitch black
  with a tiny white dot in each, then the dots blaze up big and red.
- **The screen goes crazy** (`#scareFx`, `body.scaring` in style.css): playing alone the whole
  picture shakes and flickers between harsh, red and negative, and over it red flashes pulse
  and glitch bars tear across (in just your half, with two playing). Turned down if the device
  asks for reduced motion.
- **The scream** (`sfx.fnafScream`) is louder and longer (1.9 s), climbing as it goes, with a
  second, higher shriek on top and a growl underneath. The face holds for 1.7 s (Nightmare
  2.3 s) before the static.

## The loading screen

While the game loads, **Gus does cartwheels round and round a circle** (the designer's pick,
over spinning in place or running round it): a drawing of him, arms and legs out, turning
over and over as he goes. It's plain CSS, so it keeps going even while the page is busy, and
it comes back while Culac's Daycare is being built the first time ("BUILDING CULAC'S
DAYCARE…").

## Graphics

**FNAF look** (Settings; the designer asked for graphics like the original FNAF game):
washed-out colours, crushed blacks, film grain, faint scanlines and a dark vignette over
everything — a CSS filter on the canvas and an overlay (`body.fnaf`, `#fnafLook` in
[style.css](style.css)), so it works with either look below. **Pizzaplex** (the default)
uses it in Lost in the Pizzaplex only; **Everywhere** for the whole game; or **Off**. Stored
under `survive_gus_look`.

Two looks, picked in Settings (Realistic / Fast) and stored apart from the save under
`survive_gus_gfx`. Phones and tablets start on Fast; everything else on Realistic. Switching
reloads the page and lands back in Settings. `?gfx=real` or `?gfx=fast` overrides it for
testing.

**Fast** is the original toy-box look: flat Lambert surfaces, chunky low-resolution
textures, no post-processing. It still gets the designer's darker nights, dimmer days and
matte fur.

**Realistic** ([js/graphics.js](js/graphics.js), [js/materials.js](js/materials.js),
[js/realtex.js](js/realtex.js)):

- Every surface is physically based. Textures are painted at real-world detail at startup
  (50 cm vinyl checker tiles with grout and scuffs, carpet fibres, cinder block, foam play
  mats, floorboards, a black drop ceiling, a tiled wainscot) with a height map turned into a
  normal map and a roughness map. A world-space grime texture keeps any two metres from
  matching, and dirt gathers along the bottom of walls and furniture.
- Floors reflect the room: the scene is drawn a second time from a mirror camera under the
  floor at half size, blurrier where the floor is rougher.
- The animatronics are fur costumes: ten shells of strands stand off every furry part (one
  instanced draw each), with matted patches, plastic bills and beaks that are scuffed and
  grubby, yellowed glass eyes under heavy fur lids. The old originals are the same, faded,
  dustier and matted flatter. People get faces, hands, fabric clothes and strand hair.
- Post-processing: ambient occlusion, bloom on anything brighter than white (eyes, neon,
  exit signs, light panels, pushed to `GLOW` × their colour), the flashlight's beam
  ray-marched through dusty air with its own shadows in it, lens fringing, vignette, a
  highlight shoulder that leaves the darks alone, and film grain.
- The flashlight has a truer falloff (22 at decay 1.5, against 70 at 1.2 on Fast).
  Jonathan's hands are capped in brightness so the bulb beside them doesn't blind you.

Lighting moods ([js/lighting.js](js/lighting.js)) scale the room lights for both looks:
nights at 0.55 of each light's night value (the office lamp excepted — it's the one safe,
lit place), days at 0.7, with day exposure at 0.8 on Realistic.

## Controls

Bindings live in `KEYMAP` ([js/config.js](js/config.js)) and reach players through the
control lists in the pause menu and How to Play, which render from the same table.

Movement is WASD only — the arrow keys belong to the repair puzzles and the camera monitor.
E uses whatever you're looking at (cameras, a broken game, a fuse box, a powered-down
animatronic, the junk pile, the time clock). Click uses your weapon; 1–4, Q or the wheel
switch. R is the Shop's Gus mask, X picks a thing in your pocket and V uses it. Losing the
mouse (Escape) pauses the game. Touch: a floating stick on the left, look
on the right, buttons for weapon, E, flashlight, swap, run, crouch, 😀 emotes and pause, and at night the Shop's
pocket, ↻ and 🎭 once you have them. The stick only
walks; 🏃 toggles running (it lights up, and switches off after two seconds standing still); the monitor and
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
js/models.js      Every character mesh and its poses, fur shells, and Jonathan's hands
js/lighting.js    Day / night / blackout / title light rigs
js/graphics.js    The realistic look's passes: floor mirror, AO, bloom, beam, composite
js/materials.js   Building surfaces: Lambert on Fast, physically based with grime on Realistic
js/realtex.js     The realistic textures, their normal and roughness maps, fur, worn plastic
js/player.js      Jonathan: movement, stamina, flashlight, camera
js/weapons.js     Taser, baseballs, knife, Magnum
js/animatronics.js  The five's AI, Gus's hunts, the friends, the Junk Monster
js/night.js       The clock, wake-ups, breakages, blackouts, bosses, the 6 AM report
js/day.js         Daytime: kids, music, the show, the song's words on screen
js/song.js        The daytime song: words, tune, form, the robots' loudness (written by dev/sing.py)
js/house.js       Jonathan's house: its floor plan, furniture and the van
js/cutscene.js    The cutscene player
js/story.js       Every cutscene script
js/voices.js      Plays Jonathan's and Timmy's recorded lines
js/recorded.js    Which lines have a recording, and how loud they are (written by dev/add_voices.py)
js/timmy.js       Timmy: crying in the ball pit, then following Jonathan
js/phone.js       The office phone's keypad
js/shop.js        Gus tokens, the Shop screen, and what you buy: the mask, pocket, shutters, balloons, hats, emotes
js/machines.js    Broken/fixed state and looks for games and fuse boxes
js/repair.js      The three repair puzzles
js/cameras.js     The security monitor and office monitor feeds
js/hud.js         HUD updates and screen contents
js/touch.js       Phone and tablet controls
js/coop.js        2 Players: each player's keys and controller (Controls), and their half of the HUD (PaneHud)
js/physics.js     Circle-vs-box sliding collision
js/audio.js       Synthesized sound, ambience, Gus's music box, the music, and the band's singing
js/save.js        localStorage profiles (Survival's and Story mode's), and the graphics and difficulty settings
js/campaign.js    Story mode: every story in a row, Continue / New game, the cards between stories
js/escape/mode.js When Jonathan Was Five: levels, quests, save boxes, hiding, the box, caught, escaped
js/escape/levels/ Its eight levels, one file each (index.js lists them in order)
js/escape/decor.js  Its furniture: save boxes, hiding spots, things to find, exits, bookcases...
js/escape/cast.js   Little Jonathan, Jack, the Night Bots, Pjork, the grown-ups, the robots, the baby Gus's
js/escape/enemies.js  Stalkers (walk their rounds, chase) and Watchers (move when you don't look)
js/escape/jack.js   Jack, following you
js/escape/watch.js  The Gus Watch: quests, the map, the Entity Tracker
js/escape/story.js  Its cutscenes
js/plex/mode.js   Lost in the Pizzaplex: When Jonathan Was Five's engine with its own chapters, cast and clock
js/plex/chapters/ Its chapters, one file each (index.js lists them, and who plays chapters not built yet)
js/plex/heroes.js Who you can be: each one's height, speed and hands
js/plex/cast.js   The kids and Jackson, DJ Rocco, the tiny Gus plushies, everyone's hands
js/plex/pizzaplex.js  The Pizzaplex's floor plan and furniture, shared by every chapter set on the main floor
js/plex/bedroom.js    Max's chapters: the doors, the closet and the bed (like FNAF 4)
js/plex/office.js     Jackson's chapters: doors, hall lights, cameras and power (like FNAF 1)
js/plex/story.js  Its cutscenes
js/plex/chapters/<name>.js  Each character's chapters after the first five (jonathan, max, jackson, jack, thomas, timmy, finale)
js/plex/maps/     Jonathan's maps beyond the main floor (backstage, the Fun Zone, the Main Entrance...)
js/plex/tunnels/  Jack's tunnels: P.A.L.'s jobs and maps
js/plex/pit/      Thomas's ball pit: the eras he falls into
js/sushi/mode.js  Sushi's Pizzaplex: the same engine again, plus cards and card doors, vents, plushies and the shelf, friends
js/sushi/parts.js Its four parts: quests, who's where, and what happens when
js/sushi/cast.js  Tom and his friends, Sushi, Gerald on strings, the cart and kart riders, Peter's otter suit
js/sushi/enemies.js  Puppet (Gerald), Rider (Chomper, Flipper), Blinker (Moony), Springer (Peter)
js/sushi/kit.js   Cards, card doors, vents, plushies, the shelf, noisy toys, ropes, walkie-talkie lines
js/sushi/maps/    The Pizzaplex (parts 1 and 3), Gerald's Daycare, the vents and the way out
js/sushi/story.js Its cutscenes
js/closets/mode.js   In the Closets: the closets (breathing, spamming them shut, hiding), Gus, the mirrors
js/closets/house.js  Timmy's house: four floors of five rooms, a closet in each, the stairs, the mirrors
js/closets/levels.js Its ten levels, one row of numbers each, and their cards
js/closets/story.js  Its cutscenes: Gramma off to the night shift, and Gramma coming home
js/culac/mode.js     10 Nights at Culac's Daycare: the kids and the raids, the cameras, Leo, the lamps, the giant slide
js/culac/place.js    The Building that can cope with 2.2 km: paths, colliders in a grid, everything batched in chunks
js/culac/layout.js   The designer's map: every room, door, the giant maze, everyone's home, the ten exits
js/culac/world.js    Everything in it, instanced: beds, tables, arcade machines, trees, the ball pit, lamps
js/culac/cast.js     Leo, the kids, Officer Grumble, Mean Baby, Roglego, Ouchie and Gokupug
js/culac/enemies.js  Raids, Mean Baby's cry, Roglego through walls, Ouchie flying, Gokupug's jump, Sunny, Grumble
js/culac/nights.js   Its ten nights and their cards
js/culac/story.js    Its cutscenes: Mom dropping Jimmy off, and everybody out the front doors
js/plex/timmy/tubes.js  Timmy's play tubes and play houses: crawling, hiding where nothing else fits
js/plex/followers.js    Friends walking along behind you (Chapter 50)
js/jumpscare.js   The FNAF-style jumpscare every scare in the game uses: lunge, scream, static
js/shadows.js     The shadow animatronics: once in a thousand nights, anywhere, and nothing stops them
js/updates.js     Detects new deploys and refreshes stale sessions
js/version.js     Build version — bump on every deploy
dev/preview.html  Art preview: framed day/night shots of rooms and characters
gallery/          The pictures in the title screen's Gallery (GALLERY in config.js)
dev/record.html   Voice recorder for Jonathan's and Timmy's lines, and the daytime song
dev/add_voices.py Turns recorded takes into audio/voices/*.m4a and updates js/recorded.js
dev/sing.py       Sings the daytime song with the robot band: audio/song/*.m4a and js/song.js
audio/voices/     The recorded voice lines
audio/song/       The robot band singing each line of the daytime song
```

## Debug handles

Load with `?debug=1` to get (add `&gfx=fast` or `&gfx=real` to force a graphics setting):

- `window.__game` — the running game. `__game.profile` is the save; `__game.night`,
  `__game.bots`, `__game.player`, `__game.machines` are the live state.
- `window.__input` — the input singleton.
- `__game.shadows.summon()` brings a shadow now; `__game.shadows.force = true` gives the next
  night one.
- `window.__three` — the Three.js namespace.

Useful one-liners:

```js
__game.startNight(15);                       // jump to any night
__game.night.time = 355;                     // five seconds to 6 AM
__game.night.blackout();                     // lights out — here comes Gus
__game.machines.breakRandom();               // break a game
__game.bot('cranker').powerDown();           // zap one from the console
__game.profile.night = 20; __game.profile.best = 20;  // unlock the Gus fight
__game.setCoop(true);                        // 2 Players on (__game.p2 is Jimmy)
__game.shop.earn(100);                       // Gus tokens to spend (saved, unless in debug mode)
__game.withPlayer(__game.p2, () => __game.caught(__game.bot('cranker')));  // catch Jimmy
```

Note that `requestAnimationFrame` is paused whenever the tab is hidden, so stepping the game
from a background tab needs `__game.update(1/60)` called yourself.

## Save data

One profile in `localStorage` under `survive_gus_save_v1` — current night, kids' happiness,
whether the intro has been seen, whether the house level is done, whether Timmy is home, which one-time cutscenes
have played (and whether you've read the old guard's note), the two boss wins, the furthest night reached, which nights have a Nightmare ⭐, whether you have Old John's badge, and lifetime stats (including how many shadows you've met). It's merged over a fresh profile on load, so a save written by an older build never
arrives missing a field newer code reads, and it only changes at 6 AM (or a boss win).

The story modes keep their progress inside it, each the same shape: `escape` (When
Jonathan Was Five), `plex` (Lost in the Pizzaplex), `sushi` (Sushi's Pizzaplex, plus its
plushies), `closets` (In the Closets) and `culac` (10 Nights at Culac's Daycare; its save
boxes also remember any kid left somewhere, `flags.lost`) — the furthest level or chapter reached, which
cutscenes have played, golden plushies, ⭐s, every quest ever done, and the last save box
touched. A New game of the main story leaves them all alone.

Story mode has a second profile of the same shape, under `survive_gus_story_v1`, with
`campaign: { key, done }` (the story you're on). `save.js`'s `setSlot('main' | 'story')`
picks which one `loadProfile` and `saveProfile` use: Story mode switches to it, and the title
screen switches back.

The Shop keeps its own save beside the profile, under `survive_gus_shop`: your tokens, how
many you've earned in all, what you own, how many of each one-use thing you have, and who's
wearing which hat. It's saved the moment it changes, so it never goes back when a night
restarts, and a New game leaves it alone. In debug mode the Shop works on a copy with 999
tokens, and nothing is saved.
