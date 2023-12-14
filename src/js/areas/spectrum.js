
// imaudio.spectrum

{
	init() {
		// fast references
		this.els = {
			cvs: window.find(`.dock .box[data-area="spectrum"] canvas`),
		};

		// subscribe to events
		window.on("audio-play", this.dispatch);
		window.on("audio-pause", this.dispatch);
		window.on("audio-stop", this.dispatch);
	},
	dispatch(event) {
		let APP = imaudio,
			Self = APP.spectrum,
			isOn,
			el;
		switch (event.type) {
			// subscribed events
			case "audio-play":
				// turn on flag
				Self._playing = true;
				// Self.draw();
				break;
			case "audio-pause":
			case "audio-stop":
				// reset flag
				delete Self._playing;
				cancelAnimationFrame(Self._rafId);
				break;
			// custom events
			case "connect-file-output":
				// fit canvas
				let width = +Self.els.cvs.parent().prop("offsetWidth"),
					height = +Self.els.cvs.parent().prop("offsetHeight");
				Self.els.cvs.attr({ width, height });

				// Self._ws = event.file._ws;
				// Self.audioCtx = new AudioContext();
				// Self.node = Self.audioCtx.createMediaElementSource(Self._ws.media);
				// console.log(Self.node);
				break;
			case "toggle-analyser":
				isOn = event.el.parent().hasClass("on");
				event.el.parent().toggleClass("on", isOn);
				break;
		}
	},
	draw() {
		if (!this._playing) return;
		this._rafId = requestAnimationFrame(() => this.draw());

		// let data = 1;
		// console.log(data);
	}
}
