
const UI = {
	init(Spawn) {
		// fast references
		this.doc = $(document);

		// bind event handlers
		Spawn.el.on("mousedown mouseup", "[data-ui], [data-dlg]", this.dispatch);
	},
	dispatch(event) {
		let APP = imaudio,
			Self = UI,
			data,
			el;
		// console.log(event);
		switch (event.type) {
			// native events
			case "mousedown":
				el = $(event.target);
				if (el.parents("[data-dlg]").length) {
					return Self.doDialog(event);
				}
				break;
			case "mouseup":
				break;
			default:
				console.log("Unhandled event: ", event);
		}
	},
	doDialog(event) {
		let Self = UI,
			Spawn = event.spawn,
			Drag = Self.drag,
			dEl,
			el;
		// console.log(event);
		switch (event.type) {
			// native events
			case "mousedown":
				el = $(event.target);

				switch (true) {
					case el.hasClass("toggler"):
						return el.data("value") === "on"
								? el.data({ value: "off" })
								: el.data({ value: "on" });
					case el.hasClass("slider"):
						return el.parent().hasClass("field-range-h")
								? Self.doSliderH(event)
								: Self.doSliderV(event);
				}

				// prevent default behaviour
				event.preventDefault();

				let dlg = el.parents(".dialog-box"),
					content = dlg.parents("ant-window_"),
					offset = {
						y: +dlg.prop("offsetTop") - parseInt(dlg.css("margin-top"), 10) - event.clientY,
						x: +dlg.prop("offsetLeft") - parseInt(dlg.css("margin-left"), 10) - event.clientX,
					};
				Self.drag = { dlg, content, offset };

				// bind event handlers
				Self.drag.content.addClass("no-cursor");
				Self.doc.on("mousemove mouseup", Self.doDialog);
				break;
			case "mousemove":
				let top = event.clientY + Drag.offset.y,
					left = event.clientX + Drag.offset.x;
				Drag.dlg.css({ top, left });
				break;
			case "mouseup":
				// unbind event handlers
				Self.drag.content.removeClass("no-cursor");
				Self.doc.off("mousemove mouseup", Self.doDialog);
				break;

			// custom events
			case "dlg-open":
				dEl = $(`.dialog-box[data-dlg="${event.name}"]`);
				// auto forward open event
				Dialogs[event.name]({ ...event, dEl });
				// prevent mouse from triggering mouseover
				Spawn.find("content").addClass("dialog-showing");
				// open dialog
				dEl.cssSequence("opening", "animationend", el =>
					el.addClass("showing").removeClass("opening"));
				break;
			case "dlg-close":
				// close dialog
				event.el.parents(".dialog-box")
					.cssSequence("closing", "animationend", el => {
						// prevent mouse from triggering mouseover
						Spawn.find("content").removeClass("dialog-showing");
						// reset element
						el.removeClass("showing closing");
					});
				break;
			// common events for all dialogs
			case "dlg-open-common":
				// fast references for knob twist event
				Dialogs.data = {};
				break;
			case "dlg-ok-common":
				// close dialog
				Dialogs[event.name]({ ...event, type: "dlg-close" });
				break;
			case "dlg-cancel-common":
				// close dialog
				Dialogs[event.name]({ ...event, type: "dlg-close" });
				break;
			case "dlg-preview-common":
				Dialogs.preview = event.el.data("value") === "on";
				break;
			case "dlg-close-common":
				if (event.el && event.el.hasClass("icon-dlg-close")) {
					// Dialogs[event.name]({ type: "dlg-reset", noEmit: 0 });
					Self.doDialog({ type: "dlg-undo-filter" });
				}
				Self.doDialog({ ...event, type: "dlg-close" });
				break;
		}
	},
	doSliderH(event) {
		let Self = UI,
			Spawn = event.spawn,
			Drag = Self.drag;
		// console.log(event);
		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// prepare info about drag
				let el = $(event.target).addClass("active"),
					dEl = el.parents(".dialog-box"),
					iEl = el.parents(".field-range-h:first").find("input"),
					handle = el.find(".handle"),
					content = el.parents("content"),
					dlg = {
						dEl,
						func: Dialogs[dEl.data("dlg")],
						type: iEl.data("change"),
					},
					val = {
						min: +iEl.data("min"),
						max: +iEl.data("max"),
						suffix: iEl.data("suffix") || "",
						step: +iEl.data("step") || 1,
						decimals: iEl.data("decimals") || 0,
						value: +iEl.val(),
					},
					offset = {
						y: +handle.prop("offsetTop") - event.clientY,
						x: +handle.prop("offsetLeft") - event.clientX,
					},
					minX = 2,
					limit = {
						minX,
						maxX: +el.prop("offsetWidth") - (minX * 2),
						minaX: +el.prop("offsetWidth") - minX,
					},
					_lerp = Math.lerp,
					_min = Math.min,
					_max = Math.max;

				// pre-knob twist event
				dlg.func({ ...dlg, type: `before:${dlg.type}`, value: +el.data("value") });
				// save details
				Self.drag = { el, dEl, iEl, handle, content, val, dlg, offset, limit, _lerp, _min, _max };
				// hide mouse
				Self.drag.content.addClass("cover hideMouse");
				// bind event handlers
				Self.doc.on("mousemove mouseup", Self.doSliderH);
				break;
			case "mousemove":
				let left = Drag._max(Drag._min(event.clientX + Drag.offset.x, Drag.limit.maxX), Drag.limit.minX),
					perc = (left - Drag.limit.minX) / (Drag.limit.maxX - Drag.limit.minX),
					value = Drag._lerp(Drag.val.min, Drag.val.max, perc).toFixed(Drag.val.decimals);
				Drag.handle.css({ left });
				// input field value
				Drag.iEl.val(value + Drag.val.suffix);
				// forward event
				Drag.dlg.func({ ...Drag.dlg, value });
				break;
			case "mouseup":
				// reset slider element
				Drag.el.removeClass("active");
				// unhide mouse
				Drag.content.removeClass("cover hideMouse");
				// unbind event handlers
				Self.doc.off("mousemove mouseup", Self.doSliderH);
				break;
		}
	},
	doSliderV(event) {
		let Self = UI,
			Spawn = event.spawn,
			Drag = Self.drag;
		// console.log(event);
		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				break;
			case "mousemove":
				break;
			case "mouseup":
				break;
		}
	},
	doDialogKnobValue(event) {
		
	},
	doDialogKnob(event) {
		
	},
	doKnob(event) {
		
	}
};
