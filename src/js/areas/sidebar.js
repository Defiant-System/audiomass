
// audiomass.sidebar

{
	init() {
		// fast references
		this.els = {
			doc: $(document),
			content: window.find("content"),
			volume: window.find(".volume-knob"),
		};
		// bind event handlers
		this.els.volume.on("mousedown", this.volumeMove);
	},
	dispatch(event) {
		let APP = audiomass,
			Self = APP.speaker,
			el;
		switch (event.type) {
			// custom events
			case "some-event":
				break;
		}
	},
	volumeMove(event) {
		let APP = audiomass,
			Self = APP.sidebar,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// cover content
				Self.els.content.addClass("cover hideMouse");
				// prepare drag info
				let el = $(event.target);
				// create drag object
				Self.drag = {
					el,
					clickY: parseInt(el.cssProp("--volume"), 10) + event.clientY,
					min_: Math.min,
					max_: Math.max,
				};
				// bind event
				Self.els.doc.on("mousemove mouseup", Self.volumeMove);
				break;
			case "mousemove":
				let volume = Drag.min_(Drag.max_(Drag.clickY - event.clientY, -135), 135);
				Drag.el.css({ "--volume": `${volume}deg` });
				break;
			case "mouseup":
				// cover content
				Self.els.content.removeClass("cover hideMouse");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.volumeMove);
				break;
		}
	}
}
