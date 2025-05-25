import Vex from "https://esm.sh/vexflow@4.0.1-beta.2";
import { getKeys, getNoteOptionsByDifficulty, pushNote } from "./musicUtils.js";
import { handle8thNotePatterns } from "./eighthNotePatterns.js";
import { handleSixteenthNoteRuns } from "./sixteenthNotePatterns.js";
import { handleQDNotePatterns } from "./qdNotePatterns.js";
import { stopNotes } from "./audioUtils.js";

export const VF = Vex.Flow;
const container = document.getElementById("boo");
const pageWidth = 1700;
const staveWidth = 350;
const margin = 10;
const lineSpacing = 120;
export let maximumNoteSubdivision; //amount of 16th notes in one beat
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
  let timeSignature = document.getElementById("timeSelector").value;
  const measrues = parseInt(document.getElementById("length").value);
  const difficulty = parseInt(document.getElementById("difficulty").value);
  const rangeDifficulty = parseInt(document.getElementById("rangeDifficulty").value);
  const maxJump = parseInt(document.getElementById("maxJump").value);
  let beatsPerMeasure = -1;
  maximumNoteSubdivision = 4;
  if (timeSignature == "4/4") {
    beatsPerMeasure = 4;
  }
  if (timeSignature == "3/4") {
    beatsPerMeasure = 3;
  }
  if (timeSignature == "2/4") {
    beatsPerMeasure = 2;
  }
  if (timeSignature == "6/8") {
    beatsPerMeasure = 2;
    maximumNoteSubdivision = 6;
  }
  if (timeSignature == "3/8") {
    beatsPerMeasure = 1;
    maximumNoteSubdivision = 6;
  }
  if (timeSignature == "12/8") {
    beatsPerMeasure = 4;
    maximumNoteSubdivision = 6;
  }

  return {
    keySignature,
    measrues,
    difficulty,
    rangeDifficulty,
    maxJump,
    timeSignature,
    beatsPerMeasure,
  };
}

export function drawNotes() {
  stopNotes();

  allNotes = [];
  container.innerHTML = "";
  initVF();

  let { keySignature, measrues, difficulty, rangeDifficulty, maxJump, timeSignature, beatsPerMeasure } = getUserInputs();
  let lastKey = -1;
  let keys = getKeys(rangeDifficulty);
  let prevStave = null;
  let x = margin;
  let y = 40;
  let firstStave = true;

  for (let i = 0; i < measrues; i++) {
    let retVal = generateMeasure(x, y, difficulty, beatsPerMeasure, keys, firstStave, prevStave == null, keySignature, maxJump, lastKey, timeSignature);
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

function generateMeasure(x, y, difficulty, measureLength, keys, firstMeasure, showTime, keySignature, maxJump, lastKey, timeSignature) {
  const notes = [];
  const { lengths: availableNoteLengths, values: availableNoteValues } = getNoteOptionsByDifficulty(difficulty, timeSignature);

  let counter = 0;
  while (true) {
    const remaining = measureLength * maximumNoteSubdivision - counter;
    if (remaining <= 0) break;

    const randIndex = Math.floor(Math.random() * availableNoteLengths.length);
    let noteLength = availableNoteLengths[randIndex];
    let noteValue = availableNoteValues[randIndex];

    if (noteValue > remaining) {
      const pick = pickSmallerNoteLengthValue(availableNoteLengths, availableNoteValues, remaining);
      if (!pick) break;
      noteLength = pick.length;
      noteValue = pick.value;
    }

    if (noteValue == 1 && difficulty != 0) {
      let retVal = handleSixteenthNoteRuns(notes, keys, difficulty, counter, measureLength, lastKey, maxJump);
      counter = retVal.counter;
      lastKey = retVal.lastKey;
      continue;
    }

    if (noteValue == 2) {
      let retVal = handle8thNotePatterns(notes, keys, difficulty, counter, measureLength, lastKey, maxJump);
      counter = retVal.counter;
      lastKey = retVal.lastKey;
      continue;
    }

    if (noteValue == 6) {
      let retVal = handleQDNotePatterns(notes, keys, difficulty, counter, measureLength, lastKey, maxJump);
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
  console.log(notes);
  let stave = drawMeasure(x, y, notes, timeSignature, firstMeasure, keySignature, showTime, []);
  return { stave, lastKey };
}

export function getKeyIndex(lastKey, keys, maxJump) {
  let keyIndex = Math.floor(Math.random() * keys.length);
  while (lastKey != -1 && Math.abs(keyIndex - lastKey) > maxJump) {
    keyIndex = Math.floor(Math.random() * keys.length);
  }
  return keyIndex;
}

function drawMeasure(x, y, notes, timeSignature = "4/4", addClef = false, keySignature = "C", addTimeSig = false, slurs = []) {
  const stave = new VF.Stave(x, y, staveWidth);
  if (addClef) stave.addClef("treble").addKeySignature(keySignature);
  if (addTimeSig) stave.addTimeSignature(timeSignature);
  stave.setContext(context).draw();

  let randDynamics = Math.floor(Math.random() * 8);
  let voice = getVoice(timeSignature);
  voice.addTickables(notes);

  drawDynamicsText(randDynamics, notes);

  allNotes.push(...notes);

  const beams = VF.Beam.generateBeams(notes);

  new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave);
  voice.draw(context, stave);

  beams.forEach((beam) => beam.setContext(context).draw());

  drawSlurs(slurs);

  drawDynamics(randDynamics, notes);

  return stave;
}

function getVoice(timeSignature) {
  if (timeSignature == "4/4") {
    return new VF.Voice({ num_beats: 4, beat_value: 4 });
  }
  if (timeSignature == "3/4") {
    return new VF.Voice({ num_beats: 3, beat_value: 4 });
  }
  if (timeSignature == "2/4") {
    return new VF.Voice({ num_beats: 2, beat_value: 4 });
  }
  if (timeSignature == "6/8") {
    return new VF.Voice({ num_beats: 6, beat_value: 8 });
  }
  if (timeSignature == "3/8") {
    return new VF.Voice({ num_beats: 3, beat_value: 8 });
  }
  if (timeSignature == "12/8") {
    return new VF.Voice({ num_beats: 12, beat_value: 8 });
  }
}

function drawDynamicsText(rand, notes) {
  let randDynamicsValue = Math.floor(Math.random() * 6);

  const options = ["pp", "p", "mp", "mf", "f", "ff"];

  if (rand == 3) {
    const ann = new VF.Annotation(options[randDynamicsValue]).setFont({ family: "Bravura Text", size: 15, weight: "bold" }).setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM);

    notes[0].addModifier(ann, 0);
  }
}

function drawDynamics(rand, notes) {
  if (notes.length == 1) {
    return;
  }

  if (rand == 0) {
    const hairpin = new VF.StaveHairpin(
      {
        first_note: notes[0],
        last_note: notes[notes.length - 1],
      },
      VF.StaveHairpin.type.CRESC
    );
    hairpin.setContext(context).setRenderOptions({ height: 10, left_shift_px: -10, right_shift_px: 300 }).draw();
  }
  if (rand == 1) {
    const hairpin = new VF.StaveHairpin(
      {
        first_note: notes[0],
        last_note: notes[notes.length - 1],
      },
      VF.StaveHairpin.type.DECRESC
    );
    hairpin.setContext(context).setRenderOptions({ height: 10, left_shift_px: -10, right_shift_px: 300 }).draw();
  }
}

function drawSlurs(slurs) {
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
}

function pickSmallerNoteLengthValue(availableNoteLengths, availableNoteValues, remaining) {
  for (let i = 0; i < availableNoteValues.length; i++) {
    if (availableNoteValues[i] <= remaining) {
      return { length: availableNoteLengths[i], value: availableNoteValues[i] };
    }
  }
  console.error("Could not find smaller note!");
  return null;
}
