
const Dialogs = {
	dlgCain(event) {
		/*
		 * Brightness -  Min: -150   Max: 150
		 * Contrast -    Min: -100   Max: 100
		 */
		let APP = imaudio,
			Self = Dialogs;
		switch (event.type) {
			// "fast events"
			case "set-contrast":
				break;
			
			// slow/once events
			case "before:set-contrast":
				Self.data.filter = event.type.split("-")[1];
				break;

			// standard dialog events
			case "dlg-ok":
			case "dlg-open":
			case "dlg-cancel":
			case "dlg-preview":
			case "dlg-close":
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgCain" });
				break;
		}
	},
	dlgCompressor(event) {
		/*
		 * Brightness -  Min: -150   Max: 150
		 */
		let APP = imaudio,
			Self = Dialogs;
		switch (event.type) {
			// standard dialog events
			case "dlg-ok":
			case "dlg-open":
			case "dlg-cancel":
			case "dlg-preview":
			case "dlg-close":
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgCompressor" });
				break;
		}
	},
	dlgParagraphicEq(event) {
	},
	dlgGraphicEq(event) {
	},
	dlgGraphicEq20(event) {
	},
};
