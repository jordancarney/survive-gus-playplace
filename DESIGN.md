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

## Jumpscares

Like the real FNAF games (the designer's call), everywhere in the game
([js/jumpscare.js](js/jumpscare.js)): it lunges the last metre and a half into your face in
a split second; holds there, filling the screen, mouth wide open, head jerking about like
it's glitching, lit up so you see every bit of it, with an electronic screech; then the
picture cuts to TV static for a moment before the GOTCHA screen. Nightmare holds the face
longer and screams twice.

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
js/plex/timmy/tubes.js  Timmy's play tubes and play houses: crawling, hiding where nothing else fits
js/plex/followers.js    Friends walking along behind you (Chapter 50)
js/jumpscare.js   The FNAF-style jumpscare every scare in the game uses: lunge, scream, static
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

The two story modes keep their progress inside it, each the same shape: `escape` (When
Jonathan Was Five) and `plex` (Lost in the Pizzaplex) — the furthest level or chapter reached,
which cutscenes have played, golden plushies, ⭐s, every quest ever done, and the last save
box touched. A New game of the main story leaves both alone.
