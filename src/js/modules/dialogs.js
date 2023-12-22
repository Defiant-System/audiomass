
const Dialogs = {
	dlgGain(event) {
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
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgGain" });
				break;
		}
	},
	dlgNormalize(event) {
		/*
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
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgNormalize" });
				break;
		}
	},
	dlgCompressor(event) {
		/*
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
		/*
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
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgParagraphicEq" });
				break;
		}
	},
	dlgGraphicEq(event) {
		/*
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
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgGraphicEq" });
				break;
		}
	},
	dlgGraphicEq20(event) {
		/*
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
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgGraphicEq20" });
				break;
		}
	},
	dlgHardLimiter(event) {
		/*
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
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgHardLimiter" });
				break;
		}
	},
	dlgDelay(event) {
		/*
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
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgDelay" });
				break;
		}
	},
	dlgDistortion(event) {
		/*
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
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgDistortion" });
				break;
		}
	},
	dlgReverb(event) {
		/*
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
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgReverb" });
				break;
		}
	},
	dlgSpeed(event) {
		/*
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
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgReverb" });
				break;
		}
	},
};
