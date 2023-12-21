
// imaudio.spawn.waves

{
	init(Spawn) {
		// fast references for this spawn
		Spawn.data.waves = {
			els: {
				doc: $(document),
				filesWrapper: Spawn.find(".files-wrapper"),
				zoomH: Spawn.find(".zoom-h"),
				zoomV: Spawn.find(".zoom-v"),
				scrollTrack: Spawn.find(".gutter-h .scrollbar"),
				scrollHandle: Spawn.find(".gutter-h .scrollbar .handle"),
			}
		};
		// bind event handlers
		Spawn.data.waves.els.zoomV.on("mousedown", e => this.doZoomV(e, Spawn));
		Spawn.data.waves.els.zoomH.on("mousedown", e => this.doZoomH(e, Spawn));
		Spawn.data.waves.els.scrollTrack.on("mousedown", e => this.doScrollbar(e, Spawn));
	},
	dispatch(event) {
		let APP = imaudio,
			Spawn = event.spawn,
			Self = APP.spawn.waves,
			value,
			file,
			isOn,
			el;
		switch (event.type) {
			// custom events
			case "reset-zoom":
				// signal file
				Spawn.data.tabs.active.file._ws.zoom(100);
				break;
			case "toggle-channel":
				isOn = event.el.hasClass("on");
				event.el.toggleClass("on", isOn);
				// signal file
				file = Spawn.data.tabs.active.file;
				value = [event.el.hasClass("right") ? 1 : 0, !isOn ? 1 : 0];
				// if (event.el.parent().hasClass("mono")) value[0] = 0;
				file.dispatch({ type: "toggle-channel", value });
				break;
			case "ui-sync-gutter":
				// to avoid feedback loop on scrollbar DnD
				if (!Self.drag || Self.drag.type !== "scroll") {
					let stWidth = +Spawn.data.waves.els.scrollTrack.prop("offsetWidth"),
						vWidth = +Spawn.data.waves.els.filesWrapper.prop("offsetWidth"),
						cWidth = event.ws.getWrapper().clientWidth || 1,
						width = parseInt(stWidth * (vWidth / cWidth), 10) - 2,
						scroll = event.ws.getScroll(),
						available = cWidth - vWidth,
						left = parseInt((scroll / available) * (stWidth - width + 2), 10) + 1;
					// sync scrollbar
					Spawn.data.waves.els.scrollHandle.css({ width, left });
				}
				break;
		}
	},
	doZoomV(event, Spawn) {
		let APP = imaudio,
			Self = APP.spawn.waves,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
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
					content: track.parents("content"),
					doc: Spawn.data.waves.els.doc,
				};
				// cover content
				Self.drag.content.addClass("cover hideMouse");
				// bind event
				Self.drag.doc.on("mousemove mouseup", Self.doZoomV);
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
				Drag.content.removeClass("cover hideMouse");
				// unbind event
				Drag.doc.off("mousemove mouseup", Self.doZoomV);
				break;
		}
	},
	doZoomH(event, Spawn) {
		let Self = imaudio.spawn.waves,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// prepare drag info
				let track = $(event.target).addClass("active"),
					el = track.find(".handle"),
					ws = Spawn.data.tabs.active.file._ws;
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
					content: track.parents("content"),
					doc: Spawn.data.waves.els.doc,
				};
				// cover content
				Self.drag.content.addClass("cover hideMouse");
				// bind event
				Self.drag.doc.on("mousemove mouseup", Self.doZoomH);
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
				Drag.content.removeClass("cover hideMouse");
				// unbind event
				Drag.doc.off("mousemove mouseup", Self.doZoomH);
				break;
		}
	},
	doScrollbar(event, Spawn) {
		let APP = imaudio,
			Self = APP.spawn.waves,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// prepare drag info
				let track = $(event.target),
					el = track.find(".handle"),
					ws = Spawn.data.tabs.active.file._ws,
					vWidth = +Spawn.data.waves.els.filesWrapper.prop("offsetWidth"),
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
					content: track.parents("content"),
					doc: Spawn.data.waves.els.doc,
				};
				// cover content
				Self.drag.content.addClass("cover hideMouse");
				// bind event
				Self.drag.doc.on("mousemove mouseup", Self.doScrollbar);
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
				Drag.content.removeClass("cover hideMouse");
				// unbind event
				Drag.doc.off("mousemove mouseup", Self.doScrollbar);
				break;
		}
	}
}
