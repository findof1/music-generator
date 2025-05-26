import { pushRandom8th, pushRandom16th, push2Random16th, pushSame8th, canPush8th, canPush16th, pushSame16th } from "./musicUtils.js";

export function handleSixteenthNoteRuns(notes, keys, difficulty, counter, measureLength, lastKey, maxJump) {
   if (difficulty >= 14) {
    let rand = Math.floor(Math.random() * 8);
    if (rand == 0) {
      return doSame16thDiff8th(notes, keys, difficulty, counter, measureLength, lastKey, maxJump);
    } else {
      return do2Pairs(notes, keys, difficulty, counter, measureLength, lastKey, maxJump);
    }
  }

  if (difficulty == 13) {
    let rand = Math.floor(Math.random() * 8);
    if (rand == 0) {
      return doSame16thSame8th(notes, keys, difficulty, counter, measureLength, lastKey, maxJump);
    } else {
      return do2Pairs(notes, keys, difficulty, counter, measureLength, lastKey, maxJump);
    }
  }

  if (difficulty == 12) {
    return do2Pairs(notes, keys, difficulty, counter, measureLength, lastKey, maxJump);
  }

  if (difficulty == 11) {
    return do4SameSixteenths(notes, keys, difficulty, counter, measureLength, lastKey, maxJump);
  }

  return { counter, lastKey };
}

function doSame16thDiff8th(notes, keys, difficulty, counter, measureLength, lastKey, maxJump) {
  lastKey = pushRandom16th(notes, lastKey, keys, maxJump, difficulty);
  counter += 1;

  if (!canPush16th(counter, measureLength)) {
    return { counter, lastKey };
  }

  lastKey = pushSame16th(notes, lastKey, keys, maxJump, difficulty);
  counter += 1;

  if (!canPush8th(counter, measureLength)) {
    return { counter, lastKey };
  }

  lastKey = pushRandom8th(notes, lastKey, keys, maxJump, difficulty);
  counter += 2;
  return { counter, lastKey };
}

function doSame16thSame8th(notes, keys, difficulty, counter, measureLength, lastKey, maxJump) {
  lastKey = pushRandom16th(notes, lastKey, keys, maxJump, difficulty);
  counter += 1;

  if (!canPush16th(counter, measureLength)) {
    return { counter, lastKey };
  }

  lastKey = pushSame16th(notes, lastKey, keys, maxJump, difficulty);
  counter += 1;

  if (!canPush8th(counter, measureLength)) {
    return { counter, lastKey };
  }

  lastKey = pushSame8th(notes, lastKey, keys, maxJump, difficulty);
  counter += 2;
  return { counter, lastKey };
}

function do2Pairs(notes, keys, difficulty, counter, measureLength, lastKey, maxJump) {
  lastKey = pushRandom16th(notes, lastKey, keys, maxJump, difficulty);
  counter += 1;

  if (!canPush16th(counter, measureLength)) {
    return { counter, lastKey };
  }

  lastKey = pushSame16th(notes, lastKey, keys, maxJump, difficulty);
  counter += 1;

  if (!canPush16th(counter, measureLength)) {
    return { counter, lastKey };
  }

  lastKey = pushRandom16th(notes, lastKey, keys, maxJump, difficulty);
  counter += 1;

  if (!canPush16th(counter, measureLength)) {
    return { counter, lastKey };
  }

  lastKey = pushSame16th(notes, lastKey, keys, maxJump, difficulty);
  counter += 1;

  return { counter, lastKey };
}

function do4SameSixteenths(notes, keys, difficulty, counter, measureLength, lastKey, maxJump) {
  lastKey = pushRandom16th(notes, lastKey, keys, maxJump, difficulty);
  counter += 1;

  if (!canPush16th(counter, measureLength)) {
    return { counter, lastKey };
  }

  lastKey = pushSame16th(notes, lastKey, keys, maxJump, difficulty);
  counter += 1;

  if (!canPush16th(counter, measureLength)) {
    return { counter, lastKey };
  }

  lastKey = pushSame16th(notes, lastKey, keys, maxJump, difficulty);
  counter += 1;

  if (!canPush16th(counter, measureLength)) {
    return { counter, lastKey };
  }

  lastKey = pushSame16th(notes, lastKey, keys, maxJump, difficulty);
  counter += 1;

  return { counter, lastKey };
}
