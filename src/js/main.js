
@import "./classes/file.js"
@import "./classes/file-tabs.js"
@import "./classes/ima-timeline-plugin.js"

@import "./modules/audio-utils.js"
@import "./modules/dialogs.js"
@import "./modules/peq.js"
@import "./modules/ui.js"
@import "./modules/test.js"


let {
	AudioContext,
	AudioMotionAnalyzer,
	OfflineAudioContext,
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
					Self.workers[key] = {
						_stack: {},
						_worker: new Worker(Self.workers[key]),
						send(msg) {
							this._worker.postMessage(msg);
							this._worker.onmessage = e => this._stack["message"] ? this._stack["message"](e.data) : null;
							this._worker.onerror = e => this._stack["error"] ? this._stack["error"](e.data) : null;
							return this;
						},
						on(type, callback) {
							this._stack[type] = callback;
							return this;
						},
						terminate() {
							this._worker.terminate();
						}
					};
				});
				break;
		}
	},
	spawn: @import "./modules/spawn.js",
	workers: {
		wav: "~/js/workers/wav.js",
		mp3: "~/js/workers/lame.js",
	}
};

window.exports = imaudio;
