import { AbcVisualParams, SynthOptions } from 'abcjs';



export const PLAYBACK_CONTROLS_ID = 'abcjs-playback-controls-unused';

export const OPTIONS_REGEX = new RegExp(/(?<options>{.*})\n---\n(?<source>.*)/s);

export const DEFAULT_OPTIONS: AbcVisualParams = {
  add_classes: true,
  responsive: 'resize'
};

export const AUDIO_PARAMS: SynthOptions = {
  // chordsOff: true,
};

export const SYNTH_INIT_OPTIONS: SynthOptions = {
  // Give it a little more room:
  pan: [-0.25, 0.25],
  
  // Sound "fonts".
  // These could be distributed locally with the plugin, but fair warning, they're large (GBs for all notes, I think)
  // soundFontUrl: 'https://paulrosen.github.io/midi-js-soundfonts/abcjs/', // bright, crisp
  soundFontUrl: 'https://paulrosen.github.io/midi-js-soundfonts/FluidR3_GM/', // loud, deeper
  // soundFontUrl: 'https://paulrosen.github.io/midi-js-soundfonts/MusyngKite/', // muted, more mids?
};
