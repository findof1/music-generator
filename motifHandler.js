import { copyNoteNewKey } from "./musicUtils.js"

export function alterMeasure(notes, keys) {
  const newNotes = [];
  let lastKey = 0;
  let i = 0;
  for (const note of notes) {

    const originalKey = note.getKeys()[0];
    
    const ret = alterNote(originalKey, keys);
    const newKey = ret.note;
  
    newNotes[i] = copyNoteNewKey(note, [newKey]); 
    lastKey = ret.lastKey;
    
    i++;
  }
  return {notes : newNotes, lastKey}
}

function alterNote(note, keys) {
  return moveNoteUpFullStep(note, keys);
}

function moveNoteUpFullStep(note, keys) {
  let index = keys.indexOf(note);
  if (index === -1) {
    console.warn(`Key ${note} not found in pitch array.`);
    return note;
  }
  const nextIndex = index + 1 < keys.length - 1 ? index + 1 : 0;
  return {note : keys[nextIndex], lastNote:nextIndex};
}

