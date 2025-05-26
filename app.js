import Vex from "https://esm.sh/vexflow@4.0.1-beta.2";
import { getKeys, getNoteOptionsByDifficulty, pushNote, durationTo16ths } from "./musicUtils.js";
import { handle8thNotePatterns } from "./eighthNotePatterns.js";
import { handleSixteenthNoteRuns } from "./sixteenthNotePatterns.js";
import { handleQDNotePatterns } from "./qdNotePatterns.js";
import { stopNotes } from "./audioUtils.js";

export const VF = Vex.Flow;
const container = document.getElementById("boo");
const pageWidth = 1450;
const ogStaveWidth = 360;
let staveWidth = 360;
const margin = 10;
const lineSpacing = 120;
export let maximumNoteSubdivision; //amount of 16th notes in one beat
export let allNotes = [];
let motifData;

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

function isEighthTime(timeSpec) {
  const parts = timeSpec.split("/");
  return parts.length === 2 && parts[1] === "8";
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
  staveWidth = ogStaveWidth;
  staveWidth += 150;

  motifData = generateMeasure( difficulty, beatsPerMeasure, keys, maxJump, lastKey,timeSignature);

  for (let i = 0; i < measrues; i++) {
    let randMotif = Math.floor(Math.random() * 4);
    if(randMotif == 0){
    lastKey = motifData.lastKey;

    prevStave = drawMeasure(x, y, motifData.notes, timeSignature, firstStave, keySignature, prevStave == null, []);

    }else{
    let retVal = generateMeasure(difficulty, beatsPerMeasure, keys, maxJump, lastKey, timeSignature);
    lastKey = retVal.lastKey;

    prevStave = drawMeasure(x, y, retVal.notes, timeSignature, firstStave, keySignature, prevStave == null, []);
    }
    
    x += staveWidth;
    if (firstStave) {
      staveWidth -= 150;
    }
    firstStave = false;

    if (x + staveWidth > pageWidth) {
      x = margin;
      y += lineSpacing;
      firstStave = true;
      staveWidth += 150;
    }
  }
}
window.drawNotes = drawNotes;

function generateMeasure(difficulty, measureLength, keys,  maxJump, lastKey, timeSignature) {
  const notes = [];
  const { lengths: availableNoteLengths, values: availableNoteValues } = getNoteOptionsByDifficulty(difficulty, timeSignature);

  let counter = 0;
  while (true) {
    const remaining = measureLength * maximumNoteSubdivision - counter;
    if (remaining <= 0) break;

    let randIndex = Math.floor(Math.random() * availableNoteLengths.length);
    let noteLength = availableNoteLengths[randIndex];
    let noteValue = availableNoteValues[randIndex];
    if (noteValue == 6) {
      let rand = Math.floor(Math.random() * 2);
      if (rand == 0) {
        randIndex = Math.floor(Math.random() * availableNoteLengths.length);
        noteLength = availableNoteLengths[randIndex];
        noteValue = availableNoteValues[randIndex];
      }
    }

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

    if (noteValue == 6 && !isEighthTime(timeSignature)) {
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
  return { notes, lastKey };
}

let allowLeaps = true;
let leapCounter = 0;
let leapsInARow = Math.floor(Math.random() * 5) + 1;
export function getKeyIndex(lastKey, keys, maxJump) {
  let keyIndex = Math.floor(Math.random() * keys.length);
  while (lastKey != -1 && Math.abs(keyIndex - lastKey) > (allowLeaps? maxJump : 1)) {
    keyIndex = Math.floor(Math.random() * keys.length);
  }
  if(leapCounter > leapsInARow){
    allowLeaps = !allowLeaps;
    if(allowLeaps){
      leapsInARow = Math.floor(Math.random() * 5) + 3;
    }else{
      leapsInARow = Math.floor(Math.random() * 10) + 6;
    }
  }
  leapCounter++;
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

  drawArticulation(notes);

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

function drawArticulation(notes) {
  let counter = 0;
  for (let i = 0; i < notes.length; i++) {
    if (counter % 4 != 0 || notes[i].getNoteType() == "r") {
      counter += durationTo16ths(notes[i].duration) * (hasDot(notes[i]) ? 1.5 : 1);
      continue;
    }
    counter += durationTo16ths(notes[i].duration) * (hasDot(notes[i]) ? 1.5 : 1);

    let rand = Math.floor(Math.random() * 8);
    if (rand == 0) {
      const staccato = new VF.Articulation("a.").setPosition(VF.Modifier.Position.BELOW);
      notes[i].addModifier(staccato, 0);
    }
    if (rand == 1) {
      const accent = new VF.Articulation("a>").setPosition(VF.Modifier.Position.BELOW);
      notes[i].addModifier(accent, 0);
    }
  }
}

function hasDot(note) {
  return note.modifiers[0] && note.modifiers[0].attrs.type == "Dot";
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
      new VF.StaveTie({ from: notes[slur.from], to: notes[slur.to] }).setContext(context).draw();
    } else if (slur.type === "curve") {
      new VF.Curve(notes[slur.from], notes[slur.to]).setContext(context).draw();
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
