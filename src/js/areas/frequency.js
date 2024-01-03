
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
		// reserve persistent reference for this object
		Spawn.data.frequency = {};
		// subscribe to events
		Spawn.on("audio-play", this.dispatch);
		Spawn.on("audio-pause", this.dispatch);
		Spawn.on("audio-stop", this.dispatch);
	},
	dispatch(event) {
		let APP = imaudio,
			Spawn = event.spawn,
			Self = APP.spawn.frequency,
			Data = Spawn.data.frequency,
			isOn,
			el;
		switch (event.type) {
			// subscribed events
			case "audio-play":
				Spawn.data.frequency.analyzer.start();
				break;
			case "audio-pause":
			case "audio-stop":
				// delayed stop - waits for all bars to go to "zero"
				setTimeout(() => Spawn.data.frequency.analyzer.stop(), 1000);
				break;
			// custom events
			case "connect-file-output":
				if (Data.analyzer) {
					Data.analyzer.disconnectInput(event.file.node, true);
				}
				if (!Data.analyzer) {
					// insert motion analyzer
					Data.el = Spawn.find(`.box[data-area="frequency"] .body`);
					Data.analyzer = new AudioMotionAnalyzer(Data.el[0], Self.options);
				}

				// update element dimensions
				let width = +Data.el.prop("offsetWidth"),
					height = +Data.el.prop("offsetHeight") - 2;
				Data.analyzer.setCanvasSize(width, height);
				// connect file output
				event.file.node = Data.analyzer.connectInput(event.file.node || event.file._ws.media);
				break;
			case "toggle-analyser":
				isOn = event.el.parent().hasClass("on");
				event.el.parent().toggleClass("on", isOn);
				break;
		}
	}
}
