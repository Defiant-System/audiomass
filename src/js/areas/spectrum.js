
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
				Self.draw();
				break;
			case "audio-pause":
			case "audio-stop":
				// reset flag
				delete Self._playing;
				break;
			// custom events
			case "connect-file-output":
				// fit canvas
				let width = +Self.els.cvs.parent().prop("offsetWidth"),
					height = +Self.els.cvs.parent().prop("offsetHeight");
				Self.els.cvs.attr({ width, height });
				break;
			case "toggle-analyser":
				isOn = event.el.parent().hasClass("on");
				event.el.parent().toggleClass("on", isOn);
				break;
		}
	},
	draw(data) {
		if (!this._playing) return;
		this.rafId = requestAnimationFrame(() => this.draw());
		console.log(data);
	}
}
