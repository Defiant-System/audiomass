
@import "modules/waves.js"


const loopslicer = {
	init() {
		// fast references
		this.els = {
			doc: $(document),
			content: window.find("content"),
			wavesFull: window.find(".waves .cvs-full"),
			wavesZoom: window.find(".waves .cvs-zoom"),
		};

		// bind event handlers
		this.els.wavesFull.on("mousedown", this.fullViewMove);

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
					url: "~/audio/TheUnderworld.ogg",
					// url: "~/audio/ol2.wav",
					cvsFull: APP.els.wavesFull.find("canvas"),
					cvsZoom: APP.els.wavesZoom.find("canvas"),
					zoom: .3,
				});

				Waves.draw({ cvs: "cvsFull", start: 0, end: 1 });
				Waves.draw({ cvs: "cvsZoom", start: 0, end: .3 });
				break;
		}
	},
	fullViewMove(event) {
		let APP = loopslicer,
			Self = APP,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// prepare drag info
				let pEl = APP.els.wavesFull,
					el = pEl.find(".area"),
					offset = {
						x: el.prop("offsetLeft"),
						w: el.prop("offsetWidth"),
					},
					clickX = event.clientX - offset.x,
					min = { x: -3 },
					max = {
						x: pEl.prop("offsetWidth") - offset.w + 3,
						wx: pEl.prop("offsetWidth") + 6,
						ex: offset.w / (pEl.prop("offsetWidth") + 6),
					};
				// create drag object
				Self.drag = {
					el,
					offset,
					clickX,
					min,
					max,
				};
				// bind event
				Self.els.doc.on("mousemove mouseup", Self.fullViewMove);
				break;
			case "mousemove":
				let left = Math.min(Math.max(event.clientX - Drag.clickX, Drag.min.x), Drag.max.x),
					start = (left + 3) / Drag.max.wx,
					end = start + Drag.max.ex;
				// move element
				Drag.el.css({ left });
				// update zoomed canvas
				Waves.draw({ cvs: "cvsZoom", start, end });
				break;
			case "mouseup":
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.fullViewMove);
				break;
		}
	}
};

window.exports = loopslicer;
