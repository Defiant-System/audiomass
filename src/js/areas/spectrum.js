
// imaudio.spectrum

{
	init() {
		// fast references
		this.els = {
			cvs: window.find(`.dock .box[data-area="spectrum"] canvas`),
		};
	},
	dispatch(event) {
		let APP = imaudio,
			Self = APP.spectrum,
			isOn,
			el;
		switch (event.type) {
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
