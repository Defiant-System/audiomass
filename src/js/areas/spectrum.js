
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
			case "audio-pause":
			case "audio-stop":
				console.log(event);
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
	}
}
