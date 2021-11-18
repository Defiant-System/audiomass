
@import "modules/waves.js"


const loopslicer = {
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
			cvsFull: window.find(".cvs-full canvas"),
			cvsZoom: window.find(".cvs-zoom canvas"),
		};

		// temp
		this.dispatch({ type: "draw-audio" });
	},
	async dispatch(event) {
		let APP = loopslicer,
			el;
		switch (event.type) {
			// system events
			case "window.open":
				break;
			// custom events
			case "draw-audio":
				await Waves.init({
					url: "~/audio/ol2.wav",
					cvsFull: APP.els.cvsFull,
					cvsZoom: APP.els.cvsZoom,
				});

				Waves.draw({
					cvs: "cvsFull",
					start: 0,
					end: 100,
				});

				Waves.draw({
					cvs: "cvsZoom",
					start: 0,
					end: 30,
				});
				break;
		}
	}
};

window.exports = loopslicer;
