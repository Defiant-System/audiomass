
@import "./classes/file.js"
@import "./classes/file-tabs.js"
@import "./classes/ima-timeline-plugin.js"

@import "./modules/audio-utils.js"
@import "./modules/audio-fx.js"
@import "./modules/dialogs.js"
@import "./modules/ui.js"
@import "./modules/test.js"


let {
	AudioContext,
	AudioMotionAnalyzer,
	WaveSurfer,
	RegionsPlugin,
	TimelinePlugin,
	Minimap,
	EnvelopePlugin,
	Spectrogram,
	RecordPlugin,
	ZoomPlugin,
} = await window.fetch("~/js/bundle.js");


const imaudio = {
	init() {
		this.dispatch({ type: "init-workers" });
	},
	dispose(event) {
		if (event.spawn) {
			return this.spawn.dispose(event);
		}
		Object.keys(this.workers).map(key => this.workers[key].terminate());
	},
	dispatch(event) {
		let Self = imaudio,
			spawn,
			el;
		// proxy spawn events
		if (event.spawn) return Self.spawn.dispatch(event);
		// console.log(event);
		switch (event.type) {
			// system events
			case "new-spawn":
			case "window.init":
				spawn = window.open("spawn");
				// Self.spawn.dispatch({ ...event, type: "spawn.init", spawn });
				break;
			case "open.file":
			case "open-url":
			case "load-samples":
				spawn = window.open("spawn");
				Self.spawn.dispatch({ ...event, spawn });
				break;
			// custom events
			case "init-workers":
				// simple wrapper around workers
				Object.keys(Self.workers).map(key => {
					let worker = new Worker(Self.workers[key]);
					worker.send = function(message) {
						this.postMessage(message);
						return new Promise((resolve, reject) => {
							this.onmessage = e => resolve(e);
							this.onerror = e => reject(e);
						});
					};
					Self.workers[key] = worker;
				});
				break;
		}
	},
	spawn: @import "./modules/spawn.js",
	workers: {
		wav: "~/js/workers/wav.js",
	}
};

window.exports = imaudio;
