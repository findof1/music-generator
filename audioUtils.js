import { allNotes } from "./app.js";

const sharpsByKey = {
  C: [],
  G: ["f"],
  D: ["f", "c"],
  A: ["f", "c", "g"],
  E: ["f", "c", "g", "d"],
  B: ["f", "c", "g", "d", "a"],
  "F#": ["f", "c", "g", "d", "a", "e"],
  "C#": ["f", "c", "g", "d", "a", "e", "b"],
};

function applyKeySignature(note, key) {
  let [pitch, octave] = note.split("/");
  pitch = pitch.toLowerCase();

  const sharps = sharpsByKey[key] || [];

  if (sharps.includes(pitch)) {
    pitch += "#";
  }

  return pitch.toUpperCase() + "/" + octave;
}

function vexToMidi(note, key) {
  const [name, octave] = applyKeySignature(note, key).split("/");
  const base = {
    c: 0,
    "c#": 1,
    db: 1,
    d: 2,
    "d#": 3,
    eb: 3,
    e: 4,
    "e#": 4,
    f: 5,
    "f#": 6,
    gb: 6,
    g: 7,
    "g#": 8,
    ab: 8,
    a: 9,
    "a#": 10,
    ab: 10,
    b: 11,
    "b#": 12,
  };
  return 12 * (parseInt(octave) + 1) + base[name.toLowerCase()];
}

function getDurationInSeconds(vfDuration) {
  let durationCopy = vfDuration;
  durationCopy = durationCopy.replace("r", "");
  
  const bpm = document.getElementById("bpm").value;
  const quarterNoteLength = 60/bpm;
  const map = {
    w: 4*quarterNoteLength,
    h: 2*quarterNoteLength,
    q: quarterNoteLength,
    8: quarterNoteLength/2,
    16: quarterNoteLength/4,
  };
  return map[durationCopy] || 1;
}

let audioCtx;
let trumpet;
export async function playNotes() {
  stopNotes();
  const keySignature = document.getElementById("keySelector").value;

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  trumpet = await Soundfont.instrument(audioCtx, "trumpet");

  let time = audioCtx.currentTime;

  for (const note of allNotes) {
    const key = note.keys[0];
    const duration = getDurationInSeconds(note.duration);
    if (!note.noteType.includes("r")) {
      const midi = vexToMidi(key, keySignature);
      trumpet.play(midi, time, { duration });
    }
    time += duration;
  }
}
window.playNotes = playNotes;

export function stopNotes() {
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
}
