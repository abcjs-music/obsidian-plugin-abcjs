import { MidiBuffer, TuneObject, renderAbc, synth, SynthOptions } from 'abcjs';
import { MarkdownRenderChild } from 'obsidian';
import { AUDIO_PARAMS, DEFAULT_OPTIONS, OPTIONS_REGEX, PLAYBACK_CONTROLS_ID, SYNTH_INIT_OPTIONS } from './cfg';
import { NoteHighlighter, togglePlayingHighlight } from './note_highlighter';

/**
 * This class abstraction is needed to support load/unload hooks
 * 
 * "If your post processor requires lifecycle management, for example, to clear an interval, kill a subprocess, etc when this element is removed from the app..."
 * https://marcus.se.net/obsidian-plugin-docs/reference/typescript/interfaces/MarkdownPostProcessorContext#addchild
 */
export class PlaybackElement extends MarkdownRenderChild {
  private readonly abortController = new AbortController();
  private readonly midiBuffer: MidiBuffer = new synth.CreateSynth();
  private readonly synthCtrl = new synth.SynthController();

  constructor(
    private readonly el: HTMLElement,
    private readonly markdownSource: string,
  ) {
    super(el); // important
  }

  onload() {
    const { userOptions, source } = this.parseOptionsAndSource();
    const options = { ...DEFAULT_OPTIONS, ...userOptions };
    const renderResp = renderAbc(this.el, source, options);
    this.enableAudioPlayback(renderResp[0]);
  }

  /**
   * Stop the music and clean things up.
   * 
   * (Tested) Called when:
   * 1. Cursor focus goes into the text area (which switches from preview to edit mode)
   * 2. A tab containing this is closed (very important)
   * 
   * Not called when:
   * 1. Switching tabs to a different one (audio keeps playing)
   */
  onunload() {
    this.abortController.abort(); // dom event listeners

    // A lot of steps, but I think all these things need to happen to really stop in-progress audio playback for ABCjs.
    this.synthCtrl.restart();
    this.synthCtrl.pause();
    this.midiBuffer.stop(); // doesn't stop the music by itself?
  }

  parseOptionsAndSource(): { userOptions: Record<string, any>, source: string } {
    let userOptions: Record<string, any> = {};

    const optionsMatch = this.markdownSource.match(OPTIONS_REGEX);
    let source = this.markdownSource; // can be modified, removes the options portion.
    if (optionsMatch !== null) {
      source = optionsMatch.groups["source"];
      try {
        userOptions = JSON.parse(optionsMatch.groups["options"]);
      } catch (e) {
        console.error(e);
        this.renderError(`<strong>Failed to parse user-options</strong>
	${e}`);
      }
    }

    return { userOptions, source };
  }

  renderError(error?: string) {
    if (error == null) return;
    const errorNode = document.createElement('div');
    errorNode.innerHTML = error;
    errorNode.addClass("obsidian-plugin-abcjs-error");
    this.el.appendChild(errorNode);
  }

  // Audio playback features
  // Many variants, options, and guidance here: https://paulrosen.github.io/abcjs/audio/synthesized-sound.html
  enableAudioPlayback(visualObj: TuneObject) {
  if (!synth.supportsAudio()) return;

  // Extract user options (already done in onload via parseOptionsAndSource)
  const { userOptions } = this.parseOptionsAndSource();

  // Separate visual vs audio options? (Optional)
  // For now, assume any unknown options are for audio/synth
  const audioParamsFromUser: Record<string, any> = {};
  const knownAudioKeys = ['swing', 'chordsOff']; // add others as needed

  for (const key of knownAudioKeys) {
    if (userOptions.hasOwnProperty(key)) {
      audioParamsFromUser[key] = userOptions[key];
    }
  }

  // Merge: defaults (from cfg) <- user overrides
  const finalAudioParams: SynthOptions = { ...AUDIO_PARAMS, ...audioParamsFromUser };

  // We need the SynthController to drive NoteHighlighter (CursorControl)
  this.synthCtrl.load(
    `#${PLAYBACK_CONTROLS_ID}`,
    new NoteHighlighter(this.el),
  );

  this.midiBuffer.init({ visualObj, options: SYNTH_INIT_OPTIONS })
    .then(() => this.synthCtrl.setTune(visualObj, false, finalAudioParams))
    .catch(console.warn.bind(console));

  const signal = this.abortController.signal;
  this.el.addEventListener('click', this.togglePlayback, { signal });
  this.el.addEventListener('dblclick', this.restartPlayback, { signal });
}

  private readonly togglePlayback = () => {
    // private access. Can improve when https://github.com/paulrosen/abcjs/pull/917 merges
    const isPlaying = (this.midiBuffer as any)?.isRunning;
    isPlaying ? this.synthCtrl.pause() : this.synthCtrl.play();
    togglePlayingHighlight(this.el)(isPlaying);
  };

  // start again at the begining of the tune
  private readonly restartPlayback = () => {
    this.synthCtrl.restart();
  };
}