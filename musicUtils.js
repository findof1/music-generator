import { VF, getKeyIndex, maximumNoteSubdivision } from "./app.js";

export function canPushQ(counter, measureLength) {
  return counter + 4 <= measureLength * maximumNoteSubdivision;
}

export function canPush8th(counter, measureLength) {
  return counter + 2 <= measureLength * maximumNoteSubdivision;
}

export function canPush16th(counter, measureLength) {
  return counter + 1 <= measureLength * maximumNoteSubdivision;
}

export function pushRandomQ(notes, lastKey, keys, maxJump, difficulty) {
  let keyIndex = getKeyIndex(lastKey, keys, maxJump);
  let key = keys[keyIndex];

  pushNote(notes, key, "q", difficulty);
  return keyIndex;
}

export function pushRandom8th(notes, lastKey, keys, maxJump, difficulty) {
  let keyIndex = getKeyIndex(lastKey, keys, maxJump);
  let key = keys[keyIndex];

  pushNote(notes, key, "8", difficulty);
  return keyIndex;
}

export function pushSame8th(notes, lastKey, difficulty) {
  let key = keys[lastKey];

  pushNote(notes, key, "8", difficulty);
  return lastKey;
}

export function pushSame16th(notes, lastKey, difficulty) {
  let key = keys[lastKey];

  pushNote(notes, key, "16", difficulty);
  return lastKey;
}

export function push2Random8th(notes, lastKey, keys, maxJump, difficulty) {
  let keyIndex = getKeyIndex(lastKey, keys, maxJump);
  let key = keys[keyIndex];

  pushNote(notes, key, "8", difficulty);
  pushNote(notes, key, "8", difficulty);
  return keyIndex;
}

export function pushRandom16th(notes, lastKey, keys, maxJump, difficulty) {
  let keyIndex = getKeyIndex(lastKey, keys, maxJump);
  let key = keys[keyIndex];

  pushNote(notes, key, "16", difficulty);
  return keyIndex;
}

export function push2Random16th(notes, lastKey, keys, maxJump, difficulty) {
  let keyIndex = getKeyIndex(lastKey, keys, maxJump);
  let key = keys[keyIndex];

  pushNote(notes, key, "16", difficulty);
  pushNote(notes, key, "16", difficulty);
  return keyIndex;
}

export function push4Random16th(notes, lastKey, keys, maxJump, difficulty) {
  let keyIndex = getKeyIndex(lastKey, keys, maxJump);
  let key = keys[keyIndex];

  pushNote(notes, key, "16", difficulty);
  pushNote(notes, key, "16", difficulty);
  pushNote(notes, key, "16", difficulty);
  pushNote(notes, key, "16", difficulty);
  return keyIndex;
}

export function pushNote(notes, key, duration, difficulty) {
  let randRest = Math.floor(Math.random() * getRestProbability(duration, difficulty));
  let durationCopy = randRest == 0 ? duration + "r" : duration;
  let keyCopy = randRest == 0 ? "b/4" : key;
  if (durationCopy.includes("d")) {
    const baseDuration = durationCopy.replace("d", "");
    const note = new VF.StaveNote({ keys: [keyCopy], duration: baseDuration, dots: 1 });
    VF.Dot.buildAndAttach([note], { all: true });
    notes.push(note);
  } else {
    notes.push(new VF.StaveNote({ keys: [keyCopy], duration: durationCopy }));
  }
}

function getRestProbability(duration, difficulty) {
  const options = {
    w: 8,
    hd: 12,
    h: 6,
    q: 4,
    qd: 12,
    8: difficulty >= 6 ? 4 : 16,
    16: difficulty == 9 ? 64 : difficulty == 10 ? 32 : 9999999999,
  };

  return options[duration] || options["16"];
}

export function getKeys(rangeDifficulty) {
  if (rangeDifficulty == 1) {
    return ["c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5"];
  }
  if (rangeDifficulty == 2) {
    return ["a/3", "b/3", "c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5", "d/5", "e/5"];
  }
  if (rangeDifficulty == 3) {
    return ["a/3", "b/3", "c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5", "d/5", "e/5", "f/5"];
  }
  if (rangeDifficulty == 4) {
    return ["g/3", "a/3", "b/3", "c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5", "d/5", "e/5", "f/5", "g/5"];
  }
  if (rangeDifficulty == 5) {
    return ["g/3", "a/3", "b/3", "c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5", "d/5", "e/5", "f/5", "g/5", "a/5", "b/5"];
  }
  if (rangeDifficulty == 6) {
    return ["g/3", "a/3", "b/3", "c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5", "d/5", "e/5", "f/5", "g/5", "a/5", "b/5", "c/6"];
  }
  if (rangeDifficulty == 7) {
    return ["g/3", "a/3", "b/3", "c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5", "d/5", "e/5", "f/5", "g/5", "a/5", "b/5", "c/6", "d/6"];
  }
}

export function getNoteOptionsByDifficulty(difficulty, timeSignature) {
  let options;
  if (timeSignature == "4/4") {
    options = {
      1: { lengths: ["w", "h"], values: [16, 8] },
      2: { lengths: ["w", "h", "q"], values: [16, 8, 4] },
      3: { lengths: ["w", "hd", "h", "q", "8"], values: [16, 12, 8, 4, 2] },
      4: { lengths: ["w", "hd", "h", "q", "8"], values: [16, 12, 8, 4, 2] },
      5: { lengths: ["w", "hd", "h", "qd", "q", "8"], values: [16, 12, 8, 6, 4, 2] },
      6: { lengths: ["w", "hd", "h", "qd", "q", "8", "16"], values: [16, 12, 8, 6, 4, 2, 1] },
      7: { lengths: ["w", "hd", "h", "qd", "q", "8", "16"], values: [16, 12, 8, 6, 4, 2, 1] },
    };
  }
  if (timeSignature == "3/4") {
    options = {
      1: { lengths: ["hd"], values: [12] },
      2: { lengths: ["hd", "h", "q"], values: [12, 8, 4] },
      3: { lengths: ["hd", "h", "q", "8"], values: [12, 8, 4, 2] },
      4: { lengths: ["hd", "h", "q", "8"], values: [12, 8, 4, 2] },
      5: { lengths: ["hd", "h", "qd", "q", "8"], values: [12, 8, 6, 4, 2] },
      6: { lengths: ["hd", "h", "qd", "q", "8", "16"], values: [12, 8, 6, 4, 2, 1] },
      7: { lengths: ["hd", "h", "qd", "q", "8", "16"], values: [12, 8, 6, 4, 2, 1] },
    };
  }
  if (timeSignature == "2/4") {
    options = {
      1: { lengths: ["h"], values: [8] },
      2: { lengths: ["h", "q"], values: [8, 4] },
      3: { lengths: ["h", "q", "8"], values: [8, 4, 2] },
      4: { lengths: ["h", "q", "8"], values: [8, 4, 2] },
      5: { lengths: ["h", "qd", "q", "8"], values: [8, 6, 4, 2] },
      6: { lengths: ["h", "qd", "q", "8", "16"], values: [8, 6, 4, 2, 1] },
      7: { lengths: ["h", "qd", "q", "8", "16"], values: [8, 6, 4, 2, 1] },
    };
  }

  return options[difficulty] || options[7]; // fallback to hardest
}
