import Vex from "https://esm.sh/vexflow@4.0.1-beta.2";
import {
  getKeys,
  getNoteOptionsByDifficulty,
  pushNote,
  pushRandomQ,
  pushRandom8th,
  push2Random8th,
  pushRandom16th,
  push2Random16th,
  push4Random16th,
  pushSame8th,
  pushSame16th,
  canPushQ,
  canPush8th,
  canPush16th
} from "./musicUtils.js";
import { stopNotes } from "./audioUtils.js";

export const VF = Vex.Flow;
const container = document.getElementById("boo");
const pageWidth = 1700;
const staveWidth = 350;
const margin = 10;
const lineSpacing = 120;
export const maximumNoteSubdivision = 4; //16th notes
export let allNotes = [];

let renderer;
let context;
initVF();

function initVF() {
  renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
  renderer.resize(pageWidth, 6000);
  context = renderer.getContext();
}

function getUserInputs() {
  let keySignature = document.getElementById("keySelector").value;
  const measrues = parseInt(document.getElementById("length").value);
  const difficulty = parseInt(document.getElementById("difficulty").value);
  const rangeDifficulty = parseInt(document.getElementById("rangeDifficulty").value);
  const maxJump = parseInt(document.getElementById("maxJump").value);
  return {
    keySignature,
    measrues,
    difficulty,
    rangeDifficulty,
    maxJump,
  };
}

export function drawNotes() {
  stopNotes();

  allNotes = [];
  container.innerHTML = "";
  initVF();

  let { keySignature, measrues, difficulty, rangeDifficulty, maxJump } = getUserInputs();
  let lastKey = -1;
  let keys = getKeys(rangeDifficulty);

  let prevStave = null;
  let x = margin;
  let y = 40;
  let firstStave = true;

  for (let i = 0; i < measrues; i++) {
    let retVal = generateMeasure(x, y, difficulty, 4, keys, firstStave, prevStave == null, keySignature, maxJump, lastKey);
    prevStave = retVal.stave;
    lastKey = retVal.lastKey;
    
    firstStave = false;


    x += staveWidth;

    if (x + staveWidth > pageWidth) {
      x = margin;
      y += lineSpacing;
      firstStave = true;
    }
  }
}
window.drawNotes = drawNotes;

function pickNoteLengthValue(availableNoteLengths, availableNoteValues, remaining) {
  for (let i = 0; i < availableNoteValues.length; i++) {
    if (availableNoteValues[i] <= remaining) {
      return { length: availableNoteLengths[i], value: availableNoteValues[i] };
    }
  }
  return null;
}

function generateMeasure(x, y, difficulty, measureLength, keys, firstMeasure, showTime, keySignature, maxJump, lastKey) {
  const notes = [];
  const { lengths: availableNoteLengths, values: availableNoteValues } = getNoteOptionsByDifficulty(difficulty);

  let counter = 0;
  while (true) {
    const remaining = measureLength * maximumNoteSubdivision - counter;
    if (remaining <= 0) break;

    const randIndex = Math.floor(Math.random() * availableNoteLengths.length);
    let noteLength = availableNoteLengths[randIndex];
    let noteValue = availableNoteValues[randIndex];

    if (noteValue > remaining) {
      const pick = pickNoteLengthValue(availableNoteLengths, availableNoteValues, remaining);
      if (!pick) break;
      noteLength = pick.length;
      noteValue = pick.value;
    }

    if (noteValue == 1) {
      let retVal = handleSixteenthNoteRuns(notes, keys, difficulty, counter, measureLength, lastKey, maxJump);
      counter = retVal.counter;
      lastKey = retVal.lastKey;
      continue;
    }

    if (noteValue == 2) {
      let retVal = handleSyncopation(notes, keys, difficulty, counter, measureLength, lastKey, maxJump);
      counter = retVal.counter;
      lastKey = retVal.lastKey;
      continue;
    }

    let keyIndex = getKeyIndex(lastKey, keys, maxJump);
    let key = keys[keyIndex];
    lastKey = keyIndex;
    pushNote(notes, key, noteLength, difficulty);
    counter += noteValue;
  }
  let stave = drawMeasure(x, y, notes, firstMeasure, keySignature, showTime, []);
  return { stave, lastKey };
}

export function getKeyIndex(lastKey, keys, maxJump) {
  let keyIndex = Math.floor(Math.random() * keys.length);
  while (lastKey != -1 && Math.abs(keyIndex - lastKey) > maxJump) {
    keyIndex = Math.floor(Math.random() * keys.length);
  }
  return keyIndex;
}

function handleSyncopation(notes, keys, difficulty, counter, measureLength, lastKey, maxJump) {
  if (difficulty >= 5) {
    return doSyncopation(notes, keys, difficulty, counter, measureLength, lastKey, maxJump);
  }

  if (difficulty >= 4) {
    lastKey = pushRandom8th(notes, lastKey, keys, maxJump, difficulty);
    counter += 2;

    if (counter + 2 > measureLength * maximumNoteSubdivision) {
      return { counter, lastKey };
    }

    lastKey = pushRandom8th(notes, lastKey, keys, maxJump, difficulty);
    counter += 2;
    return { counter, lastKey };
  }

  if (counter + 4 > measureLength * maximumNoteSubdivision) {
    lastKey = pushRandom8th(notes, lastKey, keys, maxJump, difficulty);
    counter += 2;

    return { counter, lastKey };
  }

  lastKey = push2Random8th(notes, lastKey, keys, maxJump, difficulty);
  counter += 4;

  return { counter, lastKey };
}

function doSyncopation(notes, keys, difficulty, counter, measureLength, lastKey, maxJump) {
  let rand = Math.floor(Math.random() * 4);

  if (rand == 1 && difficulty >= 7) {
    lastKey = pushRandom8th(notes, lastKey, keys, maxJump, difficulty);
    counter += 2;
    return { counter, lastKey };
  }

  if (rand == 0) {
    lastKey = pushRandom8th(notes, lastKey, keys, maxJump, difficulty);
    counter += 2;

    if (counter + 4 > measureLength * maximumNoteSubdivision) {
      return { counter, lastKey };
    }

    lastKey = pushRandomQ(notes, lastKey, keys, maxJump, difficulty);
    counter += 4;

    if (canPush8th(counter, measureLength)) {
      return { counter, lastKey };
    }

    lastKey = pushRandom8th(notes, lastKey, keys, maxJump, difficulty);
    counter += 2;

    return { counter, lastKey };
  }

  lastKey = pushRandom8th(notes, lastKey, keys, maxJump, difficulty);
  counter += 2;

  if (counter + 2 > measureLength * maximumNoteSubdivision) {
    return { counter, lastKey };
  }
  lastKey = pushRandom8th(notes, lastKey, keys, maxJump, difficulty);
  counter += 2;
  return { counter, lastKey };
}

function handleSixteenthNoteRuns(notes, keys, difficulty, counter, measureLength, lastKey, maxJump) {
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

function drawMeasure(x, y, notes, addClef = false, keySignature = "C", addTimeSig = false, slurs = []) {
  const stave = new VF.Stave(x, y, staveWidth);
  if (addClef) stave.addClef("treble").addKeySignature(keySignature);
  if (addTimeSig) stave.addTimeSignature("4/4");
  stave.setContext(context).draw();

  const voice = new VF.Voice({ num_beats: 4, beat_value: 4 });
  voice.addTickables(notes);

  allNotes.push(...notes);

  const beams = VF.Beam.generateBeams(notes);
  new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave);

  voice.draw(context, stave);
  beams.forEach((beam) => beam.setContext(context).draw());
  slurs.forEach((slur) => {
    if (slur.type === "tie") {
      new VF.StaveTie({
        from: slur.from,
        to: slur.to,
        text: slur.text || "",
      })
        .setContext(context)
        .draw();
    } else if (slur.type === "curve") {
      new VF.Curve(slur.from, slur.to, {
        cps: slur.cps || [
          { x: 0, y: 20 },
          { x: 0, y: 20 },
        ],
      })
        .setContext(context)
        .draw();
    }
  });
  return stave;
}
