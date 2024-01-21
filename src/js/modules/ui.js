
const UI = {
	init(Spawn) {
		// fast references
		this.doc = $(document);

		// bind event handlers
		Spawn.el.on("mousedown", "[data-dlg]", this.dispatch);
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
				pEl.find(".peq-cvs .hover, .peq-list .hover").removeClass("hover");
				break;
			default:
				console.log("Unhandled event: ", event);
		}
	},
	doDialog(event) {
		let APP = imaudio,
			Self = UI,
			Spawn = event.spawn,
			Drag = Self.drag,
			file,
			context,
			filter,
			xNode,
			xAttr,
			data,
			name,
			value,
			dEl,
			row,
			el;
		// console.log(event);
		switch (event.type) {
			// native events
			case "mousedown":
				el = $(event.target);

				switch (true) {
					case el.hasClass("toggle-presets"):
						if (el.hasClass("icon-padlock")) {
							el.parents(".presets").addClass("unlocked");
							el.removeClass("icon-padlock").addClass("icon-padlock-unlocked");
						} else {
							el.parents(".presets").removeClass("unlocked");
							el.removeClass("icon-padlock-unlocked").addClass("icon-padlock");
						}
						break;
					case el.hasClass("icon-audio-on"):
						el.removeClass("icon-audio-on").addClass("icon-audio-off");
						// get list row
						row = el.parents(".list-row");
						// collect info
						dEl = el.parents(".dialog-box");
						// update dot in UI
						dEl.find(`.peq-dot[data-id="${row.data("id")}"]`).addClass("off");
						// data object
						data = {
							dEl,
							row,
							type: "toggle-row",
							func: Dialogs[dEl.data("dlg")],
							value: false,
						};
						// proxy values
						data.func(data);
						break;
					case el.hasClass("icon-audio-off"):
						el.removeClass("icon-audio-off").addClass("icon-audio-on");
						// get list row
						row = el.parents(".list-row");
						// collect info
						dEl = el.parents(".dialog-box");
						// update dot in UI
						dEl.find(`.peq-dot[data-id="${row.data("id")}"]`).removeClass("off");
						// data object
						data = {
							dEl,
							row,
							type: "toggle-row",
							func: Dialogs[dEl.data("dlg")],
							value: true,
						};
						// proxy values
						data.func(data);
						break;
					case el.hasClass("icon-trashcan"):
						// get list row
						row = el.parents(".list-row");
						// collect info
						dEl = el.parents(".dialog-box"),
						data = {
							dEl,
							row,
							type: "remove-row",
							func: Dialogs[dEl.data("dlg")],
						};
						// proxy values
						data.func(data);
						// remove dot from DOM
						dEl.find(`.peq-dot[data-id="${row.data("id")}"]`).remove();
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
						dEl = el.parents(".dialog-box");
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
					case el.hasClass("preset"):
						// collect info
						dEl = el.parents(".dialog-box");
						name = dEl.data("dlg");
						return Self.renderPreset({ dEl, name, id: el.data("id") });
					case el.hasClass("toggler"):
						return el.data("value") === "on"
								? el.data({ value: "off" })
								: el.data({ value: "on" });
					case el.hasClass("slider"):
						return el.parent().hasClass("field-range-h")
								? Self.doSliderH(event)
								: Self.doSliderV(event);
					case el.hasClass("show-knob-bubble"):
						return Self.doBubbleKnob(event);
					case el.hasClass("knob"):
					case el.hasClass("pan-knob"):
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
				file = Spawn.data.tabs._active.file;
				// stop, if playing
				if (file._ws.isPlaying()) file._ws.stop();

				dEl = $(`.dialog-box[data-dlg="${event.name}"]`);
				// save reference to file
				Dialogs._file = file;
				// save reference to axctive dialog
				Dialogs._active = dEl;

				// add preset buttons, if any
				if (dEl.find(`.buttons .presets`).length && !dEl.find(`.buttons .presets ul li`).length) {
					let xPath = `//Presets/Dialog[@name="${event.name}"]/Slot`,
						li = [];
					window.bluePrint.selectNodes(xPath).map(x => {
						let attr = [`data-id="${x.getAttribute("id")}"`];
						if (x.getAttribute("title")) attr.push(`title="${x.getAttribute("title")}"`);
						li.push(`<li class="preset" ${attr.join(" ")}>${x.getAttribute("id")}</li>`);
					});
					// add to presets list
					dEl.find(`.buttons .presets ul`).html(li.join(""));
				}
				// reset preview button
				dEl.find(`.toggler`).data({ value: "off" });
				// disable spawn toolbar
				APP.spawn.toolbar.dispatch({ type: "disable-tools", exclude: ["display"], spawn: Spawn });
				// auto reset dialog before show
				Self.doDialog({ ...event, dEl, type: "dlg-init-fields" });
				// auto forward open event
				Dialogs[event.name]({ ...event, dEl, file });
				// prevent mouse from triggering mouseover
				Spawn.find("content").addClass("dialog-showing");

				// closes dialog if clicked outside dialog box
				let func = e => {
					if (e.target === Spawn.find("content")[0]) {
						UI.doDialog({ type: "dlg-close", spawn: Spawn });
						Spawn.find("content").off("mousedown", func);
					}
				};
				Spawn.find("content").on("mousedown", func);

				// open dialog
				dEl.cssSequence("opening", "animationend", el =>
					el.addClass("showing").removeClass("opening"));
				break;
			case "dlg-close":
				dEl = event.el ? event.el.parents(".dialog-box") : Dialogs._active;
				// disable spawn toolbar
				APP.spawn.toolbar.dispatch({ type: "enable-tools", spawn: Spawn });
				// close dialog
				dEl.cssSequence("closing", "animationend", el => {
						// prevent mouse from triggering mouseover
						Spawn.find("content").removeClass("dialog-showing");
						// reset element
						el.removeClass("showing closing");
						// close dialog
						Peq.destroy();
						// reset references
						if (Dialogs._source) Dialogs._source.stop();
						delete Dialogs._source;
						delete Dialogs._filters;
						delete Dialogs._active;
					});
				break;
			case "dlg-init-fields":
				// fast references for UI element events + values
				Dialogs.data = {};
				// init values
				dEl = event.dEl || $(`.dialog-box[data-dlg="${event.name}"]`);
				// iterate fields
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
							// initial field value
							Dialogs.data[iEl.attr("name")] = val.value;
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
							// initial field value
							Dialogs.data[iEl.attr("name")] = val.value;
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
							uEl = el.find(`.knob, .pan-knob`);

							value = Math.round(Math.lerp(val.ui.min, val.ui.max, val.ui.perc));
							if (uEl.hasClass("pan-knob")) value -= 50;
							uEl.data({ value });
							// initial field value
							Dialogs.data[iEl.attr("name")] = val.value;
							break;
					}
				});
				break;
			// common events for all dialogs
			case "dlg-open-common":
				// anything to do?
				break;
			case "dlg-apply-common":
				// create offline context and connect to filter
				file = Dialogs._file;
				context = AudioUtils.CreateOfflineFXContext({ file });
				filter = Dialogs[event.name]({ type: "create-filter-rack", context });
				// pipe it all
				if (filter.rack) filter.rack.connect(context.destination);
				filter.source.start();
				// apply filter for UI
				AudioUtils.ApplyFilter({ file, filter, offlineCtx: context, spawn: event.spawn, sidebar: APP.spawn.sidebar });
				// close dialog
				Dialogs[event.name]({ ...event, type: "dlg-close" });
				break;
			case "dlg-reset-common":
				dEl = event.dEl || $(`.dialog-box[data-dlg="${event.name}"]`);
				// loop all input fields
				xAttr = dEl.find(`.field-range-h, .field-range, .field-box`).map(elem => {
					let iEl = $(elem).find("input");
					return `${iEl.attr("name")}="${iEl.data("default")}"`;
				});
				xNode = $.nodeFromString(`<i ${xAttr.join(" ")}/>`);
				
				Self.renderPreset({ ...event, dEl, xNode });
				break;
			case "dlg-preview-common":
				if (Dialogs._source) {
					Dialogs._source.stop();
					delete Dialogs._filters;
					delete Dialogs._source;
				} else {
					file = Dialogs._file;
					context = file.node.context;
					filter = Dialogs[event.name]({ type: "create-filter-rack", context });
					// connect rack to "speakers"
					if (filter.rack) filter.rack.connect(file.node.context.destination);
					// save reference to filters
					Dialogs._filters = filter.filters;
					// save reference to buffer source
					Dialogs._source = filter.source;
					// start source
					Dialogs._source.start();
				}
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
	renderPreset(event) {
		let Self = UI,
			data = {},
			str = [],
			xPath = `//Presets/Dialog[@name="${event.name}"]/Slot[@id="${event.id}"]`,
			xNode = event.xNode || window.bluePrint.selectSingleNode(xPath);
		// set dialog in "transition" state
		event.dEl.cssSequence("switch-trans", "transitionend", el => {
			el.removeClass("switch-trans").css({ "--aStep": "" });
			if (el.hasClass("dialog-box")) {
				Dialogs[event.name]({ type: "dlg-apply-preset" });
			}
		});
		// console.log(event);
		switch (event.name) {
			case "dlgDistortion":
			case "dlgNormalize":
			case "dlgSilence":
			case "dlgSpeed":
			case "dlgGain":
				// slider dimensions
				data.min = 2;
				data.max = +event.dEl.find(".field-range-h .slider").prop("offsetWidth") - 3;
				// iterate attributes
				[...xNode.attributes]
					.filter(a => event.dEl.find(`.value input[name="${a.name}"]`).length)
					.map(a => {
						let iEl = event.dEl.find(`.value input[name="${a.name}"]`),
							handle = iEl.parents(".field-range-h").find(".slider .handle"),
							step = +iEl.data("step") || 1,
							val = {
								min: +iEl.data("min"),
								max: +iEl.data("max"),
								suffix: iEl.data("suffix") || "",
								decimals: (step.toString().split(".")[1] || "").length,
							},
							value = Math.invLerp(val.min, val.max, a.value),
							left = Math.lerp(data.min, data.max, value);
						// input field
						iEl.val(a.value + val.suffix);
						// handle element
						handle.css({ left });
					});
				break;
			case "dlgGraphicEq":
			case "dlgGraphicEq20":
				// slider dimensions
				data.min = 2;
				data.max = +event.dEl.find(".field-range .slider").prop("offsetHeight") - 3;
				// iterate attributes
				[...xNode.attributes]
					.filter(a => event.dEl.find(`.value input[name="${a.name}"]`).length)
					.map(a => {
						let iEl = event.dEl.find(`.value input[name="${a.name}"]`),
							handle = iEl.parents(".field-range").find(".slider .handle"),
							step = +iEl.data("step") || 1,
							val = {
								min: +iEl.data("min"),
								max: +iEl.data("max"),
								suffix: iEl.data("suffix") || "",
								decimals: (step.toString().split(".")[1] || "").length,
							},
							value = Math.invLerp(val.min, val.max, a.value),
							top = Math.lerp(data.max, data.min, value);
						// input field
						iEl.val(a.value + val.suffix);
						// handle element
						handle.css({ top });

					});
				break;
			case "dlgHardLimiter":
			case "dlgDelay":
			case "dlgReverb":
			case "dlgCompressor":
			case "dlgVocoder":
				// translates to animation index
				let knobIndex = i => (i % 2 === 1 ? i-1 : i) >> 1;
				// iterate attributes
				[...xNode.attributes]
					.filter(a => event.dEl.find(`.value input[name="${a.name}"]`).length)
					.map(a => {
						let iEl = event.dEl.find(`.value input[name="${a.name}"]`),
							knobEl = iEl.parents(".field-box").find(".knob"),
							step = +iEl.data("step") || 1,
							val = {
								min: +iEl.data("min"),
								max: +iEl.data("max"),
								suffix: iEl.data("suffix") || "",
								decimals: (step.toString().split(".")[1] || "").length,
							},
							value = Math.round(Math.invLerp(val.min, val.max, a.value) * 100),
							aStep = Math.abs(knobIndex(+knobEl.data("value")) - knobIndex(value));

						// input field
						iEl.val((+a.value).toFixed(val.decimals) + val.suffix);
						// knob value
						knobEl.data({ value }).css({ "--aStep": aStep });
					});
				break;
			case "dlgParagraphicEq":
				// peq rectangle area
				data.minY = 2;
				data.minX = 2;
				data.maxY = 199;
				data.maxX = 445;
				data.scale = (Self.logScale.max - Self.logScale.min) / (data.maxX - data.minX),
				// iterate dots
				xNode.selectNodes("./*").map(x => {
					let id = +x.getAttribute("id"),
						on = x.getAttribute("state") != "off",
						type = x.getAttribute("type"),
						gain = +x.getAttribute("gain"),
						frequency = +x.getAttribute("freq"),
						Q = +x.getAttribute("q"),
						top = Math.lerp(data.maxY, data.minY, (gain + 50) / 100),
						left = (Math.log(frequency) - Self.logScale.min) / data.scale + data.minX;
					str.push(`<div class="peq-dot ${on ? "" : "off"}" data-hover="peq-dot" data-id="${id}" style="top: ${top}px; left: ${left}px;"></div>`);
					// add entry to Peq line-canvas
					Peq.add({ id, type, on, frequency, gain, Q });
				});
				event.dEl.find(`.peq-dot-wrapper`).html(str.join(""));
				// render table list
				window.render({
					match: xPath,
					template: "peq-list",
					target: event.dEl.find(`.peq-list .list-body`),
				});
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
				dlg.func({ ...dlg, iEl, val, type: `before:${dlg.type}`, value: +el.data("value") });
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
				Drag.dlg.func({ ...Drag.dlg, iEl: Drag.iEl, val: Drag.val, value: +value });
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
					value = Drag._lerp(Drag.val.max, Drag.val.min, perc).toFixed(Drag.val.decimals);
				Drag.handle.css({ top });
				// input field value
				Drag.iEl.val(value + Drag.val.suffix);
				// forward event
				Drag.dlg.func({ ...Drag.dlg, iEl: Drag.iEl, val: Drag.val, value: +value });
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
					isPanKnob = el.hasClass("pan-knob"),
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
					isPanKnob,
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
				if (Drag.isPanKnob) {
					let value = Drag._min(Drag._max((Drag.clientY - event.clientY) + Drag.value, -50), 50);
					Drag.el.data({ value });
					// input field value
					value = Drag._lerp(Drag.val.min, Drag.val.max, (value+50)/100).toFixed(Drag.val.decimals);
					Drag.iEl.val(value + Drag.val.suffix);
					// forward event
					Drag.dlg.func({ ...Drag.dlg, iEl: Drag.iEl, val: Drag.val, value: +value });
				} else {
					let value = Drag._min(Drag._max((Drag.clientY - event.clientY) + Drag.value, 0), 100);
					Drag.el.data({ value });
					// input field value
					value = Drag._lerp(Drag.val.min, Drag.val.max, value / 100).toFixed(Drag.val.decimals);
					Drag.iEl.val(value + Drag.val.suffix);
					// forward event
					Drag.dlg.func({ ...Drag.dlg, iEl: Drag.iEl, val: Drag.val, value: +value });
				}
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
					row = srcEl.parents(".list-row"),
					dEl = srcEl.parents(".dialog-box"),
					dot = dEl.find(`.peq-dot[data-id="${row.data("id")}"]`).addClass("active"),
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
					limit = {
						min: 0,
						max: 100,
						dot: {
							minY: 2,
							minX: 2,
							maxY: +dEl.find(".peq-dot-wrapper").prop("offsetHeight") - 2,
							maxX: +dEl.find(".peq-dot-wrapper").prop("offsetWidth") - 2,
						},
						log: Self.logScale
					},
					top = fieldOffset.top - 60,
					left = fieldOffset.left + (fieldOffset.width >> 1) - 25,
					id = +row.data("id"),
					func = Peq.update.bind(Peq),
					_lerp = Math.lerp,
					_exp = Math.exp,
					_round = Math.round,
					_min = Math.min,
					_max = Math.max,
					knobEl = dEl.find(".bubble-knob .knob");

				switch (val.name) {
					case "gain":
						knobEl.addClass("pan-knob");
						limit.min = -50
						limit.max = 50;
						val.knob = Math.round(Math.invLerp(val.min, val.max, val.value) * 100) - 50;
						val.knobOffset = val.knob + event.clientY;
						break;
					case "freq":
						limit.log.scale = (limit.log.max-limit.log.min) / (limit.dot.maxX-limit.dot.minX);
						val.dotX = (Math.log(val.value)-limit.log.min) / limit.log.scale + limit.dot.minX;
						val.knob = Math.invLerp(limit.dot.minX, limit.dot.maxX, val.dotX) * 100 | 1;
						val.knobOffset = val.knob + event.clientY;
						break;
					case "q":
						val.knob = Math.invLerp(val.min, val.max, val.value) * 100 | 1;
						val.knobOffset = val.knob + event.clientY;
						break;
				}
				// twist before showing knob
				knobEl.data({ value: val.knob });

				// pre-knob twist event
				dlg.func({ ...dlg, val, type: `before:${dlg.type}`, value: val.value });
				// "freeze" list row ui
				row.addClass("active");
				// show field knob bubble
				dEl.find(".bubble-knob").removeClass("hidden").css({ top, left });

				// save details
				Self.drag = { srcEl, row, dot, dEl, id, func, knobEl, content, dlg, val, limit, _lerp, _exp, _round, _min, _max };
				// hide mouse
				Self.drag.content.addClass("cover hideMouse");
				// bind event handlers
				Self.doc.on("mousemove mouseup", Self.doBubbleKnob);
				break;
			case "mousemove":
				let value = Drag._max(Drag._min(Drag.val.knobOffset - event.clientY, Drag.limit.max), Drag.limit.min),
					data = {},
					perc;
				// knob UI update
				Drag.knobEl.data({ value });
				
				// dot UI update
				switch (Drag.val.name) {
					case "gain":
						perc = (value - Drag.limit.min) / (Drag.limit.max - Drag.limit.min);
						data.top = Drag._lerp(Drag.limit.dot.maxY, Drag.limit.dot.minY, perc);
						Drag.dot.css(data);
						// table cell update
						value = Drag._lerp(Drag.val.min, Drag.val.max, perc).toFixed(Drag.val.decimals);
						Drag.srcEl.html(value + Drag.val.suffix);
						// forward value
						Drag.func(Drag.id, { gain: value });
						break;
					case "freq":
						perc = value / 100;
						data.left = Drag._lerp(Drag.limit.dot.minX, Drag.limit.dot.maxX, perc);
						Drag.dot.css(data);
						// table cell update
						data.val = Drag._exp(Drag.limit.log.min + Drag.limit.log.scale * (data.left - Drag.limit.dot.minX));
						data.val = Drag._round(data.val);
						Drag.srcEl.html(data.val + Drag.val.suffix);
						// forward value
						Drag.func(Drag.id, { frequency: data.val });
						break;
					case "q":
						perc = (value - Drag.limit.min) / (Drag.limit.max - Drag.limit.min)
						// this affects dot curvature
						// table cell update
						value = Drag._lerp(Drag.val.min, Drag.val.max, perc).toFixed(Drag.val.decimals);
						Drag.srcEl.html(value + Drag.val.suffix);
						// forward value
						Drag.func(Drag.id, { Q: value });
						break;
				}
				// forward event
				Drag.dlg.func({ ...Drag.dlg, val: Drag.val, value: +value });
				break;
			case "mouseup":
				// reset dot element
				Drag.srcEl.removeClass("active");
				Drag.row.removeClass("active");
				Drag.dot.removeClass("active");
				// reset bubble
				Drag.dEl.find(".bubble-knob").addClass("hidden");
				Drag.knobEl.removeClass("pan-knob").addClass("knob");
				// unhide mouse
				Drag.content.removeClass("cover hideMouse");
				// unbind event handlers
				Self.doc.off("mousemove mouseup", Self.doBubbleKnob);
		}
	},
	logScale: {
		min: Math.log(10),
		max: Math.log(24000)
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
				
				let el = $(event.target),
					dEl = el.parents(".dialog-box");
				if (el.hasClass("peq-dot-wrapper")) {
					let id = Date.now(),
						top = event.offsetY - 2,
						left = event.offsetX - 2,
						type = left > (+el.prop("offsetWidth") >> 1) ? "highpass" : "lowpass",
						gain = 0,
						frequency = 1000,
						Q = 5,
						node = $.nodeFromString(`<i id="${id}" type="${type}" gain="${gain}" freq="${frequency}" q="${Q}" state="on"/>`);
					// add dot to "canvas"
					el = el.prepend(`<div class="peq-dot" data-hover="peq-dot" data-id="${id}" style="top: ${top}px; left: ${left}px;"></div>`);
					// render new list row
					window.render({
						match: "*",
						data: node,
						template: "peq-list-row",
						prepend: dEl.find(`.peq-list .list-body`),
					});
					// return console.log(event);
					Peq.add({ id, on: true, type, frequency, gain, Q });
				}
				// make dot active
				el.addClass("active");
				// prepare info about drag
				let id = +el.data("id"),
					content = dEl.parents("content"),
					row = dEl.find(`.list-row[data-id="${el.data("id")}"]`).addClass("active"),
					yiEl = row.find(`span[data-name="gain"]`),
					xiEl = row.find(`span[data-name="freq"]`),
					val = {
						yiEl,
						xiEl,
						yMin: +yiEl.data("min"),
						yMax: +yiEl.data("max"),
						ySuffix: yiEl.data("suffix"),
						xMin: +xiEl.data("min"),
						xMax: +xiEl.data("max"),
						xSuffix: xiEl.data("suffix"),
					},
					log = Self.logScale,
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
					func = Peq.update.bind(Peq),
					_exp = Math.exp,
					_min = Math.min,
					_max = Math.max,
					_lerp = Math.lerp,
					_round = Math.round;

				val.scale = (log.max-log.min) / (limit.maxX-limit.minX);

				// save details
				Self.drag = { el, id, row, val, log, content, offset, limit, func, _min, _max, _lerp, _round, _exp };
				// hide mouse
				Self.drag.content.addClass("cover hideMouse");
				// bind event handlers
				Self.doc.on("mousemove mouseup", Self.doPeqDot);
				break;
			case "mousemove":
				let top = Drag._max(Drag._min(event.clientY + Drag.offset.y, Drag.limit.maxY), Drag.limit.minY),
					left = Drag._max(Drag._min(event.clientX + Drag.offset.x, Drag.limit.maxX), Drag.limit.minX),
					data = {},
					perc;
				Drag.el.css({ top, left });
				// calculate gain
				perc = (top - Drag.limit.minY) / (Drag.limit.maxY - Drag.limit.minY);
				data.gain = Drag._round(Drag._lerp(Drag.val.yMax, Drag.val.yMin, perc));
				Drag.val.yiEl.html(data.gain + Drag.val.ySuffix);
				// calculate frequency
				data.frequency = Drag._round(Drag._exp(Drag.log.min + Drag.val.scale * (left - Drag.limit.minX)));
				Drag.val.xiEl.html(data.frequency + Drag.val.xSuffix);
				// forward value
				Drag.func(Drag.id, data);
				break;
			case "mouseup":
				// reset dot element
				Drag.el.removeClass("active");
				// reset list row
				Drag.row.removeClass("active");
				// unhide mouse
				Drag.content.removeClass("cover hideMouse");
				// unbind event handlers
				Self.doc.off("mousemove mouseup", Self.doPeqDot);
		}
	}
};
