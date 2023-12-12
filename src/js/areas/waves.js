
// audiomass.waves

{
	init() {

	},
	dispatch(event) {
		let APP = audiomass,
			Self = APP.waves,
			el;
		switch (event.type) {
			// custom events
			case "reset-zoom":
				console.log(event);
				break;
		}
	}
}
