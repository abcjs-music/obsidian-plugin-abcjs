import {
  MidiBuffer,
  SynthObjectController,
  TuneObject,
  renderAbc,
  synth,
} from "abcjs";
import { MarkdownRenderChild } from "obsidian";
import {
  AUDIO_PARAMS,
  DEFAULT_OPTIONS,
  OPTIONS_REGEX,
  PLAYBACK_CONTROLS_ID,
  SYNTH_INIT_OPTIONS,
} from "./config";
import { NoteHighlighter, outlineRegion } from "./note_highlighter";

/**
 * This class abstraction is needed to support load/unload hooks
 *
 * "If your post processor requires lifecycle management, for example, to clear an interval, kill a subprocess, etc when this element is removed from the app..."
 * https://marcus.se.net/obsidian-plugin-docs/reference/typescript/interfaces/MarkdownPostProcessorContext#addchild
 */
export class PlaybackElement extends MarkdownRenderChild {
  private readonly abortController = new AbortController();
  private readonly midiBuffer: MidiBuffer = new synth.CreateSynth();
  private readonly synthCtrl: SynthObjectController =
    new synth.SynthController();

  constructor(
    private readonly el: HTMLElement,
    private readonly markdownSource: string,
  ) {
    super(el); // important
  }

  onload() {
    const { parsedOptions, source } = this.parseOptionsAndSource(
      this.markdownSource,
    );
    const renderResp = renderAbc(
      this.el,
      source,
      Object.assign(DEFAULT_OPTIONS, parsedOptions),
    )[0];
    this.enableAudioPlayback(renderResp);
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

  parseOptionsAndSource(markdownSource: string): {
    parsedOptions: {};
    source: string;
  } {
    const optionsMatch = markdownSource.match(OPTIONS_REGEX);
    return optionsMatch?.groups
      ? {
          parsedOptions: this.parseUserOptions(optionsMatch.groups["options"]),
          source: optionsMatch.groups["source"],
        }
      : { parsedOptions: {}, source: markdownSource };
  }

  parseUserOptions(options: string): any {
    try {
      return JSON.parse(options);
    } catch (e: unknown) {
      this.renderError(
        `Failed to parse user-options: ${e instanceof Error ? e.message : JSON.stringify(e)}`,
      );
      return {};
    }
  }

  renderError(msg: string): void {
    console.error(msg);
    const errorNode = document.createElement("div");
    errorNode.innerHTML = msg;
    errorNode.addClass("obsidian-plugin-abcjs-error");
    this.el.appendChild(errorNode);
  }

  // Audio playback features
  // Many variants, options, and guidance here: https://paulrosen.github.io/abcjs/audio/synthesized-sound.html
  enableAudioPlayback(visualObj: TuneObject) {
    if (!synth.supportsAudio()) return;

    // We need the SynthController to drive NoteHighlighter (CursorControl), even though we don't want the UI controls from SynthController
    this.synthCtrl.load(
      `#${PLAYBACK_CONTROLS_ID}`, //controlsEl, // can be an HTMLElement reference or css selector
      new NoteHighlighter(this.el), // an implementation of a `CursorControl`
    );

    this.midiBuffer
      .init({ visualObj, options: SYNTH_INIT_OPTIONS })
      .then(() => this.synthCtrl.setTune(visualObj, false, AUDIO_PARAMS))
      .catch(console.warn.bind(console));

    const signal = this.abortController.signal; // for event cleanup
    this.el.addEventListener("click", this.togglePlayback, { signal });
    this.el.addEventListener("dblclick", this.synthCtrl.restart, { signal });
  }

  private togglePlayback(): void {
    // private access. Can improve when https://github.com/paulrosen/abcjs/pull/917 merges
    const isPlaying = (this.midiBuffer as any)?.isRunning;
    isPlaying ? this.synthCtrl.pause() : this.synthCtrl.play();
    outlineRegion(this.el, isPlaying);
  }
}
