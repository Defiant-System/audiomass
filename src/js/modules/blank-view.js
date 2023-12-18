
// imaudio.blankView

{
	init(spawn) {
		
	},
	dispatch(event) {
		let APP = imaudio,
			Spawn = event.spawn,
			Self = APP.blankView,
			file,
			name,
			value,
			el;
		console.log(event);
		switch (event.type) {
			case "open-filesystem":
				break;
		}
	}
}