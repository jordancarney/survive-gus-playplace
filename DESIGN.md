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
  past.**
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
animatronic you'd zapped got back up behind the menu after you were caught.
- **On Easy: unlimited flashlight, taser zaps and running, and no power outages until
  Night 10.**
- **Make the power go out more:** "once every night starting on night 2". Nights 2–4 now
  have a blackout each (Gus comes out), the flicker cutscene moved to Night 2, and the later
  nights keep their two and three.

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
sprinting. While crouched, no animatronic except Gus can see, hear or catch you — one that
was chasing you loses you and goes searching, and one that walks right into you walks past.
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

## Settings and difficulty

The **⚙️ Settings** tab hangs off the bottom middle of the title screen, beside the **📷
Gallery** tab (pictures taken while making the game, in `gallery/`, listed with captions in
`GALLERY` in [js/config.js](js/config.js); tap one to see it big). Settings holds the graphics
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

## Graphics

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
switch. Losing the mouse (Escape) pauses the game. Touch: a floating stick on the left, look
on the right, buttons for weapon, E, flashlight, swap, run, crouch and pause. The stick only
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
js/day.js         Daytime: kids, music, the show
js/house.js       Jonathan's house: its floor plan, furniture and the van
js/cutscene.js    The cutscene player
js/story.js       Every cutscene script
js/voices.js      Plays Jonathan's and Timmy's recorded lines
js/recorded.js    Which lines have a recording, and how loud they are (written by dev/add_voices.py)
js/timmy.js       Timmy: crying in the ball pit, then following Jonathan
js/phone.js       The office phone's keypad
js/machines.js    Broken/fixed state and looks for games and fuse boxes
js/repair.js      The three repair puzzles
js/cameras.js     The security monitor and office monitor feeds
js/hud.js         HUD updates and screen contents
js/touch.js       Phone and tablet controls
js/physics.js     Circle-vs-box sliding collision
js/audio.js       Synthesized sound, ambience, Gus's music box, and the music
js/save.js        localStorage profile, and the graphics and difficulty settings
js/updates.js     Detects new deploys and refreshes stale sessions
js/version.js     Build version — bump on every deploy
dev/preview.html  Art preview: framed day/night shots of rooms and characters
gallery/          The pictures in the title screen's Gallery (GALLERY in config.js)
dev/record.html   Voice recorder for Jonathan's and Timmy's lines
dev/add_voices.py Turns recorded takes into audio/voices/*.m4a and updates js/recorded.js
audio/voices/     The recorded voice lines
```

## Debug handles

Load with `?debug=1` to get (add `&gfx=fast` or `&gfx=real` to force a graphics setting):

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
whether the intro has been seen, whether the house level is done, whether Timmy is home, which one-time cutscenes
have played (and whether you've read the old guard's note), the two boss wins, the furthest night reached, which nights have a Nightmare ⭐, whether you have Old John's badge, and lifetime stats. It's merged over a fresh profile on load, so a save written by an older build never
arrives missing a field newer code reads, and it only changes at 6 AM (or a boss win).
