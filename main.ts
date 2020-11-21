import { App, MarkdownPostProcessor, MarkdownPostProcessorContext, MarkdownPreviewRenderer, MarkdownRenderer, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { signature, renderAbc } from 'abcjs';

export default class MusicPlugin extends Plugin {
	static postprocessor: MarkdownPostProcessor = (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
		// Assumption: One section always contains only the code block

		const blockToReplace = el.querySelector('pre')
		if (!blockToReplace) return

		const musicBlock = blockToReplace.querySelector('code.language-music-abc')
		if (!musicBlock) return

		const source = musicBlock.textContent
		const destination = document.createElement('div')
		renderAbc(destination, source, {
			add_classes: true,
			responsive: 'resize'
		})

		el.replaceChild(destination, blockToReplace)
	}

	onload() {
		console.log('loading abcjs plugin');
		MarkdownPreviewRenderer.registerPostProcessor(MusicPlugin.postprocessor)
	}

	onunload() {
		console.log('unloading abcjs plugin');
		MarkdownPreviewRenderer.unregisterPostProcessor(MusicPlugin.postprocessor)
	}
}
