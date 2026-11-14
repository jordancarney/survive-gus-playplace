// Who you can be in Lost in the Pizzaplex: how tall each one is (their eye height), how fast
// they walk and run, and the hands you see. Every chapter names its hero.
import { PLAYER, KID } from '../config.js';
import { buildHands } from './cast.js';

// Between little Jonathan at five (KID) and a grown-up (PLAYER), by age.
const kidSizes = (eye, walk, sprint) => ({
  ...KID, eyeHeight: eye, walkSpeed: walk, sprintSpeed: sprint, crouchHeight: Math.max(0.6, eye * 0.55),
  crouchSpeed: walk * 0.5, radius: 0.3,
});

export const HEROES = {
  jonathan: {
    name: 'Jonathan', age: 9, icon: '🔵', sizes: kidSizes(1.22, 3.9, 6.4),
    hands: () => buildHands({ sleeve: 0x2a5ab8, skin: 0xd9a07a, scale: 0.68 }),
  },
  max: {
    name: 'Max', age: 11, icon: '🟣', sizes: kidSizes(1.34, 4.0, 6.6),
    hands: () => buildHands({ sleeve: 0x7a3ab8, skin: 0xf1c7a5, scale: 0.74 }),
  },
  jackson: {
    name: 'Jackson', age: 22, icon: '🔦', sizes: { ...PLAYER },
    hands: () => buildHands({ sleeve: 0x4a2a7a, skin: 0x6e4529, watch: false, scale: 0.9 }),
  },
  jack: {
    name: 'Jack', age: 10, icon: '🔴', sizes: kidSizes(1.28, 3.9, 6.5),
    hands: () => buildHands({ sleeve: 0xc0262d, skin: 0xf1c7a5, scale: 0.7 }),
  },
  // Timmy, from Chapter 27: the smallest of all (he's six), small enough for the play tubes.
  timmy: {
    name: 'Timmy', age: 6, icon: '⚪', sizes: kidSizes(0.98, 3.6, 6.0),
    hands: () => buildHands({ sleeve: 0xf4f1ea, skin: 0xf1c7a5, scale: 0.58 }),
  },
  thomas: {
    name: 'Thomas', age: 7, icon: '🟢', sizes: kidSizes(1.08, 3.7, 6.1),
    hands: () => buildHands({ sleeve: 0x2f7a3a, skin: 0xf6d7bf, scale: 0.62, baggy: true }),
  },
};
