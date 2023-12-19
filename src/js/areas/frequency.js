
// imaudio.spawn.frequency

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
	init(Spawn) {
		// subscribe to events
		Spawn.on("audio-play", this.dispatch);
		Spawn.on("audio-pause", this.dispatch);
		Spawn.on("audio-stop", this.dispatch);
	},
	dispatch(event) {
		let APP = imaudio,
			Spawn = event.spawn,
			Self = APP.spawn.frequency,
			isOn,
			el;
		switch (event.type) {
			// subscribed events
			case "audio-play":
				Spawn.data.analyzer.start();
				break;
			case "audio-pause":
			case "audio-stop":
				Spawn.data.analyzer.stop();
				break;
			// custom events
			case "disconnect-file-output":
				Spawn.data.analyzer.disconnectInput(event.file._ws.media, true);
				break;
			case "connect-file-output":
				if (!Spawn.data.analyzer) {
					// insert motion analyzer
					Spawn.data.el = Spawn.el.find(`.box[data-area="frequency"] .body`);
					Spawn.data.analyzer = new AudioMotionAnalyzer(Spawn.data.el[0], Self.options);
				}

				// update element dimensions
				let width = +Spawn.data.el.prop("offsetWidth"),
					height = +Spawn.data.el.prop("offsetHeight") - 2;
				Spawn.data.analyzer.setCanvasSize(width, height);
				// connect file output
				Spawn.data.analyzer.connectInput(event.file._ws.media);
				break;
			case "toggle-analyser":
				isOn = event.el.parent().hasClass("on");
				event.el.parent().toggleClass("on", isOn);
				break;
		}
	}
}
