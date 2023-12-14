
@import "./classes/file.js"
@import "./classes/file-tabs.js"
@import "./modules/test.js"


let {
	WaveSurfer,
	RegionsPlugin,
	TimelinePlugin,
	Minimap,
	EnvelopePlugin,
	Spectrogram,
	RecordPlugin,
	ZoomPlugin,
	AudioMotionAnalyzer,
} = await window.fetch("~/js/bundle.js");



const imaudio = {
	init() {
		// fast references
		this.els = {
			doc: $(document),
			content: window.find("content"),
		};
		// initiate file tabs
		this.data = { tabs: new FileTabs(this) };

		// init all sub-objects
		Object.keys(this)
			.filter(i => typeof this[i].init === "function")
			.map(i => this[i].init(this));

		// DEV-ONLY-START
		Test.init(this);
		// DEV-ONLY-END
	},
	dispatch(event) {
		let Self = imaudio,
			Tabs = Self.data ? Self.data.tabs : false,
			name,
			value,
			data,
			el;
		// console.log(event);
		switch (event.type) {
			// native events
			case "window.init":
			case "window.resize":
			case "window.keystroke":
				break;

			// custom events
			case "load-samples":
				// opening image file from application package
				event.names.map(async name => {
					// forward event to app
					let file = await Tabs.openLocal(`~/samples/${name}`);
					Self.dispatch({ ...event, type: "prepare-file", isSample: true, file });
				});
				break;
			case "prepare-file":
				if (!event.isSample) {
					// add file to "recent" list
					Self.blankView.dispatch({ ...event, type: "add-recent-file" });
				}
				// hide blank view
				Tabs.dispatch({ ...event, type: "hide-blank-view" });
				// open file with Files
				Tabs.add(event.file);
				break;


			case "close-tab":
				value = Tabs.length;
				if (event.delayed) {
					Tabs.removeDelayed();
				} else if (value > 1) {
					Tabs.active.tabEl.find(`[sys-click]`).trigger("click");
				} else if (value === 1) {
					Self.dispatch({ ...event, type: "close-window" });
				}
				break;
			case "close-window":
				// system close window / spawn
				karaqu.shell("win -c");
				break;

			default:
				if (event.el) {
					let pEl = event.el.parents(`div[data-area]`);
					if (pEl.length) {
						let name = pEl.data("area");
						return Self[name].dispatch(event);
					}
				}
		}
	},
	blankView: @import "./areas/blank-view.js",
	toolbar: @import "./areas/toolbar.js",
	sidebar: @import "./areas/sidebar.js",
	waves: @import "./areas/waves.js",
	speaker: @import "./areas/speaker.js",
	frequency: @import "./areas/frequency.js",
	spectrum: @import "./areas/spectrum.js",
};

window.exports = imaudio;
