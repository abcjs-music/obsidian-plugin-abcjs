import { App, MarkdownPostProcessor, MarkdownPostProcessorContext, MarkdownPreviewRenderer, 
	MarkdownRenderer, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { renderAbc, AbcVisualParams, synth, CursorControl, NoteTimingEvent, SynthOptions, SynthVisualOptions } from 'abcjs';

const optionsRegex = new RegExp(/(?<options>{.*})\n---\n(?<source>.*)/s);
const DEFAULT_OPTIONS: AbcVisualParams = {
	add_classes: true,
	responsive: 'resize'
};
const AUDIO_PARAMS: SynthOptions = { chordsOff: true };
const SYNTH_INIT_OPTIONS: SynthOptions = {
	// soundFontUrl: '', // TODO: use a local MIDI "sound font" so that playback works offline
	pan: [ -0.25, 0.25 ] // a quarter note, I think? Not sure
};
const SYNTH_PLAYBACK_UI_OPTIONS: SynthVisualOptions = {
	displayPlay: true,
	displayWarp: true, // Tune speed. TODO: shared pref for playback speed across multiple tunes?
	displayLoop: true, // option to loop the tune. Sometimes funky about timing on the first loop.
};



export default class MusicPlugin extends Plugin {
	onload() {
		console.log('loading abcjs plugin');

		this.registerMarkdownCodeBlockProcessor('abc', this.codeProcessor);
		this.registerMarkdownCodeBlockProcessor('music-abc', this.codeProcessor);
	}

	onunload() {
		console.log('unloading abcjs plugin');
	}

	async codeProcessor (source: string, el: HTMLElement, ctx: any) {
		let userOptions = {};
		let error = null;

		const optionsMatch = source.match(optionsRegex);
		if (optionsMatch !== null) {
			source = optionsMatch.groups["source"];
			try {
				userOptions = JSON.parse(optionsMatch.groups["options"]);
			} catch (e) {
				console.error(e);
				error = `<strong>Failed to parse user-options</strong>\n\t${e}`;
			}
		}

		if (error !== null) {
			const errorNode = document.createElement('div');
			errorNode.innerHTML = error;
			errorNode.addClass("obsidian-plugin-abcjs-error");
			el.appendChild(errorNode);
		}

		const renderResp = renderAbc(el, source, Object.assign(DEFAULT_OPTIONS, userOptions));
		const visualObj = renderResp[0];

		// Support audio playback.
		// Many variants, options, and guidance here: https://paulrosen.github.io/abcjs/audio/synthesized-sound.html
		if (synth.supportsAudio()) {
			// Warning: make sure additional appends to the `el` are done after the call to `renderAbc()`
			const controlsEl = document.createElement('aside');
			controlsEl.className = 'playback-controls';
			el.appendChild(controlsEl);

			const synthControl = new synth.SynthController();
			synthControl.load(
				controlsEl, // can be an HTMLElement reference or css selector
				new NoteHighlighter(el), // an implementation of a `CursorControl`
				SYNTH_PLAYBACK_UI_OPTIONS,
			);

			const synthInstance = new synth.CreateSynth();
			synthInstance.init({ visualObj, options: SYNTH_INIT_OPTIONS })
				.then(() => synthControl.setTune(visualObj, false, AUDIO_PARAMS))
				.catch(console.warn.bind(console));
		}
	}
}



/**
 * Monitors playback and provides event hooks.
 * 
 * Used to:
 * 1. indicate song start/end
 * 2. highlight the currently playing note
 */
class NoteHighlighter implements CursorControl {
	beatSubdivisions = 2;

	constructor(private readonly el: HTMLElement) {}

	onStart = () => this.markIsPlaying(true);
	onFinished = () => {
		this.markIsPlaying(false);
		this.removeNoteHighlights();
	};
	onEvent(event: NoteTimingEvent) {
		// this was the second part of a tie across a measure line. Just ignore it.
		if (event.measureStart && event.left === null) return;

		this.removeNoteHighlights();
		// Select the currently selected notes.
		const notes = event.elements.flat();
		notes.forEach(el => el.classList.add("abcjs-highlight"));
	}

	// Unselect any previously selected notes.
	removeNoteHighlights() {
		const selected = Array.from(this.el.querySelectorAll(".abcjs-highlight"));
		selected.forEach(el => el.classList.remove("abcjs-highlight"));
	}

	markIsPlaying(is: boolean) {
		this.el.parentElement.classList.toggle('is-playing', is);
	}
}