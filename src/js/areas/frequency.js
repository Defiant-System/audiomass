
// audiomass.frequency

{
	init() {
		// fast references
		this.els = {
			el: window.find(`.box[data-area="frequency"] .body`),
		};

		let opt = {
				mode: 6,
				barSpace: .35,
				ledBars: true,
				gradient: "prism",
				bgAlpha: 0,
				overlay: true,
				// showBgColor: true,
				showPeaks: true,
				showScaleX: false,
				// trueLeds: false,
			};
		// insert motion analyzer
		this.analyzer = new AudioMotionAnalyzer(this.els.el[0], opt);
	},
	dispatch(event) {
		let APP = audiomass,
			Self = APP.frequency,
			isOn,
			el;
		switch (event.type) {
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
