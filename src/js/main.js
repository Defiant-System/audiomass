
@import "./classes/file.js"
@import "./classes/file-tabs.js"
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
		
	},
	dispose(event) {
		if (event.spawn) {
			return this.spawn.dispose(event);
		}
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
		}
	},
	spawn: @import "./modules/spawn.js",
};

window.exports = imaudio;
