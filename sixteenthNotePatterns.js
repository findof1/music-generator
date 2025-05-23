import {
  pushRandom8th,
  pushRandom16th,
  push2Random16th,
  pushSame8th
} from "./musicUtils.js";
import { maximumNoteSubdivision } from "./app.js";

export function handleSixteenthNoteRuns(notes, keys, difficulty, counter, measureLength, lastKey, maxJump) {
  if (difficulty >= 9) {
    lastKey = pushRandom16th(notes, lastKey, keys, maxJump, difficulty);
    lastKey = pushRandom16th(notes, lastKey, keys, maxJump, difficulty);
    counter += 2;
  } else {
    lastKey = push2Random16th(notes, lastKey, keys, maxJump, difficulty);
    counter += 2;
  }

  if (counter + 2 >= measureLength
     * maximumNoteSubdivision) {
    return { counter, lastKey };
  }

  let rand = Math.floor(Math.random() * 2);
  if (rand == 0) {
    if (difficulty >= 8) {
      lastKey = pushRandom16th(notes, lastKey, keys, maxJump, difficulty);
      lastKey = pushRandom16th(notes, lastKey, keys, maxJump, difficulty);
    } else {
      lastKey = push2Random16th(notes, lastKey, keys, maxJump, difficulty);
    }

    counter += 2;
  } else {
    if (difficulty >= 7) {
      lastKey = pushRandom8th(notes, lastKey, keys, maxJump, difficulty);
    } else {
      pushSame8th(notes, lastKey, difficulty);
    }
    counter += 2;
  }

  return { counter, lastKey };
}