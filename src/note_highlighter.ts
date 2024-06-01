import { CursorControl, NoteTimingEvent } from 'abcjs';

/**
 * Monitors playback and provides event hooks.
 * 
 * Used to:
 * 1. indicate song start/end
 * 2. highlight the currently playing note
 * 
 * https://paulrosen.github.io/abcjs/audio/synthesized-sound.html#cursorcontrol-object
 */
export class NoteHighlighter implements CursorControl {
  constructor(private readonly el: HTMLElement) { }

  beatSubdivisions = 2;
  onStart = () => outlineRegion(this.el, true);
  onFinished = () => {
    outlineRegion(this.el, false)
    clearNoteHighlights(this.el)
  }

  // On every note event, clear highlights and redraw with current note highlighted.
  onEvent(event: NoteTimingEvent) {
    // this was the second part of a tie across a measure line. Just ignore it.
    if (event.measureStart && event.left === null) return;
    // Select the currently selected notes.
    clearNoteHighlights(this.el);
    event.elements?.flat().forEach((el: HTMLElement) => redrawCurrentNote(el, 'highlighted'))
  }
}
export function redrawCurrentNote(el: Element, highlighted: 'highlighted' | 'clear'): void {
  switch (highlighted) {
    case 'highlighted':
      el.classList.add("abcjs-highlight")
    case 'clear':
      el.classList.remove("abcjs-highlight")
  }
}

export function outlineRegion(el: HTMLElement, isPlaying: boolean): boolean {
  return el.parentElement?.classList.toggle('is-playing', isPlaying) ?? false
}

export function clearNoteHighlights(parent: HTMLElement): void {
  Array
    .from(parent.querySelectorAll(".abcjs-highlight"))
    .forEach((el: Element) => redrawCurrentNote(el, 'clear'))
}
