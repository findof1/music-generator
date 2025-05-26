import { pushRandomQD,pushRandom8th,  canPush8th, canPushH, canPushQD, pushSame8th, pushSame16th } from "./musicUtils.js";

export function handleQDNotePatterns(notes, keys, difficulty, counter, measureLength, lastKey, maxJump) {

  if (difficulty >= 9) {
    let rand = Math.floor(Math.random() * 16);

    if(rand == 0)
      return do2QD(notes, keys, difficulty, counter, measureLength, lastKey, maxJump);

    return doQDAnd8th(notes, keys, difficulty, counter, measureLength, lastKey, maxJump);
  }

  if (difficulty == 8) {
    return doQDAnd8th(notes, keys, difficulty, counter, measureLength, lastKey, maxJump);
  }

  if (!canPushH(counter, measureLength)) {
    lastKey = pushRandomQD(notes, lastKey, keys, maxJump, difficulty);
    counter += 6;
    return { counter, lastKey };
  }

  lastKey = pushRandomQD(notes, lastKey, keys, maxJump, difficulty);
  lastKey = pushSame8th(notes, lastKey, keys, maxJump, difficulty);
  counter += 8;

  return { counter, lastKey };
}

function do2QD(notes, keys, difficulty, counter, measureLength, lastKey, maxJump) {
  lastKey = pushRandomQD(notes, lastKey, keys, maxJump, difficulty);
  counter += 6;

  if (!canPushQD(counter, measureLength)) {
    if (!canPush8th(counter, measureLength)) {
      return { counter, lastKey };
    }
    lastKey = pushRandom8th(notes, lastKey, keys, maxJump, difficulty);
    counter += 2;

    return { counter, lastKey };
  }

  lastKey = pushRandomQD(notes, lastKey, keys, maxJump, difficulty);
  counter += 6;
  return { counter, lastKey };
}

function doQDAnd8th(notes, keys, difficulty, counter, measureLength, lastKey, maxJump) {
  lastKey = pushRandomQD(notes, lastKey, keys, maxJump, difficulty);
  counter += 6;

  if (!canPush8th(counter, measureLength)) {
    return { counter, lastKey };
  }

  lastKey = pushRandom8th(notes, lastKey, keys, maxJump, difficulty);
  counter += 2;
  return { counter, lastKey };
}

