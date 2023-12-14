
// imaudio.frequency

{
	options: {
		start: false,
		mode: 6,
		barSpace: .35,
		ledBars: true,
		gradient: "prism",
		bgAlpha: 0,
		overlay: true,
		showPeaks: true,
		showScaleX: false,
		// showBgColor: true,
		// trueLeds: false,
	},
	init() {
		// fast references
		this.els = {
			el: window.find(`.box[data-area="frequency"] .body`),
		};

		// insert motion analyzer
		this.analyzer = new AudioMotionAnalyzer(this.els.el[0], this.options);

		// subscribe to events
		window.on("audio-play", this.dispatch);
		window.on("audio-pause", this.dispatch);
		window.on("audio-stop", this.dispatch);
	},
	dispatch(event) {
		let APP = imaudio,
			Self = APP.frequency,
			isOn,
			el;
		switch (event.type) {
			// subscribed events
			case "audio-play":
				Self.analyzer.start();
				break;
			case "audio-pause":
			case "audio-stop":
				Self.analyzer.stop();
				break;
			// custom events
			case "connect-file-output":
				if (Self.analyzer) {
					// update element dimensions
					let width = +Self.els.el.prop("offsetWidth"),
						height = +Self.els.el.prop("offsetHeight") - 2;
					Self.analyzer.setCanvasSize(width, height);
					// connect file output
					Self.analyzer.connectInput(event.file._ws.media);
				}
				break;
			case "toggle-analyser":
				isOn = event.el.parent().hasClass("on");
				event.el.parent().toggleClass("on", isOn);
				break;
		}
	}
}
