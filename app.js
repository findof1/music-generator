const VF = Vex.Flow;
const container = document.getElementById("boo");
const pageWidth = 1700;
const staveWidth = 350;
const margin = 10;
const lineSpacing = 120;
let allNotes = [];

let renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
renderer.resize(1000, 500);
let context = renderer.getContext();

function drawNotes() {
  stopNotes();
  allNotes = [];
  container.innerHTML = "";
  renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
  renderer.resize(pageWidth, 6000);
  context = renderer.getContext();
  let key = document.getElementById("keySelector").value;

  const measrues = parseInt(document.getElementById("length").value);
  const difficulty = parseInt(document.getElementById("difficulty").value);
  const rangeDifficulty = parseInt(
    document.getElementById("rangeDifficulty").value
  );

  let lastKey = -1;
  const maxJump = parseInt(document.getElementById("maxJump").value);

  let keys = getKeys(rangeDifficulty);

  let prevStave = null;
  let x = margin;
  let y = 40;
  let firstStave = true;
  for (let i = 0; i < measrues; i++) {
    let retVal = generateMeasure(
      x,
      y,
      difficulty,
      4,
      keys,
      firstStave,
      prevStave == null,
      key,
      maxJump,
      lastKey
    );
    firstStave = false;

    prevStave = retVal.stave;
    lastKey = retVal.lastKey;

    x += staveWidth;

    if (x + staveWidth > pageWidth) {
      x = margin;
      y += lineSpacing;
      firstStave = true;
    }
  }
}

function generateMeasure(
  x,
  y,
  difficulty,
  length,
  keys,
  firstMeasure,
  showTime,
  key,
  maxJump,
  lastKey
) {
  const notes = [];
  const maximumNoteSubdivision = 4; //16th notes

  let availableNoteLengths;
  let availableNoteValues; //value of notes based off of how many 16th notes are in it

  if (difficulty == 1) {
    availableNoteLengths = ["w", "h"]; 
    availableNoteValues = [16, 8];
  } else if (difficulty == 2) {
    availableNoteLengths = ["w", "h", "q"]; 
    availableNoteValues = [16, 8, 4];
  } else if (difficulty == 3) {
    availableNoteLengths = ["w", "h", "q", "8"]; 
    availableNoteValues = [16, 8, 4, 2];
  } else if (difficulty == 4) {
    availableNoteLengths = ["w", "h", "q", "8"]; 
    availableNoteValues = [16, 8, 4, 2, 1];
  } else if (difficulty == 5) {
    availableNoteLengths = ["w", "h", "q", "8"]; 
    availableNoteValues = [16, 8, 4, 2, 1];
  }else if (difficulty >= 6) {
    availableNoteLengths = ["w", "h", "q", "8", "16"]; 
    availableNoteValues = [16, 8, 4, 2, 1];
  }

  let counter = 0;
  while (true) {
    const randNoteLength = Math.floor(
      Math.random() * availableNoteLengths.length
    );

    let noteLength = availableNoteLengths[randNoteLength];
    let noteValue = availableNoteValues[randNoteLength];

    if (counter + noteValue > length * maximumNoteSubdivision) {
      let foundSmaller = false;
      for (let i = 0; i < availableNoteValues.length; i++) {
        if (
          availableNoteValues[i] <=
          length * maximumNoteSubdivision - counter
        ) {
          noteLength = availableNoteLengths[i];
          noteValue = availableNoteValues[i];
          foundSmaller = true;
          break;
        }
      }
      if (!foundSmaller) break;
    }

    if (
      noteValue == 1 &&
      (counter + noteValue) % (maximumNoteSubdivision / 2) != 0
    ) {
      let retVal = handleSixteenthNoteRuns(
        notes,
        keys,
        difficulty,
        counter,
        maximumNoteSubdivision,
        length,
        lastKey,
        maxJump
      );
      counter = retVal.counter;
      lastKey = retVal.lastKey;
      continue;
    }

    if (
      noteValue == 2 &&
      (counter + noteValue) % (maximumNoteSubdivision / 2) == 0
    ) {
      console.log("e");
      let retVal = handleSyncopation(
        notes,
        keys,
        difficulty,
        counter,
        maximumNoteSubdivision,
        length,
        lastKey,
        maxJump
      );

      counter = retVal.counter;
      lastKey = retVal.lastKey;

      continue;
    }

    let keyIndex = getKeyIndex(lastKey, keys, maxJump);
    const key = keys[keyIndex];
    lastKey = keyIndex;
    notes.push(new VF.StaveNote({ keys: [key], duration: noteLength }));
    counter += noteValue;
  }

  
  let stave = drawMeasure(x, y, notes, firstMeasure, key, showTime, []);
  return {stave, lastKey};
}

function getKeyIndex(lastKey, keys, maxJump) {
  let keyIndex = Math.floor(Math.random() * keys.length);
  while (lastKey != -1 && Math.abs(keyIndex - lastKey) > maxJump) {
    keyIndex = Math.floor(Math.random() * keys.length);
  }
  return keyIndex;
}

function handleSyncopation(
  notes,
  keys,
  difficulty,
  counter,
  maximumNoteSubdivision,
  length,
  lastKey,
  maxJump
) {
  if (difficulty >= 5) {
    let rand = Math.floor(Math.random() * 4);

    if (rand == 1 && difficulty >= 7) {
      let keyIndex = getKeyIndex(lastKey, keys, maxJump);
      let key = keys[keyIndex];
      lastKey = keyIndex;
      notes.push(new VF.StaveNote({ keys: [key], duration: "8" }));
      counter += 2;
      return { counter, lastKey };
    }

    if (rand == 0) {
      let keyIndex = getKeyIndex(lastKey, keys, maxJump);
      let key = keys[keyIndex];
      lastKey = keyIndex;
      notes.push(new VF.StaveNote({ keys: [key], duration: "8" }));
      counter += 2;
      if (counter + 4 > length * maximumNoteSubdivision) {
        return { counter, lastKey };
      }

      keyIndex = getKeyIndex(lastKey, keys, maxJump);
      key = keys[keyIndex];
      lastKey = keyIndex;
      notes.push(new VF.StaveNote({ keys: [key], duration: "q" }));
      counter += 4;
      if (counter + 2 > length * maximumNoteSubdivision) {
        return { counter, lastKey };
      }
      keyIndex = getKeyIndex(lastKey, keys, maxJump);
      key = keys[keyIndex];
      lastKey = keyIndex;
      notes.push(new VF.StaveNote({ keys: [key], duration: "8" }));
      counter += 2;
    } else {
      let keyIndex = getKeyIndex(lastKey, keys, maxJump);
      let key = keys[keyIndex];
      lastKey = keyIndex;
      notes.push(new VF.StaveNote({ keys: [key], duration: "8" }));
      counter += 2;
      if (counter + 2 > length * maximumNoteSubdivision) {
        return { counter, lastKey };
      }

      keyIndex = getKeyIndex(lastKey, keys, maxJump);
      key = keys[keyIndex];
      lastKey = keyIndex;
      notes.push(new VF.StaveNote({ keys: [key], duration: "8" }));
      counter += 2;
    }
  } else if (difficulty >= 4) {
    let keyIndex = getKeyIndex(lastKey, keys, maxJump);
    let key = keys[keyIndex];
    lastKey = keyIndex;
    notes.push(new VF.StaveNote({ keys: [key], duration: "8" }));
    counter += 2;

    if (counter + 2 > length * maximumNoteSubdivision) {
      return { counter, lastKey };
    }

    keyIndex = getKeyIndex(lastKey, keys, maxJump);
    key = keys[keyIndex];
    lastKey = keyIndex;
    notes.push(new VF.StaveNote({ keys: [key], duration: "8" }));
    counter += 2;
  } else {
    let keyIndex = getKeyIndex(lastKey, keys, maxJump);
    let key = keys[keyIndex];
    lastKey = keyIndex;

    notes.push(new VF.StaveNote({ keys: [key], duration: "8" }));
    counter += 2;

    if (counter + 2 > length * maximumNoteSubdivision) {
      return { counter, lastKey };
    }
    notes.push(new VF.StaveNote({ keys: [key], duration: "8" }));
    counter += 2;
  }
  return { counter, lastKey };
}

function handleSixteenthNoteRuns(
  notes,
  keys,
  difficulty,
  counter,
  maximumNoteSubdivision,
  length,
  lastKey,
  maxJump
) {
  let keyIndex = getKeyIndex(lastKey, keys, maxJump);
  let key = keys[keyIndex];
  lastKey = keyIndex;
  notes.push(new VF.StaveNote({ keys: [key], duration: "16" }));
  counter += 1;

  if (difficulty >= 8) {
    let keyIndex = getKeyIndex(lastKey, keys, maxJump);
      key = keys[keyIndex];
      lastKey = keyIndex;
  }

  notes.push(new VF.StaveNote({ keys: [key], duration: "16" }));
  counter += 1;

  if (counter + 2 >= length * maximumNoteSubdivision) {
    return { counter, lastKey };
  }

  let rand = Math.floor(Math.random() * 2);
  if (rand == 0) {
    if (difficulty >= 8) {
      let keyIndex = getKeyIndex(lastKey, keys, maxJump);
      key = keys[keyIndex];
      lastKey = keyIndex;
    }

    notes.push(new VF.StaveNote({ keys: [key], duration: "16" }));
    counter += 1;

    if (difficulty >= 8) {
      let keyIndex = getKeyIndex(lastKey, keys, maxJump);
      key = keys[keyIndex];
      lastKey = keyIndex;
    }

    notes.push(new VF.StaveNote({ keys: [key], duration: "16" }));
    counter += 1;
  } else {
    if (difficulty >= 7) {
      let keyIndex = getKeyIndex(lastKey, keys, maxJump);
      key = keys[keyIndex];
      lastKey = keyIndex;
    }

    notes.push(new VF.StaveNote({ keys: [key], duration: "8" }));
    counter += 2;
  }

  return { counter, lastKey };
}

function drawMeasure(
  x,
  y,
  notes,
  addClef = false,
  key = "C",
  addTimeSig = false,
  slurs = []
) {
  const stave = new VF.Stave(x, y, staveWidth);
  if (addClef) stave.addClef("treble").addKeySignature(key);
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
      }).setContext(context).draw();
    } else if (slur.type === "curve") {
      new VF.Curve(slur.from, slur.to, {
        cps: slur.cps || [{ x: 0, y: 20 }, { x: 0, y: 20 }],
      }).setContext(context).draw();
    }
  });
  return stave;
}

function getKeys(rangeDifficulty) {
  if (rangeDifficulty == 1) {
    return ["c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5"];
  }
  if (rangeDifficulty == 2) {
    return [
      "a/3",
      "b/3",
      "c/4",
      "d/4",
      "e/4",
      "f/4",
      "g/4",
      "a/4",
      "b/4",
      "c/5",
      "d/5",
      "e/5",
    ];
  }
  if (rangeDifficulty == 3) {
    return [
      "a/3",
      "b/3",
      "c/4",
      "d/4",
      "e/4",
      "f/4",
      "g/4",
      "a/4",
      "b/4",
      "c/5",
      "d/5",
      "e/5",
      "f/5",
    ];
  }
  if (rangeDifficulty == 4) {
    return [
      "g/3",
      "a/3",
      "b/3",
      "c/4",
      "d/4",
      "e/4",
      "f/4",
      "g/4",
      "a/4",
      "b/4",
      "c/5",
      "d/5",
      "e/5",
      "f/5",
      "g/5",
    ];
  }
  if (rangeDifficulty == 5) {
    return [
      "g/3",
      "a/3",
      "b/3",
      "c/4",
      "d/4",
      "e/4",
      "f/4",
      "g/4",
      "a/4",
      "b/4",
      "c/5",
      "d/5",
      "e/5",
      "f/5",
      "g/5",
      "a/5",
      "b/5",
    ];
  }
  if (rangeDifficulty == 6) {
    return [
      "g/3",
      "a/3",
      "b/3",
      "c/4",
      "d/4",
      "e/4",
      "f/4",
      "g/4",
      "a/4",
      "b/4",
      "c/5",
      "d/5",
      "e/5",
      "f/5",
      "g/5",
      "a/5",
      "b/5",
      "c/6",
    ];
  }
  if (rangeDifficulty == 7) {
    return [
      "g/3",
      "a/3",
      "b/3",
      "c/4",
      "d/4",
      "e/4",
      "f/4",
      "g/4",
      "a/4",
      "b/4",
      "c/5",
      "d/5",
      "e/5",
      "f/5",
      "g/5",
      "a/5",
      "b/5",
      "c/6",
      "d/6",
    ];
  }
}

const sharpsByKey = {
  "C": [],            
  "G": ["f"],
  "D": ["f", "c"],
  "A": ["f", "c", "g"],
  "E": ["f", "c", "g", "d"],
  "B": ["f", "c", "g", "d", "a"],
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
    "c": 0, "c#": 1, "db": 1, "d": 2, "d#": 3,"eb": 3,
    "e": 4,"e#": 4,"f": 5, "f#": 6,"gb": 6, "g": 7,
    "g#": 8,"ab": 8, "a": 9, "a#": 10, "ab": 10,"b": 11, "b#": 12
  };
      return 12 * (parseInt(octave) + 1) + base[name.toLowerCase()];
    }

    function getDurationInSeconds(vfDuration) {
      const wholeNoteLength = 3;
      const map = {
        w: wholeNoteLength,
        h: wholeNoteLength/2,
        q: wholeNoteLength/4,
        "8": wholeNoteLength/8,
        "16": wholeNoteLength/16
      };
      return map[vfDuration] || 1;
    }

    let audioCtx;
    let trumpet;
    async function playNotes() {
      stopNotes();
      const keySignature = document.getElementById("keySelector").value
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      trumpet = await Soundfont.instrument(audioCtx, "trumpet");

      let time = audioCtx.currentTime;

      for (const note of allNotes) {
        const key = note.keys[0];
        const duration = getDurationInSeconds(note.duration);
        const midi = vexToMidi(key, keySignature);
        trumpet.play(midi, time, { duration });
        time += duration;
      }
    }

    function stopNotes(){
      if (audioCtx) {
        audioCtx.close();
      audioCtx = null;
  }
    }