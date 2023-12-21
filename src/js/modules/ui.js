
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
				}

				// prevent default behaviour
				event.preventDefault();

				let dlg = el.parents(".dialog-box"),
					content = dlg.parents("ant-window_"),
					offset = {
						y: +dlg.prop("offsetTop") - event.clientY,
						x: +dlg.prop("offsetLeft") - event.clientX,
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
	doDialogKnobValue(event) {
		
	},
	doDialogKnob(event) {
		
	},
	doKnob(event) {
		
	}
};
