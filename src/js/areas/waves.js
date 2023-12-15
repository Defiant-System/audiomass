
// imaudio.waves

{
	init() {
		// fast references
		this.els = {
			doc: $(document),
			filesWrapper: window.find(".files-wrapper"),
			zoomH: window.find(".zoom-h"),
			zoomV: window.find(".zoom-v"),
			scrollTrack: window.find(".gutter-h .scrollbar"),
			scrollHandle: window.find(".gutter-h .scrollbar .handle"),
		};
		// bind event handlers
		this.els.zoomV.on("mousedown", this.doZoomV);
		this.els.zoomH.on("mousedown", this.doZoomH);
		this.els.scrollTrack.on("mousedown", this.doScrollbar);
	},
	dispatch(event) {
		let APP = imaudio,
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
			case "ui-sync-gutter":
				// to avoid feedback loop on scrollbar DnD
				if (!Self.drag || Self.drag.type !== "scroll") {
					let stWidth = +Self.els.scrollTrack.prop("offsetWidth"),
						vWidth = +Self.els.filesWrapper.prop("offsetWidth"),
						cWidth = event.ws.getWrapper().clientWidth || 1,
						width = parseInt(stWidth * (vWidth / cWidth), 10),
						scroll = event.ws.getScroll(),
						available = cWidth - vWidth + 2,
						left = parseInt((scroll / available) * (stWidth - width), 10) + 1;
					// sync scrollbar
					Self.els.scrollHandle.css({ width, left });
				}
				break;
		}
	},
	doZoomV(event) {
		let APP = imaudio,
			Self = APP.waves,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// cover content
				APP.els.content.addClass("cover hideMouse");
				// prepare drag info
				let track = $(event.target).addClass("active"),
					el = track.find(".handle");
				// create drag object
				Self.drag = {
					el,
					type: "zoomV",
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
				// reset drag object
				delete Self.drag;
				// reset element
				Drag.el.parent().removeClass("active");
				// cover content
				APP.els.content.removeClass("cover hideMouse");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.doZoomV);
				break;
		}
	},
	doZoomH(event) {
		let APP = imaudio,
			Self = APP.waves,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// cover content
				APP.els.content.addClass("cover hideMouse");
				// prepare drag info
				let track = $(event.target).addClass("active"),
					el = track.find(".handle"),
					ws = APP.data.tabs.active.file._ws;
				// create drag object
				Self.drag = {
					el,
					ws,
					type: "zoomH",
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
				let left = Drag.min_(Drag.max_(event.clientX - Drag.clickX, Drag.limit.min), Drag.limit.max),
					perc = (left - Drag.limit.min) / (Drag.limit.max - Drag.limit.min);
				Drag.el.css({ left });
				// update zoom
				Drag.ws.zoom(10 + (perc * 1000));
				break;
			case "mouseup":
				// reset drag object
				delete Self.drag;
				// reset element
				Drag.el.parent().removeClass("active");
				// cover content
				APP.els.content.removeClass("cover hideMouse");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.doZoomH);
				break;
		}
	},
	doScrollbar(event) {
		let APP = imaudio,
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
					el = track.find(".handle"),
					ws = APP.data.tabs.active.file._ws,
					vWidth = +Self.els.filesWrapper.prop("offsetWidth"),
					cWidth = ws.getWrapper().clientWidth - vWidth;

				// create drag object
				Self.drag = {
					el,
					ws,
					cWidth,
					type: "scroll",
					clickX: event.clientX - +el.prop("offsetLeft"),
					limit: {
						min: 1,
						max: +track.prop("offsetWidth") - +el.prop("offsetWidth") - 1,
					},
					min_: Math.min,
					max_: Math.max,
				};
				// bind event
				Self.els.doc.on("mousemove mouseup", Self.doScrollbar);
				break;
			case "mousemove":
				let left = Drag.min_(Drag.max_(event.clientX - Drag.clickX, Drag.limit.min), Drag.limit.max),
					perc = (left - Drag.limit.min) / (Drag.limit.max - Drag.limit.min);
				Drag.el.css({ left });
				// scroll / move view
				Drag.ws.renderer.scrollContainer.scrollLeft = perc * Drag.cWidth;
				break;
			case "mouseup":
				// reset drag object
				delete Self.drag;
				// cover content
				APP.els.content.removeClass("cover hideMouse");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.doScrollbar);
				break;
		}
	}
}
