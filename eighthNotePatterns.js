import { pushRandomQ, pushRandom8th, push2Random8th, canPushQ, canPush8th } from "./musicUtils.js";

export function handle8thNotePatterns(notes, keys, difficulty, counter, measureLength, lastKey, maxJump) {
  if (difficulty >= 5) {
    return allowSyncopation(notes, keys, difficulty, counter, measureLength, lastKey, maxJump);
  }

  if (difficulty >= 4) {
    return do2Diff8thNotes(notes, keys, difficulty, counter, measureLength, lastKey, maxJump);
  }

  if (!canPushQ(counter, measureLength)) {
    lastKey = pushRandom8th(notes, lastKey, keys, maxJump, difficulty);
    counter += 2;
    return { counter, lastKey };
  }

  lastKey = push2Random8th(notes, lastKey, keys, maxJump, difficulty);
  counter += 4;

  return { counter, lastKey };
}

function do2Diff8thNotes(notes, keys, difficulty, counter, measureLength, lastKey, maxJump) {
  lastKey = pushRandom8th(notes, lastKey, keys, maxJump, difficulty);
  counter += 2;

  if (!canPush8th(counter, measureLength)) {
    return { counter, lastKey };
  }

  lastKey = pushRandom8th(notes, lastKey, keys, maxJump, difficulty);
  counter += 2;
  return { counter, lastKey };
}

function allowSyncopation(notes, keys, difficulty, counter, measureLength, lastKey, maxJump) {
  let rand = Math.floor(Math.random() * 4);

  if (rand == 1 && difficulty >= 7) {
    lastKey = pushRandom8th(notes, lastKey, keys, maxJump, difficulty);
    counter += 2;
    return { counter, lastKey };
  }

  if (rand == 0) {
    return doSyncopation(notes, keys, difficulty, counter, measureLength, lastKey, maxJump);
  }

  return do2Diff8thNotes(notes, keys, difficulty, counter, measureLength, lastKey, maxJump);
}

function doSyncopation(notes, keys, difficulty, counter, measureLength, lastKey, maxJump) {
  lastKey = pushRandom8th(notes, lastKey, keys, maxJump, difficulty);
  counter += 2;

  if (!canPushQ(counter, measureLength)) {
    return { counter, lastKey };
  }

  lastKey = pushRandomQ(notes, lastKey, keys, maxJump, difficulty);
  counter += 4;

  if (!canPush8th(counter, measureLength)) {
    return { counter, lastKey };
  }

  lastKey = pushRandom8th(notes, lastKey, keys, maxJump, difficulty);
  counter += 2;

  return { counter, lastKey };
}
