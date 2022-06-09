
@import "modules/waves.js"


const loopslicer = {
	init() {
		// fast references
		this.els = {
			doc: $(document),
			content: window.find("content"),
			wavesFull: window.find(".waves .cvs-full"),
			wavesZoom: window.find(".waves .cvs-zoom"),
			asa: window.find(".box .asa"),
		};

		// bind event handlers
		this.els.content.on("mousedown", this.dispatch);

		// temp
		this.dispatch({ type: "draw-audio" });
	},
	async dispatch(event) {
		let APP = loopslicer,
			el;
		switch (event.type) {
			// native events
			case "mousedown":
				el = $(event.target);
				if (el.hasClass("area")) APP.minimapMove(event);
				else if (el.hasClass("volume-knob")) APP.volumeMove(event);
				break;
			// custom events
			case "stop-audio":
				Waves.stop();
				break;
			case "play-audio":
				Waves.start();
				break;
			case "draw-audio":
				await Waves.init({
					// url: "~/audio/TheUnderworld.ogg",
					// url: "~/audio/ol2.wav",
					url: "~/audio/here-we-are.mp3",
					cvsFull: APP.els.wavesFull.find("canvas"),
					cvsZoom: APP.els.wavesZoom.find("canvas"),
					asa: APP.els.asa.find("canvas"),
					zoom: .17,
				});

				Waves.draw({ cvs: "cvsFull", start: 0, end: 1 });
				Waves.draw({ cvs: "cvsZoom", start: 0, end: .17 });
				break;
		}
	},
	volumeMove(event) {
		let APP = loopslicer,
			Self = APP,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// cover content
				Self.els.content.addClass("cover hideMouse");
				// prepare drag info
				let el = $(event.target);
				// create drag object
				Self.drag = {
					el,
					clickY: parseInt(el.cssProp("--volume"), 10) + event.clientY,
					min_: Math.min,
					max_: Math.max,
				};
				// bind event
				Self.els.doc.on("mousemove mouseup", Self.volumeMove);
				break;
			case "mousemove":
				let volume = Drag.min_(Drag.max_(Drag.clickY - event.clientY, -135), 135);
				Drag.el.css({ "--volume": `${volume}deg` });
				break;
			case "mouseup":
				// cover content
				Self.els.content.removeClass("cover hideMouse");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.volumeMove);
				break;
		}
	},
	minimapMove(event) {
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
				Self.els.doc.on("mousemove mouseup", Self.minimapMove);
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
				Self.els.doc.off("mousemove mouseup", Self.minimapMove);
				break;
		}
	}
};

window.exports = loopslicer;
