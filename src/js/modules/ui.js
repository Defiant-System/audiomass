
const UI = {
	init(Spawn) {
		// fast references
		this.doc = $(document);

		// bind event handlers
		Spawn.el.on("mousedown mouseup", "[data-ui], [data-dlg]", this.dispatch);
		Spawn.el.on("mouseover mouseout", "[data-hover]", this.dispatch);
	},
	dispatch(event) {
		let APP = imaudio,
			Self = UI,
			data,
			pEl,
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
			case "mouseover":
				el = $(event.target).parents("?[data-hover]");
				pEl = el.parents(".dialog-box");
				if (el.data("hover") === "peq-dot") {
					pEl.find(`.list-row[data-id="${el.data("id")}"]`).addClass("hover");
				} else if (el.data("hover") === "peq-row") {
					pEl.find(`.peq-dot[data-id="${el.data("id")}"]`).addClass("hover");
				}
				break;
			case "mouseout":
				pEl = $(event.target).parents(".dialog-box");
				pEl.find(".hover").removeClass("hover");
				break;
			default:
				console.log("Unhandled event: ", event);
		}
	},
	doDialog(event) {
		let Self = UI,
			Spawn = event.spawn,
			Drag = Self.drag,
			data,
			value,
			dEl,
			el;
		// console.log(event);
		switch (event.type) {
			// native events
			case "mousedown":
				el = $(event.target);

				switch (true) {
					case el.hasClass("icon-audio-on"):
						el.removeClass("icon-audio-on").addClass("icon-audio-off");
						// collect info
						dEl = el.parents(".dialog-box"),
						data = {
							dEl,
							type: "toggle-row",
							row: el.parents(".list-row"),
							func: Dialogs[dEl.data("dlg")],
							value: false,
						};
						// proxy values
						data.func(data);
						break;
					case el.hasClass("icon-audio-off"):
						el.removeClass("icon-audio-off").addClass("icon-audio-on");
						// collect info
						dEl = el.parents(".dialog-box"),
						data = {
							dEl,
							type: "toggle-row",
							row: el.parents(".list-row"),
							func: Dialogs[dEl.data("dlg")],
							value: true,
						};
						// proxy values
						data.func(data);
						break;
					case el.hasClass("icon-trashcan"):
						// collect info
						dEl = el.parents(".dialog-box"),
						data = {
							dEl,
							type: "toggle-row",
							row: el.parents(".list-row"),
							func: Dialogs[dEl.data("dlg")],
						};
						// proxy values
						data.func(data);
						// remove el from DOM
						data.row.remove();
						break;
					case el.parent().hasClass("type-options"):
						// prevent bubbling
						event.stopPropagation();
						// ui update
						el.parent().find(".active").removeClass("active");
						el.addClass("active");
						// collect info
						dEl = el.parents(".dialog-box"),
						data = {
							dEl,
							row: el.parents(".list-row"),
							func: Dialogs[dEl.data("dlg")],
							type: el.parent().data("change"),
							value: el.data("arg"),
						};
						// proxy values
						data.func(data);
						return;
					case el.hasClass("toggler"):
						return el.data("value") === "on"
								? el.data({ value: "off" })
								: el.data({ value: "on" });
					case el.hasClass("slider"):
						return el.parent().hasClass("field-range-h")
								? Self.doSliderH(event)
								: Self.doSliderV(event);
					case el.hasClass("bubble-knob"):
						return Self.doBubbleKnob(event);
					case el.hasClass("peq-dot-wrapper"):
						return Self.doDialogKnob(event);
					case el.hasClass("peq-dot-wrapper"):
					case el.hasClass("peq-dot"):
						return Self.doPeqDot(event);
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
				
				dEl.find(`.field-range-h, .field-range, .field-box`).map(elem => {
					let el = $(elem),
						iEl = el.find("input"),
						val = {
							min: +iEl.data("min"),
							max: +iEl.data("max"),
							suffix: iEl.data("suffix") || "",
							step: +iEl.data("step") || 1,
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
							value = Math.lerp(val.ui.minX, val.ui.maxX, val.ui.perc);
							uEl.css({ left: value });
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
							value = Math.lerp(val.ui.minY, val.ui.maxY, val.ui.perc);
							uEl.css({ top: value });
							break;
						case el.hasClass("field-box"):
							val.ui = {
								min: 0,
								max: 100,
								decimals: (val.step.toString().split(".")[1] || "").length,
								perc: (val.value - val.min) / (val.max - val.min),
							};
							// input field value
							iEl.val(val.value.toFixed(val.ui.decimals) + val.suffix);
							// ui element update
							uEl = el.find(`.knob`);

							value = Math.round(Math.lerp(val.ui.min, val.ui.max, val.ui.perc));
							uEl.data({ value });
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
						decimals: (step.toString().split(".")[1] || "").length,
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
						decimals: (step.toString().split(".")[1] || "").length,
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
	doDialogKnob(event) {
		let Self = UI,
			Spawn = event.spawn,
			Drag = Self.drag;
		// console.log(event);
		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// prepare drag event object
				let el = $(event.target),
					iEl = el.parents(".field-box:first").find("input"),
					dEl = el.parents(".dialog-box"),
					content = el.parents("content"),
					step = +iEl.data("step") || 1,
					val = {
						name: iEl.attr("name"),
						min: +iEl.data("min"),
						max: +iEl.data("max"),
						suffix: iEl.data("suffix") || "",
						decimals: (step.toString().split(".")[1] || "").length,
						value: +parseInt(iEl.val(), 10),
						step,
					},
					dlg = {
						dEl,
						func: Dialogs[dEl.data("dlg")],
						type: iEl.data("change"),
					};
				
				// references needed for drag'n drop
				Self.drag = {
					el,
					iEl,
					val,
					dlg,
					content,
					value: +el.data("value"),
					clientY: event.clientY,
					_min: Math.min,
					_max: Math.max,
					_lerp: Math.lerp,
					_round: Math.round,
				};

				// pre-knob twist event
				dlg.func({ ...dlg, val, type: `before:${dlg.type}`, value: +el.data("value") });
				// hide mouse
				Self.drag.content.addClass("cover hideMouse");
				// bind event handlers
				Self.doc.on("mousemove mouseup", Self.doDialogKnob);
				break;
			case "mousemove":
				let value = Drag._min(Drag._max((Drag.clientY - event.clientY) + Drag.value, 0), 100);
				Drag.el.data({ value });
				// input field value
				value = Drag._lerp(Drag.val.min, Drag.val.max, value / 100).toFixed(Drag.val.decimals);
				Drag.iEl.val(value + Drag.val.suffix);
				// forward event
				Drag.dlg.func({ ...Drag.dlg, val: Drag.val, value: +value });
				break;
			case "mouseup":
				// unhide mouse
				Drag.content.removeClass("cover hideMouse");
				// unbind event handlers
				Self.doc.off("mousemove mouseup", Self.doDialogKnob);
		}
	},
	doBubbleKnob(event) {
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
				let srcEl = $(event.target).addClass("active"),
					isPan = srcEl.data("name") === "gain",
					row = srcEl.parents(".list-row"),
					dEl = srcEl.parents(".dialog-box"),
					content = dEl.parents("content"),
					fieldOffset = srcEl.offset(".peq-list"),
					step = +srcEl.data("step") || 1,
					val = {
						name: srcEl.data("name"),
						min: +srcEl.data("min"),
						max: +srcEl.data("max"),
						suffix: srcEl.data("suffix") || "",
						decimals: (step.toString().split(".")[1] || "").length,
						value: +parseInt(srcEl.text(), 10),
						step,
					},
					dlg = {
						dEl,
						func: Dialogs[dEl.data("dlg")],
						type: srcEl.data("change"),
					},
					limit = { min: 0, max: 100 },
					top = fieldOffset.top - 60,
					left = fieldOffset.left + (fieldOffset.width >> 1) - 25,
					_lerp = Math.lerp,
					_min = Math.min,
					_max = Math.max,
					knob = dEl.find(".bubble-knob .knob");

				val.knob = Math.invLerp(val.min, val.max, val.value) * 100 | 1;
				val.knobOffset = val.knob + event.clientY;

				if (isPan) {
					knob.addClass("pan-knob");
					limit = { min: -50, max: 50 };
					val.knobOffset -= 50;
					val.knob -= 50;
				}
				knob.data({ value: val.knob });

				// pre-knob twist event
				dlg.func({ ...dlg, val, type: `before:${dlg.type}`, value: val.value });
				// "freeze" list row ui
				row.addClass("active");
				// show field knob bubble
				dEl.find(".bubble-knob").removeClass("hidden").css({ top, left });

				// save details
				Self.drag = { srcEl, row, dEl, knob, content, dlg, val, limit, _lerp, _min, _max };
				// hide mouse
				Self.drag.content.addClass("cover hideMouse");
				// bind event handlers
				Self.doc.on("mousemove mouseup", Self.doBubbleKnob);
				break;
			case "mousemove":
				let value = Drag._max(Drag._min(Drag.val.knobOffset - event.clientY, Drag.limit.max), Drag.limit.min),
					perc = (value - Drag.limit.min) / (Drag.limit.max - Drag.limit.min);
				Drag.knob.data({ value });
				// knob UI update
				value = Drag._lerp(Drag.val.min, Drag.val.max, perc).toFixed(Drag.val.decimals);
				Drag.srcEl.html(value + Drag.val.suffix);
				// forward event
				Drag.dlg.func({ ...Drag.dlg, val: Drag.val, value: +value });
				break;
			case "mouseup":
				// reset dot element
				Drag.srcEl.removeClass("active");
				Drag.row.removeClass("active");
				// reset bubble
				Drag.dEl.find(".bubble-knob").addClass("hidden");
				Drag.knob.removeClass("pan-knob").addClass("knob");
				// unhide mouse
				Drag.content.removeClass("cover hideMouse");
				// unbind event handlers
				Self.doc.off("mousemove mouseup", Self.doBubbleKnob);
		}
	},
	doPeqDot(event) {
		let Self = UI,
			Spawn = event.spawn,
			Drag = Self.drag;
		// console.log(event);
		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				
				// TODO: first add dot, then fall through

				// prepare info about drag
				let el = $(event.target).addClass("active"),
					content = el.parents("content"),
					offset = {
						y: +el.prop("offsetTop") - event.clientY + 6,
						x: +el.prop("offsetLeft") - event.clientX + 6,
					},
					limit = {
						minY: 2,
						minX: 2,
						maxY: +el.parent().prop("offsetHeight") - 2,
						maxX: +el.parent().prop("offsetWidth") - 2,
					},
					_min = Math.min,
					_max = Math.max,
					_lerp = Math.lerp,
					_round = Math.round;

				// save details
				Self.drag = { el, content, offset, limit, _min, _max, _lerp, _round };
				// hide mouse
				Self.drag.content.addClass("cover hideMouse");
				// bind event handlers
				Self.doc.on("mousemove mouseup", Self.doPeqDot);
				break;
			case "mousemove":
				let top = Drag._max(Drag._min(event.clientY + Drag.offset.y, Drag.limit.maxY), Drag.limit.minY),
					left = Drag._max(Drag._min(event.clientX + Drag.offset.x, Drag.limit.maxX), Drag.limit.minX);
				Drag.el.css({ top, left });
				break;
			case "mouseup":
				// reset dot element
				Drag.el.removeClass("active");
				// unhide mouse
				Drag.content.removeClass("cover hideMouse");
				// unbind event handlers
				Self.doc.off("mousemove mouseup", Self.doPeqDot);
		}
	}
};
