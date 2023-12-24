
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
				// auto reset dialog before show
				Dialogs[event.name]({ ...event, dEl, type: "dlg-reset" });
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
			case "dlg-reset-common":
				dEl = event.dEl || $(`.dialog-box[data-dlg="${event.name}"]`);
				
				dEl.find(`.field-range-h, .field-range`).map(elem => {
					let el = $(elem),
						iEl = el.find("input"),
						val = {
							min: +iEl.data("min"),
							max: +iEl.data("max"),
							suffix: iEl.data("suffix") || "",
							step: +iEl.data("step") || 1,
							decimals: iEl.data("decimals") || 0,
							value: +iEl.data("default"),
						},
						uEl;
					switch (true) {
						case el.hasClass("field-range-h"):
							// input field value
							iEl.val(val.value + val.suffix);
							// ui element update
							uEl = el.find(`.slider .handle`);
							val.ui = {
								minX: 2,
								maxX: +uEl.parent().prop("offsetWidth") - 3,
								perc: (val.value - val.min) / (val.max - val.min),
							};
							uEl.css({ left: Math.lerp(val.ui.minX, val.ui.maxX, val.ui.perc) });
							break;
						case el.hasClass("field-range"):
							// input field value
							iEl.val(val.value + val.suffix);
							// ui element update
							uEl = el.find(`.slider .handle`);
							val.ui = {
								minY: 2,
								maxY: +uEl.parent().prop("offsetHeight") - 3,
								perc: (val.value - val.min) / (val.max - val.min),
							};
							uEl.css({ top: Math.lerp(val.ui.minY, val.ui.maxY, val.ui.perc) });
							break;
					}
				});
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
					step = +iEl.data("step") || 1,
					val = {
						name: iEl.attr("name"),
						min: +iEl.data("min"),
						max: +iEl.data("max"),
						suffix: iEl.data("suffix") || "",
						decimals: step.toString().split(".")[1] || 0,
						value: +parseInt(iEl.val(), 10),
						step,
					},
					dlg = {
						dEl,
						func: Dialogs[dEl.data("dlg")],
						type: iEl.data("change"),
					},
					offset = {
						x: +handle.prop("offsetLeft") - event.clientX,
					},
					limit = {
						minX: 2,
						maxX: +el.prop("offsetWidth") - 3,
					},
					_lerp = Math.lerp,
					_min = Math.min,
					_max = Math.max;

				// pre-knob twist event
				dlg.func({ ...dlg, val, type: `before:${dlg.type}`, value: +el.data("value") });
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
				Drag.dlg.func({ ...Drag.dlg, val: Drag.val, value: +value });
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
				// prepare info about drag
				let el = $(event.target).addClass("active"),
					dEl = el.parents(".dialog-box"),
					iEl = el.parents(".field-range:first").find("input"),
					handle = el.find(".handle"),
					content = el.parents("content"),
					step = +iEl.data("step") || 1,
					val = {
						name: iEl.attr("name"),
						min: +iEl.data("min"),
						max: +iEl.data("max"),
						suffix: iEl.data("suffix") || "",
						decimals: step.toString().split(".")[1] || 0,
						value: +parseInt(iEl.val(), 10),
						step,
					},
					dlg = {
						dEl,
						func: Dialogs[dEl.data("dlg")],
						type: iEl.data("change"),
					},
					offset = {
						y: +handle.prop("offsetTop") - event.clientY,
					},
					limit = {
						minY: 2,
						maxY: +el.prop("offsetHeight") - 3,
					},
					_lerp = Math.lerp,
					_min = Math.min,
					_max = Math.max;

				// pre-knob twist event
				dlg.func({ ...dlg, val, type: `before:${dlg.type}`, value: +el.data("value") });
				// save details
				Self.drag = { el, dEl, iEl, handle, content, val, dlg, offset, limit, _lerp, _min, _max };
				// hide mouse
				Self.drag.content.addClass("cover hideMouse");
				// bind event handlers
				Self.doc.on("mousemove mouseup", Self.doSliderV);
				break;
			case "mousemove":
				let top = Drag._max(Drag._min(event.clientY + Drag.offset.y, Drag.limit.maxY), Drag.limit.minY),
					perc = (top - Drag.limit.minY) / (Drag.limit.maxY - Drag.limit.minY),
					value = Drag._lerp(Drag.val.min, Drag.val.max, perc).toFixed(Drag.val.decimals);
				Drag.handle.css({ top });
				// input field value
				Drag.iEl.val(value + Drag.val.suffix);
				// forward event
				Drag.dlg.func({ ...Drag.dlg, val: Drag.val, value: +value });
				break;
			case "mouseup":
				// reset slider element
				Drag.el.removeClass("active");
				// unhide mouse
				Drag.content.removeClass("cover hideMouse");
				// unbind event handlers
				Self.doc.off("mousemove mouseup", Self.doSliderV);
		}
	},
	doDialogKnobValue(event) {
		
	},
	doDialogKnob(event) {
		
	},
	doKnob(event) {
		
	}
};
