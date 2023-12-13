
// audiomass.waves

{
	init() {
		// fast references
		this.els = {
			doc: $(document),
			zoomH: window.find(".zoom-h"),
			zoomV: window.find(".zoom-v"),
			scrollbar: window.find(".gutter-h .scrollbar"),
		};
		// bind event handlers
		this.els.zoomV.on("mousedown", this.doZoomV);
		this.els.zoomH.on("mousedown", this.doZoomH);
		this.els.scrollbar.on("mousedown", this.doScrollbar);
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
			case "toggle-channel":
				event.el.toggleClass("on", event.el.hasClass("on"));
				break;
		}
	},
	doZoomV(event) {
		let APP = audiomass,
			Self = APP.waves,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// cover content
				APP.els.content.addClass("cover hideMouse");
				// prepare drag info
				let track = $(event.target),
					el = track.find(".handle");
				// create drag object
				Self.drag = {
					el,
					clickY: event.clientY - +el.prop("offsetTop"),
					limit: {
						min: 1,
						max: 55,
					},
					min_: Math.min,
					max_: Math.max,
				};
				// bind event
				Self.els.doc.on("mousemove mouseup", Self.doZoomV);
				break;
			case "mousemove":
				let top = Drag.min_(Drag.max_(event.clientY - Drag.clickY, Drag.limit.min), Drag.limit.max);
				Drag.el.css({ top });
				break;
			case "mouseup":
				// cover content
				APP.els.content.removeClass("cover hideMouse");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.doZoomV);
				break;
		}
	},
	doZoomH(event) {
		let APP = audiomass,
			Self = APP.waves,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// cover content
				APP.els.content.addClass("cover hideMouse");
				// prepare drag info
				let track = $(event.target),
					el = track.find(".handle");
				// create drag object
				Self.drag = {
					el,
					clickX: event.clientX - +el.prop("offsetLeft"),
					limit: {
						min: 1,
						max: 55,
					},
					min_: Math.min,
					max_: Math.max,
				};
				// bind event
				Self.els.doc.on("mousemove mouseup", Self.doZoomH);
				break;
			case "mousemove":
				let left = Drag.min_(Drag.max_(event.clientX - Drag.clickX, Drag.limit.min), Drag.limit.max);
				Drag.el.css({ left });
				break;
			case "mouseup":
				// cover content
				APP.els.content.removeClass("cover hideMouse");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.doZoomH);
				break;
		}
	},
	doScrollbar(event) {
		let APP = audiomass,
			Self = APP.waves,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// cover content
				APP.els.content.addClass("cover hideMouse");
				// prepare drag info
				let track = $(event.target),
					el = track.find(".handle");
				// create drag object
				Self.drag = {
					el,
					clickX: event.clientX - +el.prop("offsetLeft"),
					limit: {
						min: 1,
						max: 418,
					},
					min_: Math.min,
					max_: Math.max,
				};
				// bind event
				Self.els.doc.on("mousemove mouseup", Self.doZoomH);
				break;
			case "mousemove":
				let left = Drag.min_(Drag.max_(event.clientX - Drag.clickX, Drag.limit.min), Drag.limit.max);
				Drag.el.css({ left });
				break;
			case "mouseup":
				// cover content
				APP.els.content.removeClass("cover hideMouse");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.doZoomH);
				break;
		}
	}
}
