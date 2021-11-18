
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
		this.els.wavesFull.on("mousedown", this.doFullView);

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
					cvsFull: APP.els.wavesFull.find("canvas"),
					cvsZoom: APP.els.wavesZoom.find("canvas"),
				});

				Waves.draw({
					cvs: "cvsFull",
					start: 0,
					end: 1,
				});

				Waves.draw({
					cvs: "cvsZoom",
					start: 0,
					end: .3,
				});
				break;
		}
	},
	doFullView(event) {
		let APP = loopslicer,
			Self = APP,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				let pEl = APP.els.wavesFull,
					el = pEl.find(".area"),
					offset = {
						x: el.prop("offsetLeft"),
						w: el.prop("offsetWidth"),
					},
					clickX = event.clientX - offset.x,
					minX = -3,
					maxX = pEl.prop("offsetWidth") - offset.w + 3;
				
				// create drag object
				Self.drag = {
					el,
					offset,
					clickX,
					minX,
					maxX,
				};
				// bind event
				Self.els.doc.on("mousemove mouseup", Self.doFullView);
				break;
			case "mousemove":
				let left = Math.min(Math.max(event.clientX - Drag.clickX, Drag.minX), Drag.maxX),
					start = left / Drag.maxX,
					end = (left + Drag.offset.w) / Drag.maxX;
				// move element
				Drag.el.css({ left });

				Waves.draw({ cvs: "cvsZoom", start, end });
				break;
			case "mouseup":
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.doFullView);
				break;
		}
	}
};

window.exports = loopslicer;
