import { App, MarkdownPostProcessor, MarkdownPostProcessorContext, MarkdownPreviewRenderer, MarkdownRenderer, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { signature, renderAbc } from 'abcjs';

export default class MusicPlugin extends Plugin {
	static postprocessor: MarkdownPostProcessor = (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
		// Assumption: One <pre> section always contains only the code block

		const blocksToReplace = el.querySelectorAll('pre')
		if (blocksToReplace.length < 1) return

		// Generally, blocksToReplace will be length 1 (called for every single block of code/text)
		// On print to PDF, the entire document is passed to this function at once
		// This for loop handles both cases - regular render and print-to-PDF
		for (var i = 0; i < blocksToReplace.length; i++) {
			const musicBlock = blocksToReplace[i].querySelector('code.language-music-abc')
			if (!musicBlock) continue
	
			const source = musicBlock.textContent
			const destination = document.createElement('div')
			renderAbc(destination, source, {
				add_classes: true,
				responsive: 'resize'
			})
	
			el.replaceChild(destination, blocksToReplace[i])
		}
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
