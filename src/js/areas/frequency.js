
// audiomass.frequency

{
	init() {

	},
	dispatch(event) {
		let APP = audiomass,
			Self = APP.frequency,
			isOn,
			el;
		switch (event.type) {
			// custom events
			case "toggle-analyser":
				isOn = event.el.parent().hasClass("on");
				event.el.parent().toggleClass("on", isOn);
				break;
		}
	}
}
