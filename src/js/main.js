
@import "./modules/test.js"


const audiomass = {
	init() {
		// fast references
		this.els = {
			doc: $(document),
			content: window.find("content"),
		};

		// init all sub-objects
		Object.keys(this)
			.filter(i => typeof this[i].init === "function")
			.map(i => this[i].init(this));

		// DEV-ONLY-START
		Test.init(this);
		// DEV-ONLY-END
	},
	dispatch(event) {
		let APP = audiomass,
			el;
		// console.log(event);
		switch (event.type) {
			// native events
			case "window.init":
			case "window.resize":
			case "window.keystroke":
				break;
			default:
				if (event.el) {
					let pEl = event.el.parents(`div[data-area]`);
					if (pEl.length) {
						let name = pEl.data("area");
						return APP[name].dispatch(event);
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

window.exports = audiomass;
