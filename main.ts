import { App, MarkdownPostProcessor, MarkdownPostProcessorContext, MarkdownPreviewRenderer, MarkdownRenderer, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { signature, renderAbc } from 'abcjs';

export default class MusicPlugin extends Plugin {
	onload() {
		console.log('loading abcjs plugin');
		this.registerMarkdownCodeBlockProcessor('music-abc', async (source: string, el: HTMLElement, ctx) => {
			renderAbc(el, source, {
				add_classes: true,
				responsive: 'resize'
			});
		});
	}

	onunload() {
		console.log('unloading abcjs plugin');
	}
}
