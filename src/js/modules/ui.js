
const UI = {
	init() {
		// fast references
		this.doc = $(document);
		this.content = window.find("content");

		// bind event handlers
		this.content.on("mousedown mouseup", "[data-ui], [data-dlg]", this.dispatch);
	},
	dispatch(event) {
		let APP = imaudio,
			Self = UI,
			data,
			value,
			menu,
			min,
			max,
			rect,
			top,
			left,
			el;
		// console.log(event);
		switch (event.type) {
			case "click":
				el = $(this.parentNode);
				value = el.data("options");
				if (!value || el.hasClass("disabled")) return;

				// save reference to source element
				Self.srcEl = el.addClass("opened");
				// render menubox
				Self.menu = window.render({
						template: value,
						append: Self.content,
						match: el.data("match") || false,
					});

				// position menubox
				rect = this.getBoundingClientRect();
				top = rect.top - window.top + rect.height + 9;
				left = rect.left - window.left + (rect.width >> 1) - (Self.menu[0].offsetWidth >> 1);
				Self.menu.css({ top, left });

				// set inital value - by associated event handler
				Self[Self.menu.data("ui")]({ type: "set-initial-value", el });

				// prevent mouse from triggering mouseover
				APP.els.content.addClass("cover");
				// event handler checks for clicks outside inline-menubox
				Self.doc.on("mousedown", Self.dispatch);
				break;
			case "mousedown":
				el = $(event.target);
				if (el.parents(".inline-menubox").length) {
					if (this === document) return;
					// forward event to fitting handler
					Self[this.dataset.ui](event);
					// handles event differently for brush menu box
					if (this.dataset.ui === "doBrushTips") return;
				} else if (el.parents("ul.opt-group").length) {
					// event handling option-group
					if (el.hasClass("active")) return;
					el.parent().find(".active").removeClass("active");
					el.addClass("active");
				} else if (el.parents("[data-dlg]").length) {
					return Self.doDialog(event);
				} else {
					// clean up
					Self.menu.remove();
				}
				if (Self.srcEl) Self.srcEl.removeClass("opened");
				// uncover app UI
				APP.els.content.removeClass("cover");
				// unbind event handler
				Self.doc.off("mousedown", Self.dispatch);
				break;
			case "mouseup":
				el = $(event.target);
				if (Self.srcEl && !el.parents(".inline-menubox").length) {
					//reset origin element
					Self.srcEl.removeClass("opened");
					Self.srcEl = false;
				}
				break;
			default:
				// forward route events
				data = event.el.parents("[data-ui]").data("ui");
				Self[data](event);
		}
	},
	doDialogKnobValue(event) {
		let Self = UI,
			Drag = Self.drag;
		// console.log(event);
		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				// prepare drag object
				let el = $(event.target),
					dEl = el.parents(".dialog-box"),
					dId = dEl.data("dlg"),
					bEl = dEl.find(".hover-knob"),
					kEl = bEl.find(".knob"),
					min = +el.data("min"),
					max = +el.data("max"),
					suffix = el.data("suffix") || "",
					type = el.data("change"),
					val = Math.round(((parseInt(el.text() || "0", 10) - min) / (max - min)) * 100),
					offset = val + event.clientY,
					_min = Math.min,
					_max = Math.max;
				Self.drag = { el, bEl, kEl, dId, min, max, type, offset, suffix, _min, _max };

				// reset knob
				kEl.data({ value: val });
				// show knob-bubble
				bEl.removeClass("hidden")
					.css({
						top: el.prop("offsetTop"),
						left: el.prop("offsetLeft"),
					});

				// bind event handlers
				Self.content.addClass("no-dlg-cursor");
				Self.doc.on("mousemove mouseup", Self.doDialogKnobValue);
				break;
			case "mousemove":
				// update knob
				let value = Drag._max(Drag._min(Drag.offset - event.clientY, 100), 0);
				Drag.kEl.data({ value });
				// update origin element value
				value = Math.round((value / 100) * (Drag.max - Drag.min));
				let str = value > 0 ? `${value}${Drag.suffix}` : "";
				Drag.el.html(str);

				if (Drag.value === value) return;
				Drag.value = value;
				
				// proxy changed value
				Dialogs[Drag.dId]({ type: Drag.type, value: Drag.value });
				break;
			case "mouseup":
				// proxy changed value
				Dialogs[Drag.dId]({ type: `after:${Drag.type}`, value: Drag.value });
				// hide knob-bubble
				Drag.bEl.cssSequence("close", "animationend", el => el.addClass("hidden").removeClass("close"));
				// unbind event handlers
				Self.content.removeClass("no-dlg-cursor");
				Self.doc.off("mousemove mouseup", Self.doDialogKnobValue);
				break;
		}
	},
	doDialog(event) {
		let Self = UI,
			Drag = Self.drag,
			file,
			layer,
			pixels,
			copy,
			value,
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
					case el.hasClass("color-box"):
						return Self.doColorBox(event);
					case el.hasClass("hue-bar"):
						return Self.doHueBar(event);
					case el.data("ux") === "dlg-knob":
						return Self.doDialogKnobValue(event);
					case el.data("ux") === "dlg-bars":
						return Self.doDialogBars(event);
					case el.hasClass("knob"):
					case el.hasClass("pan-knob"):
						return Self.doDialogKnob(event);
				}

				// prevent default behaviour
				event.preventDefault();

				let dlg = el.parents(".dialog-box"),
					offset = {
						y: +dlg.prop("offsetTop") - event.clientY,
						x: +dlg.prop("offsetLeft") - event.clientX,
					};
				Self.drag = { dlg, offset };

				// bind event handlers
				Self.content.addClass("no-cursor");
				Self.doc.on("mousemove mouseup", Self.doDialog);
				break;
			case "mousemove":
				let top = event.clientY + Drag.offset.y,
					left = event.clientX + Drag.offset.x;
				Drag.dlg.css({ top, left });
				break;
			case "mouseup":
				// unbind event handlers
				Self.content.removeClass("no-cursor");
				Self.doc.off("mousemove mouseup", Self.doDialog);
				break;

			// custom events
			case "dlg-open":
				dEl = $(`.dialog-box[data-dlg="${event.name}"]`);
				// make sure knobs in dialog is synced with its sibling input element
				Self.doDialogKnob({ type: "set-initial-value", dEl });
				// auto forward open event
				Dialogs[event.name]({ ...event, dEl });
				// prevent mouse from triggering mouseover
				Self.content.addClass("cover");
				// open dialog
				dEl.cssSequence("opening", "animationend", el => {
						el.addClass("showing").removeClass("opening");
					});
				break;
			case "dlg-close":
				// close dialog
				event.el.parents(".dialog-box")
					.cssSequence("closing", "animationend", el => {
						// prevent mouse from triggering mouseover
						Self.content.removeClass("cover");
						// reset element
						el.removeClass("showing closing");
					});
				break;
			case "dlg-undo-filter":
				// revert layer to initial state
				pixels = Dialogs.data.pixels;
				copy = new ImageData(new Uint8ClampedArray(pixels.data), pixels.width, pixels.height);
				// update layer
				Dialogs.data.layer.putImageData({ data: copy, noEmit: 1 });
				break;

			case "dlg-open-common":
				file = Projector.file;
				layer = file.activeLayer;
				pixels = layer.ctx.getImageData(0, 0, layer.width, layer.height);
				value = {};
				// collect default values
				event.dEl.find(`.field-row input`).map(elem => {
					let iEl = $(elem);
					value[iEl.attr("name")] = parseInt(iEl.val(), 10);
				});
				// fast references for knob twist event
				Dialogs.data = { file, layer, pixels, value };
				// save reference to event
				Dialogs.srcEvent = event;
				// read preview toggler state
				Dialogs.preview = event.dEl.find(`.toggler[data-click="dlg-preview"]`).data("value") === "on";
				// apply -- In case Preview is turned off, apply filter on image
				Dialogs[event.name]({ type: "apply-filter-data" });
				break;
			case "dlg-ok-common":
				// collect values
				Dialogs.srcEvent.dEl.find(`.field-row input`).map(elem => {
					let iEl = $(elem);
					Dialogs.data.value[iEl.attr("name")] = parseInt(iEl.val(), 10);
				});
				// apply -- In case Preview is turned off, apply filter on image
				Dialogs[event.name]({ type: "apply-filter-data", noEmit: 0 });
				// update layer thumbnail
				Dialogs.data.layer.updateThumbnail();
				// notify event origin of the results
				if (Dialogs.srcEvent.callback) Dialogs.srcEvent.callback(Dialogs.data.value);
				// close dialog
				Dialogs[event.name]({ ...event, type: "dlg-close" });
				break;
			case "dlg-reset-common":
				// reset input fields
				Dialogs.srcEvent.dEl.find(`.field-row input`).map(elem => {
					let iEl = $(elem),
						row = iEl.parents(".field-row"),
						suffix = iEl.data("suffix") || "";
					iEl.val(iEl.data("default") + suffix);
					if (row.hasClass("has-knob")) {
						// reset knobs
						let val = +iEl.data("default"),
							min = +iEl.data("min"),
							max = +iEl.data("max"),
							value = Math.round((val-min) / (max-min) * 100);
						row.find(".knob, .pan-knob").data({ value });
					}
					// default values for dialog
					Dialogs.data.value[iEl.attr("name")] = parseInt(iEl.val(), 10);
				});
				// apply filter with default values
				Dialogs[event.name]({ type: "apply-filter-data", noEmit: (event.noEmit !== undefined) ? event.noEmit : 1 });
				break;
			case "dlg-preview-common":
				Dialogs.preview = event.el.data("value") === "on";
				if (Dialogs.preview) {
					// apply -- In case Preview is turned off, apply filter on image
					Dialogs[event.name]({ type: "apply-filter-data", noEmit: 1 });
				} else {
					Self.doDialog({ type: "dlg-undo-filter" });
				}
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
	doDialogKnob(event) {
		let Self = UI,
			Drag = Self.drag;
		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// prepare drag event object
				let el = $(event.target),
					pEl = el.parent().addClass("hover"),
					dEl = pEl.parents(".dialog-box"),
					dlg = {
						dEl,
						func: Dialogs[dEl.data("dlg")],
						type: el.data("change"),
					},
					src = pEl.find(".value input"),
					isPanKnob = el.hasClass("pan-knob");
				// references needed for drag'n drop
				Self.drag = {
					el,
					src,
					dlg,
					isPanKnob,
					suffix: src.data("suffix") || "",
					min: isPanKnob ? -100 : 0,
					max: isPanKnob ? 100 : 100,
					value: +el.data("value"),
					clientY: event.clientY,
					val: {
						min: isPanKnob ? 0 : +src.data("min"),
						max: +src.data("max") - +src.data("min"),
						step: +src.data("step") || 1,
						value: +src.val(),
					},
					_min: Math.min,
					_max: Math.max,
					_round: Math.round,
				};
				// pre-knob twist event
				dlg.func({ ...dlg, type: `before:${dlg.type}`, value: +el.data("value") });
				// bind event handlers
				Self.content.addClass("no-dlg-cursor");
				Self.doc.on("mousemove mouseup", Self.doDialogKnob);
				break;
			case "mousemove":
				let value = (Drag.clientY - event.clientY) + (Drag.isPanKnob ? Drag.value * 2 : Drag.value);
				value = Drag._min(Drag._max(value, Drag.min), Drag.max);
				if (Drag.isPanKnob) value = value >> 1;
				Drag.el.data({ value });

				let i = Drag.val.step.toString().split(".")[1],
					val = +((Drag.val.max * (value / 100)) + Drag.val.min).toFixed(i ? i.length : 0);
				Drag.src.val(val + Drag.suffix);
				// forward event
				Drag.dlg.func({ ...Drag.dlg, value: val });
				// save value
				Drag.newValue = val;
				break;
			case "mouseup":
				// post-knob twist event
				Drag.dlg.func({ ...Drag.dlg, type: `after:${Drag.dlg.type}`, value: Drag.newValue });
				// reset parent element
				Drag.el.parent().removeClass("hover");
				// unbind event handlers
				Self.content.removeClass("no-dlg-cursor");
				Self.doc.off("mousemove mouseup", Self.doDialogKnob);
				break;
			// custom events
			case "set-initial-value":
				// initial value of knob
				event.dEl.find(".field-row.has-knob").map(rEl => {
					let row = $(rEl),
						iEl = row.find("input"),
						min = +iEl.data("min"),
						max = +iEl.data("max"),
						val = parseInt(iEl.val(), 10),
						kEl = row.find(".knob");
					if (kEl.length) {
						kEl.data({ value: Math.round((val-min) / (max-min) * 100) });
					} else {
						kEl = row.find(".pan-knob");
						kEl.data({ value: "0" });
					}
				});
				break;
		}
	},
	doKnob(event) {
		let APP = imaudio,
			Self = UI,
			Drag = Self.drag,
			_round = Math.round,
			_min = Math.min,
			_max = Math.max,
			data,
			value,
			el;
		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				
				el = $(event.target);
				value = +el.data("value");

				Self.drag = {
					el,
					value,
					src: Self.srcEl.find(".value"),
					suffix: Self.srcEl.data("suffix") || "",
					min: +Self.srcEl.data("min"),
					max: +Self.srcEl.data("max"),
					clientY: event.clientY,
					clientX: event.clientX,
				};
				// bind event handlers
				Self.content.addClass("no-cursor");
				Self.doc.on("mousemove mouseup", Self.doKnob);
				break;
			case "mousemove":
				value = (Drag.clientY - event.clientY) + Drag.value;
				value = _min(_max(value, 0), 100);
				Drag.el.data({ value });

				Drag.newValue = Drag.min + _round((value / 100) * (Drag.max - Drag.min));
				Drag.src.html(Drag.newValue + Drag.suffix);
				break;
			case "mouseup":
				data = {
					type: Self.srcEl.data("change"),
					el: Self.srcEl,
					old: Drag.value,
					value: Drag.newValue,
				};
				if (data.old === data.value) return;
				// dispatch event to be forwarded
				if (data.type) APP.dispatch(data);

				// unbind event handlers
				Self.content.removeClass("no-cursor");
				Self.doc.off("mousemove mouseup", Self.doKnob);
				// clean up
				Self.srcEl = false;
				Self.menu.remove();
				break;
			// custom events
			case "set-initial-value":
				// initial value of knob
				value = parseInt(event.el.find(".value").text(), 10);
				Self.menu.find(".knob").data({ value });
				break;
		}
	}
};
