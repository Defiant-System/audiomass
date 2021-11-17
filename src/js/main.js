
@import "modules/audio.js"


const loopslicer = {
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
			cvs: window.find("canvas"),
		};

		// temp
		this.dispatch({ type: "set-canvas-width-height" });
	},
	async dispatch(event) {
		let APP = loopslicer,
			el;
		switch (event.type) {
			// system events
			case "window.open":
				break;
			// custom events
			case "set-canvas-width-height":
				APP.els.cvs.attr({
					width: APP.els.cvs.prop("offsetWidth"),
					height: APP.els.cvs.prop("offsetHeight"),
				});

				Audio.init(APP.els.cvs);

				// await Audio.visualizeFile({ url: "~/audio/TheUnderworld.ogg" });
				await Audio.visualizeFile({ url: "~/audio/ol2.wav" });

				break;
		}
	}
};

window.exports = loopslicer;
