
const Dialogs = {
	dlgGain(event) {
		/*
		 * gain -  Min: 10%   Max: 200%
		 */
		let APP = imaudio,
			Self = Dialogs;
		switch (event.type) {
			// "fast events"
			case "set-gain":
				break;
			
			// slow/once events
			case "before:set-gain":
				break;

			// standard dialog events
			case "dlg-ok":
			case "dlg-open":
			case "dlg-reset":
			case "dlg-preview":
			case "dlg-close":
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgGain" });
				break;
		}
	},
	dlgNormalize(event) {
		/*
		 * normalize -  Min: 0%   Max: 200%
		 */
		let APP = imaudio,
			Self = Dialogs;
		switch (event.type) {
			// "fast events"
			case "set-normalize":
				break;
			
			// slow/once events
			case "before:set-normalize":
				break;

			// standard dialog events
			case "dlg-ok":
			case "dlg-open":
			case "dlg-reset":
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
		 * 32Hz     Min: -25 dB     Max: 25 dB
		 * 64 Hz    Min: -25 dB     Max: 25 dB
		 * 125 Hz   Min: -25 dB     Max: 25 dB
		 * 250 Hz   Min: -25 dB     Max: 25 dB
		 * 500 Hz   Min: -25 dB     Max: 25 dB
		 * 1 KHz    Min: -25 dB     Max: 25 dB
		 * 2 KHz    Min: -25 dB     Max: 25 dB
		 * 4 KHz    Min: -25 dB     Max: 25 dB
		 * 8 KHz    Min: -25 dB     Max: 25 dB
		 * 16 KHz   Min: -25 dB     Max: 25 dB
		 */
		let APP = imaudio,
			Self = Dialogs;
		switch (event.type) {
			// "fast events"
			case "set-peak":
				break;
			
			// slow/once events
			case "before:set-peak":
				break;

			// standard dialog events
			case "dlg-ok":
			case "dlg-open":
			case "dlg-reset":
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
