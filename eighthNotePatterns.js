import { pushRandomQ, pushRandom8th, push2Random8th, canPushQ, canPush8th, pushRandom16th, pushSame16th, pushRandomQD, canPushH } from "./musicUtils.js";

export function handle8thNotePatterns(notes, keys, difficulty, counter, measureLength, lastKey, maxJump) {
  if (difficulty >= 14) {
    let rand = Math.floor(Math.random() * 3);

    if (rand == 0) {
      lastKey = pushRandom8th(notes, lastKey, keys, maxJump, difficulty);
      counter += 2;

      if (!canPush8th(counter, measureLength)) {
        return { counter, lastKey };
      }

      lastKey = pushRandom16th(notes, lastKey, keys, maxJump, difficulty);
      counter += 1;

      lastKey = pushSame16th(notes, lastKey, keys, maxJump, difficulty);
      counter += 1;
      return { counter, lastKey };
    }
  }

  if (difficulty == 13) {
    let rand = Math.floor(Math.random() * 3);

    if (rand == 0) {
      lastKey = pushRandom8th(notes, lastKey, keys, maxJump, difficulty);
      counter += 2;

      if (!canPush8th(counter, measureLength)) {
        return { counter, lastKey };
      }

      lastKey = pushSame16th(notes, lastKey, keys, maxJump, difficulty);
      counter += 1;

      lastKey = pushSame16th(notes, lastKey, keys, maxJump, difficulty);
      counter += 1;
      return { counter, lastKey };
    }
  }

  if (difficulty >= 7) {
    let rand = Math.floor(Math.random() * 8);

    if (rand == 0 && canPushH(counter, measureLength)) {
   
      lastKey = pushRandom8th(notes, lastKey, keys, maxJump, difficulty);
      counter += 2;

      lastKey = pushRandomQD(notes, lastKey, keys, maxJump, difficulty);
      counter += 6;
      return { counter, lastKey };
    }
  }

  if (difficulty >= 6) {
    return allowSyncopation(notes, keys, difficulty, counter, measureLength, lastKey, maxJump);
  }

  if (difficulty == 5) {
    return do2Diff8thNotes(notes, keys, difficulty, counter, measureLength, lastKey, maxJump);
  }

  if (difficulty == 4) {
    return do2Diff8thNotes(notes, keys, difficulty, counter, measureLength, lastKey, 1);
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

  if (rand == 1 && difficulty >= 18) {
    lastKey = pushRandom8th(notes, lastKey, keys, maxJump, difficulty);
    counter += 2;
    return { counter, lastKey };
  }

  if (rand == 1 && difficulty >= 18) {
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
