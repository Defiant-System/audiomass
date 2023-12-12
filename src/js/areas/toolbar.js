
// audiomass.toolbar

{
	init() {

	},
	dispatch(event) {
		let APP = audiomass,
			Self = APP.toolbar,
			isOn,
			el;
		// console.log( event );
		switch (event.type) {
			// custom events
			case "toggle-sidebar":
				isOn = event.value || APP.els.content.hasClass("show-sidebar");
				APP.els.content.toggleClass("show-sidebar", isOn);
				return !isOn;
			case "toggle-dock":
				isOn = event.value || APP.els.content.hasClass("show-dock");
				APP.els.content.toggleClass("show-dock", isOn);
				return !isOn;
		}
	}
}
