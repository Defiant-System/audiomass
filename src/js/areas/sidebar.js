
// imaudio.sidebar

{
	init(Spawn) {
		// fast references for this spawn
		Spawn.data.sidebar = {
			els: {
				doc: $(document),
				content: Spawn.find("content"),
				txtSelection: Spawn.find(".sidebar .txt-selection"),
				txtSelStart: Spawn.find(".sidebar .txt-sel-start"),
				txtSelEnd: Spawn.find(".sidebar .txt-sel-end"),
				txtSelDuration: Spawn.find(".sidebar .txt-sel-duration"),
				vWrapper: Spawn.find(".volume-wrapper"),
				volume: Spawn.find(".volume-knob"),
			}
		};
		// default volume knob angle
		Spawn.data.sidebar.els.volume.css({ "--angle": "-35deg" });
		Spawn.data.sidebar.els.vWrapper.find(".txt-volume h2").html(47);

		// subscribe to events
		Spawn.on("clear-range", this.dispatch);
		Spawn.on("update-range", this.dispatch);
		Spawn.on("time-update-range", this.dispatch);

		// bind event handlers
		Spawn.data.sidebar.els.volume.on("mousedown", this.volumeMove);
	},
	dispatch(event) {
		let APP = imaudio,
			Spawn = event.spawn,
			Self = APP.spawn.sidebar,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			// subscribed events
			case "clear-range":
				// hide text fields
				Spawn.data.sidebar.els.txtSelection.removeClass("show-text");
				break;
			case "update-range":
				// show text fields
				Spawn.data.sidebar.els.txtSelection.addClass("show-text");
				if (!event.detail.region) break;
			case "time-update-range":
				value = APP.spawn.toolbar.format(event.detail.region.start);
				Spawn.data.sidebar.els.txtSelStart.html(value);
				value = APP.spawn.toolbar.format(event.detail.region.end);
				Spawn.data.sidebar.els.txtSelEnd.html(value);
				value = APP.spawn.toolbar.format(event.detail.region.end - event.detail.region.start);
				Spawn.data.sidebar.els.txtSelDuration.html(value);
				break;
		}
	},
	volumeMove(event) {
		let APP = imaudio,
			Spawn = event.spawn,
			Self = APP.spawn.sidebar,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// cover content
				Spawn.el.find(Self.els.content).addClass("cover hideMouse");
				Spawn.el.find(Self.els.vWrapper).addClass("show-text");
				// prepare drag info
				let el = $(event.target),
					txt = el.parent().find(".txt-volume h2"),
					ws = APP.data.tabs.active.file._ws,
					limit = {
						min: -135,
						max: 135,
					};

				// create drag object
				Self.drag = {
					el,
					ws,
					txt,
					limit,
					clickY: parseInt(el.cssProp("--angle"), 10) + event.clientY,
					min_: Math.min,
					max_: Math.max,
				};
				// bind event
				Self.els.doc.on("mousemove mouseup", Self.volumeMove);
				break;
			case "mousemove":
				let angle = Drag.min_(Drag.max_(Drag.clickY - event.clientY, Drag.limit.min), Drag.limit.max),
					val = Math.round(((angle / Drag.limit.max) + 1) * 50);
				Drag.el.css({ "--angle": `${angle}deg` });
				// update volume knob value
				Drag.txt.html(val);
				// update wavesurfer
				Drag.ws.setVolume(val/100);
				break;
			case "mouseup":
				// cover content
				Spawn.el.find(Self.els.content).removeClass("cover hideMouse");
				Spawn.el.find(Self.els.vWrapper).removeClass("show-text");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.volumeMove);
				break;
		}
	}
}
