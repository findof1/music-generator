import { VF, getKeyIndex, maximumNoteSubdivision } from "./app.js";

export function canPushQ(counter, measureLength) {
  return counter + 4 <= measureLength * maximumNoteSubdivision;
}

export function canPush8th(counter, measureLength) {
  return counter + 2 <= measureLength * maximumNoteSubdivision;
}

export function canPushQD(counter, measureLength) {
  return counter + 6 <= measureLength * maximumNoteSubdivision;
}

export function canPushH(counter, measureLength) {
  return counter + 8 <= measureLength * maximumNoteSubdivision;
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

export function pushRandomQD(notes, lastKey, keys, maxJump, difficulty) {
  let keyIndex = getKeyIndex(lastKey, keys, maxJump);
  let key = keys[keyIndex];

  pushNote(notes, key, "qd", difficulty);
  return keyIndex;
}

export function pushRandom8th(notes, lastKey, keys, maxJump, difficulty) {
  let keyIndex = getKeyIndex(lastKey, keys, maxJump);
  let key = keys[keyIndex];

  pushNote(notes, key, "8", difficulty);
  return keyIndex;
}

export function pushSame8th(notes, lastKey, keys, difficulty) {
  let key = keys[lastKey];

  pushNote(notes, key, "8", difficulty);
  return lastKey;
}

export function pushSame16th(notes, lastKey, keys, difficulty) {
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
    qd: difficulty >= 10 ? 8 : 24,
    8: difficulty >= 10 ? 4 : 16,
    16: difficulty >= 17 ? 64 : difficulty == 16 ? 128 : difficulty == 15 ? 256 : 9999999999,
  };

  return options[duration] || options["16"];
}

export function durationTo16ths(duration) {
  let durationCopy = duration.replace("r", "");
  const options = {
    w: 16,
    hd: 12,
    h: 8,
    qd: 6,
    q: 4,
    8: 2,
    16: 1
  };

  return options[durationCopy];
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
      0: { lengths: ["16"], values: [1] },
      1: { lengths: ["w", "h"], values: [16, 8] },
      2: { lengths: ["w", "h", "q"], values: [16, 8, 4] },
      3: { lengths: ["w", "hd", "h", "q", "8"], values: [16, 12, 8, 4, 2] },
      4: { lengths: ["w", "hd", "h", "q", "8"], values: [16, 12, 8, 4, 2] },
      5: { lengths: ["w", "hd", "h", "q", "8"], values: [16, 12, 8, 4, 2] },
      6: { lengths: ["w", "hd", "h", "q", "8"], values: [16, 12, 8, 4, 2] },
      7: { lengths: ["w", "hd", "h", "qd", "q", "8"], values: [16, 12, 8, 6, 4, 2] },
      8: { lengths: ["w", "hd", "h", "qd", "q", "8"], values: [16, 12, 8, 6, 4, 2] },
      9: { lengths: ["w", "hd", "h", "qd", "q", "8"], values: [16, 12, 8, 6, 4, 2] },
      10: { lengths: ["w", "hd", "h", "qd", "q", "8"], values: [16, 12, 8, 6, 4, 2] },
      11: { lengths: ["w", "hd", "h", "qd", "q", "8", "16"], values: [16, 12, 8, 6, 4, 2, 1] },
      12: { lengths: ["w", "hd", "h", "qd", "q", "8", "16"], values: [16, 12, 8, 6, 4, 2, 1] },
      13: { lengths: ["w", "hd", "h", "qd", "q", "8", "16"], values: [16, 12, 8, 6, 4, 2, 1] },
      14: { lengths: ["w", "hd", "h", "qd", "q", "8", "16"], values: [16, 12, 8, 6, 4, 2, 1] },
      15: { lengths: ["w", "hd", "h", "qd", "q", "8", "16"], values: [16, 12, 8, 6, 4, 2, 1] },
      16: { lengths: ["w", "hd", "h", "qd", "q", "8", "16"], values: [16, 12, 8, 6, 4, 2, 1] },
      17: { lengths: ["w", "hd", "h", "qd", "q", "8", "16"], values: [16, 12, 8, 6, 4, 2, 1] },
      18: { lengths: ["hd", "h", "qd", "q", "8", "16"], values: [12, 8, 6, 4, 2, 1] },
      19: { lengths: ["h", "qd", "q", "8", "16"], values: [8, 6, 4, 2, 1] },
      20: { lengths: ["qd", "q", "8", "16"], values: [6, 4, 2, 1] },
    };
  }
  if (timeSignature == "3/4") {
    options = {
      0: { lengths: ["16"], values: [1] },
      1: { lengths: ["hd"], values: [12] },
      2: { lengths: ["hd", "h", "q"], values: [12, 8, 4] },
      3: { lengths: ["hd", "h", "q", "8"], values: [12, 8, 4, 2] },
      4: { lengths: ["hd", "h", "q", "8"], values: [12, 8, 4, 2] },
      5: { lengths: ["hd", "h", "q", "8"], values: [12, 8, 4, 2] },
      6: { lengths: ["hd", "h", "q", "8"], values: [12, 8, 4, 2] },
      7: { lengths: ["hd", "h", "qd", "q", "8"], values: [12, 8, 6, 4, 2] },
      8: { lengths: ["hd", "h", "qd", "q", "8"], values: [12, 8, 6, 4, 2] },
      9: { lengths: ["hd", "h", "qd", "q", "8"], values: [12, 8, 6, 4, 2] },
      10: { lengths: ["hd", "h", "qd", "q", "8"], values: [12, 8, 6, 4, 2] },
      11: { lengths: ["hd", "h", "qd", "q", "8", "16"], values: [12, 8, 6, 4, 2, 1] },
      12: { lengths: ["hd", "h", "qd", "q", "8", "16"], values: [12, 8, 6, 4, 2, 1] },
      13: { lengths: ["hd", "h", "qd", "q", "8", "16"], values: [12, 8, 6, 4, 2, 1] },
      14: { lengths: ["hd", "h", "qd", "q", "8", "16"], values: [12, 8, 6, 4, 2, 1] },
      15: { lengths: ["hd", "h", "qd", "q", "8", "16"], values: [12, 8, 6, 4, 2, 1] },
      16: { lengths: ["hd", "h", "qd", "q", "8", "16"], values: [12, 8, 6, 4, 2, 1] },
      17: { lengths: ["hd", "h", "qd", "q", "8", "16"], values: [12, 8, 6, 4, 2, 1] },
      18: { lengths: ["h", "qd", "q", "8", "16"], values: [8, 6, 4, 2, 1] },
      19: { lengths: ["h", "qd", "q", "8", "16"], values: [8, 6, 4, 2, 1] },
      20: { lengths: ["qd", "q", "8", "16"], values: [6, 4, 2, 1] },
    };
  }
  if (timeSignature == "2/4") {
    options = {
      0: { lengths: ["16"], values: [1] },
      1: { lengths: ["h"], values: [8] },
      2: { lengths: ["h", "q"], values: [8, 4] },
      3: { lengths: ["h", "q", "8"], values: [8, 4, 2] },
      4: { lengths: ["h", "q", "8"], values: [8, 4, 2] },
      5: { lengths: ["h", "q", "8"], values: [8, 4, 2] },
      6: { lengths: ["h", "q", "8"], values: [8, 4, 2] },
      7: { lengths: ["h", "qd", "q", "8"], values: [8, 6, 4, 2] },
      8: { lengths: ["h", "qd", "q", "8"], values: [8, 6, 4, 2] },
      9: { lengths: ["h", "qd", "q", "8"], values: [8, 6, 4, 2] },
      10: { lengths: ["h", "qd", "q", "8"], values: [8, 6, 4, 2] },
      11: { lengths: ["h", "qd", "q", "8", "16"], values: [8, 6, 4, 2, 1] },
      12: { lengths: ["h", "qd", "q", "8", "16"], values: [8, 6, 4, 2, 1] },
      13: { lengths: ["h", "qd", "q", "8", "16"], values: [8, 6, 4, 2, 1] },
      14: { lengths: ["h", "qd", "q", "8", "16"], values: [8, 6, 4, 2, 1] },
      15: { lengths: ["h", "qd", "q", "8", "16"], values: [8, 6, 4, 2, 1] },
      16: { lengths: ["h", "qd", "q", "8", "16"], values: [8, 6, 4, 2, 1] },
      17: { lengths: ["h", "qd", "q", "8", "16"], values: [8, 6, 4, 2, 1] },
      18: { lengths: ["qd", "q", "8", "16"], values: [6, 4, 2, 1] },
      19: { lengths: ["qd", "q", "8", "16"], values: [6, 4, 2, 1] },
      20: { lengths: ["qd", "q", "8", "16"], values: [6, 4, 2, 1] },
    };
  }
  if (timeSignature == "6/8") {
    options = {
      0: { lengths: ["16"], values: [1] },
      1: { lengths: ["hd"], values: [12] },
      2: { lengths: ["hd", "qd"], values: [12, 6] },
      3: { lengths: ["hd", "qd", "8"], values: [12, 6, 2] },
      4: { lengths: ["hd", "qd", "8"], values: [12, 6, 2] },
      5: { lengths: ["hd", "qd", "8"], values: [12, 6, 2] },
      6: { lengths: ["hd", "qd", "8"], values: [12, 6, 2] },
      7: { lengths: ["hd", "qd", "q", "8"], values: [12, 6, 4, 2] },
      8: { lengths: ["hd", "qd", "q", "8"], values: [12, 6, 4, 2] },
      9: { lengths: ["hd", "qd", "q", "8"], values: [12, 6, 4, 2] },
      10: { lengths: ["hd", "qd", "q", "8"], values: [12, 6, 4, 2] },
      11: { lengths: ["hd", "qd", "q", "8", "16"], values: [12, 6, 4, 2, 1] },
      12: { lengths: ["hd", "qd", "q", "8", "16"], values: [12, 6, 4, 2, 1] },
      13: { lengths: ["hd", "qd", "q", "8", "16"], values: [12, 6, 4, 2, 1] },
      14: { lengths: ["hd", "qd", "q", "8", "16"], values: [12, 6, 4, 2, 1] },
      15: { lengths: ["hd", "qd", "q", "8", "16"], values: [12, 6, 4, 2, 1] },
      16: { lengths: ["hd", "qd", "q", "8", "16"], values: [12, 6, 4, 2, 1] },
      17: { lengths: ["hd", "qd", "q", "8", "16"], values: [12, 6, 4, 2, 1] },
      18: { lengths: ["hd", "qd", "q", "8", "16"], values: [12, 6, 4, 2, 1] },
      19: { lengths: ["hd", "qd", "q", "8", "16"], values: [12, 6, 4, 2, 1] },
      20: { lengths: ["hd", "qd", "q", "8", "16"], values: [12, 6, 4, 2, 1] },
    };
  }
  if (timeSignature == "3/8") {
    options = {
      0: { lengths: ["16"], values: [1] },
      1: { lengths: ["qd"], values: [6] },
      2: { lengths: ["qd"], values: [6] },
      3: { lengths: ["qd", "8"], values: [6, 2] },
      4: { lengths: ["qd", "8"], values: [6, 2] },
      5: { lengths: ["qd", "8"], values: [6, 2] },
      6: { lengths: ["qd", "8"], values: [6, 2] },
      7: { lengths: ["qd", "q", "8"], values: [6, 4, 2] },
      8: { lengths: ["qd", "q", "8"], values: [6, 4, 2] },
      9: { lengths: ["qd", "q", "8"], values: [6, 4, 2] },
      10: { lengths: ["qd", "q", "8"], values: [6, 4, 2] },
      11: { lengths: ["qd", "q", "8", "16"], values: [6, 4, 2, 1] },
      12: { lengths: ["qd", "q", "8", "16"], values: [6, 4, 2, 1] },
      13: { lengths: ["qd", "q", "8", "16"], values: [6, 4, 2, 1] },
      14: { lengths: ["qd", "q", "8", "16"], values: [6, 4, 2, 1] },
      15: { lengths: ["qd", "q", "8", "16"], values: [6, 4, 2, 1] },
      16: { lengths: ["qd", "q", "8", "16"], values: [6, 4, 2, 1] },
      17: { lengths: ["qd", "q", "8", "16"], values: [6, 4, 2, 1] },
      18: { lengths: ["qd", "q", "8", "16"], values: [6, 4, 2, 1] },
      19: { lengths: ["qd", "q", "8", "16"], values: [6, 4, 2, 1] },
      20: { lengths: ["qd", "q", "8", "16"], values: [6, 4, 2, 1] },
    };
  }
  if (timeSignature == "12/8") {
    options = {
      0: { lengths: ["16"], values: [1] },
      1: { lengths: ["wd", "hd"], values: [24, 12] },
      2: { lengths: ["wd", "hd", "qd"], values: [24, 12, 6] },
      3: { lengths: ["wd", "hd", "qd", "8"], values: [24, 12, 6, 2] },
      4: { lengths: ["wd", "hd", "qd", "8"], values: [24, 12, 6, 2] },
      5: { lengths: ["wd", "hd", "qd", "8"], values: [24, 12, 6, 2] },
      6: { lengths: ["wd", "hd", "qd", "8"], values: [24, 12, 6, 2] },
      7: { lengths: ["wd", "hd", "qd", "q", "8"], values: [24, 12, 6, 4, 2] },
      8: { lengths: ["wd", "hd", "qd", "q", "8"], values: [24, 12, 6, 4, 2] },
      9: { lengths: ["wd", "hd", "qd", "q", "8"], values: [24, 12, 6, 4, 2] },
      10: { lengths: ["wd", "hd", "qd", "q", "8"], values: [24, 12, 6, 4, 2] },
      11: { lengths: ["wd", "hd", "qd", "q", "8", "16"], values: [24, 12, 6, 4, 2, 1] },
      12: { lengths: ["wd", "hd", "qd", "q", "8", "16"], values: [24, 12, 6, 4, 2, 1] },
      13: { lengths: ["wd", "hd", "qd", "q", "8", "16"], values: [24, 12, 6, 4, 2, 1] },
      14: { lengths: ["wd", "hd", "qd", "q", "8", "16"], values: [24, 12, 6, 4, 2, 1] },
      15: { lengths: ["wd", "hd", "qd", "q", "8", "16"], values: [24, 12, 6, 4, 2, 1] },
      16: { lengths: ["wd", "hd", "qd", "q", "8", "16"], values: [24, 12, 6, 4, 2, 1] },
      17: { lengths: ["wd", "hd", "qd", "q", "8", "16"], values: [24, 12, 6, 4, 2, 1] },
      18: { lengths: ["wd", "hd", "qd", "q", "8", "16"], values: [24, 12, 6, 4, 2, 1] },
      19: { lengths: ["wd", "hd", "qd", "q", "8", "16"], values: [24, 12, 6, 4, 2, 1] },
      20: { lengths: ["wd", "hd", "qd", "q", "8", "16"], values: [24, 12, 6, 4, 2, 1] },
    };
  }

  return options[difficulty] || options[20]; // fallback to hardest
}

export function copyNote(originalNote) {
  console.log(originalNote)
  const keys = originalNote.getKeys();
  const baseDuration = originalNote.getDuration();
  const stemDirection = originalNote.getStemDirection(); 
  const isRest = originalNote.isRest();

  const duration = isRest ? `${baseDuration}r` : baseDuration;
  
  const hasDot = originalNote.modifiers[0] && originalNote.modifiers[0].attrs.type == "Dot";
  const newNote = new VF.StaveNote({
    keys: [...keys], 
    duration: duration,
    stem_direction: stemDirection,
    dots: hasDot ? 1 : 0,
  });  

  if(hasDot){
    VF.Dot.buildAndAttach([newNote], { all: true });
  }

  originalNote.modifiers
    .filter(m => m.getCategory() === 'accidentals')
    .forEach(acc => {
      const index = acc.getIndex();
      const type = acc.type;
      newNote.addAccidental(index, new VF.Accidental(type));
    });

  originalNote.modifiers
    .filter(m => m.getCategory() === 'articulations')
    .forEach(art => {
      const index = art.getIndex();
      const type = art.type;
      newNote.addArticulation(index, new VF.Articulation(type));
    });

    originalNote.modifiers
    .filter(mod => mod.getCategory() === 'dots')
    .forEach(dot => {
      newNote.addDot(dot.getIndex());
    });

  return newNote;
}

export function copyNoteNewKey(originalNote, key) {

  const duration = originalNote.getDuration(); 
  const stemDirection = originalNote.getStemDirection(); 
  
  const hasDot = originalNote.modifiers[0] && originalNote.modifiers[0].attrs.type == "Dot";
  const newNote = new VF.StaveNote({
    keys: [...key], 
    duration: duration,
    stem_direction: stemDirection,
    dots: hasDot ? 1 : 0
  });
  
  if(hasDot){
    VF.Dot.buildAndAttach([newNote], { all: true });
  }

  originalNote.modifiers
    .filter(m => m.getCategory() === 'accidentals')
    .forEach(acc => {
      const index = acc.getIndex();
      const type = acc.type;
      newNote.addAccidental(index, new VF.Accidental(type));
    });

  originalNote.modifiers
    .filter(m => m.getCategory() === 'articulations')
    .forEach(art => {
      const index = art.getIndex();
      const type = art.type;
      newNote.addArticulation(index, new VF.Articulation(type));
    });



  return newNote;
}