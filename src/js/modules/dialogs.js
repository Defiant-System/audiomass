
const Dialogs = {
	_active: false,
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
		 * threshold   Min: -100.0    Max: 0.0
		 * knee        Min: 0.0       Max: 40.0
		 * ratio       Min: 1.0       Max: 20.0
		 * attack      Min: 0.0       Max: 1.0
		 * release     Min: 0.0       Max: 1.0
		 */
		let APP = imaudio,
			Self = Dialogs;
		switch (event.type) {
			case "set-threshold":
			case "set-knee":
			case "set-ratio":
			case "set-attack":
			case "set-release":
				break;

			// standard dialog events
			case "dlg-ok":
			case "dlg-open":
			case "dlg-reset":
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
			case "remove-row":
			case "toggle-row":
			case "set-type":
			case "set-gain":
			case "set-freq":
			case "set-q":
				break;
			// standard dialog events
			case "dlg-ok":
			case "dlg-open":
			case "dlg-reset":
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
			case "set-hz32":
			case "set-hz64":
			case "set-hz125":
			case "set-hz250":
			case "set-hz500":
			case "set-hz1K":
			case "set-hz2K":
			case "set-hz4K":
			case "set-hz8K":
			case "set-hz16K":
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
		 * 32 Hz     Min: -25 dB     Max: 25 dB
		 * 44 Hz     Min: -25 dB     Max: 25 dB
		 * 63 Hz     Min: -25 dB     Max: 25 dB
		 * 88 Hz     Min: -25 dB     Max: 25 dB
		 * 125 Hz    Min: -25 dB     Max: 25 dB
		 * 180 Hz    Min: -25 dB     Max: 25 dB
		 * 250 Hz    Min: -25 dB     Max: 25 dB
		 * 335 Hz    Min: -25 dB     Max: 25 dB
		 * 500 Hz    Min: -25 dB     Max: 25 dB
		 * 710 Hz    Min: -25 dB     Max: 25 dB
		 * 1 KHz     Min: -25 dB     Max: 25 dB
		 * 4 KHz     Min: -25 dB     Max: 25 dB
		 * 2 KHz     Min: -25 dB     Max: 25 dB
		 * 8 KHz     Min: -25 dB     Max: 25 dB
		 * 4 KHz     Min: -25 dB     Max: 25 dB
		 * 6 KHz     Min: -25 dB     Max: 25 dB
		 * 8 KHz     Min: -25 dB     Max: 25 dB
		 * 3 KHz     Min: -25 dB     Max: 25 dB
		 * 22 KHz    Min: -25 dB     Max: 25 dB
		 */
		let APP = imaudio,
			Self = Dialogs;
		switch (event.type) {
			case "hz32":
			case "hz44":
			case "hz63":
			case "hz88":
			case "hz125":
			case "hz180":
			case "hz250":
			case "hz335":
			case "hz500":
			case "hz710":
			case "hz1K":
			case "hz4K":
			case "hz2K":
			case "hz8K":
			case "hz4K":
			case "hz6K":
			case "hz8K":
			case "hz3K":
			case "hz22K":
				console.log( event.type, event.value );
				break;
			// standard dialog events
			case "dlg-ok":
			case "dlg-open":
			case "dlg-reset":
			case "dlg-preview":
			case "dlg-close":
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgGraphicEq20" });
				break;
		}
	},
	dlgHardLimiter(event) {
		/*
		 * limit-to      min: 10    max: 100
		 * ratio         min: 0     max: 100
		 * look-ahead    min: 1     max: 500
		 */
		let APP = imaudio,
			Self = Dialogs;
		switch (event.type) {
			case "set-limit-to":
			case "set-ratio":
			case "set-look-ahead":
				break;
			// standard dialog events
			case "dlg-ok":
			case "dlg-open":
			case "dlg-reset":
			case "dlg-preview":
			case "dlg-close":
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgHardLimiter" });
				break;
		}
	},
	dlgDelay(event) {
		/*
		 * threshold   min: 0    max: 5
		 * ratio       min: 0    max: 1
		 * wet         min: 0    max: 1
		 */
		let APP = imaudio,
			Self = Dialogs;
		switch (event.type) {
			case "set-threshold":
			case "set-ratio":
			case "set-wet":
				break;
			// standard dialog events
			case "dlg-ok":
			case "dlg-open":
			case "dlg-reset":
			case "dlg-preview":
			case "dlg-close":
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgDelay" });
				break;
		}
	},
	dlgDistortion(event) {
		/*
		 * gain -  Min: 0   Max: 2
		 */
		let APP = imaudio,
			Self = Dialogs;
		switch (event.type) {
			// "fast events"
			case "set-gain":
				break;
			// standard dialog events
			case "dlg-ok":
			case "dlg-open":
			case "dlg-reset":
			case "dlg-preview":
			case "dlg-close":
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgDistortion" });
				break;
		}
	},
	dlgReverb(event) {
		/*
		 * threshold   min: 0    max: 5
		 * ratio       min: 0    max: 1
		 * wet         min: 0    max: 1
		 */
		let APP = imaudio,
			Self = Dialogs;
		switch (event.type) {
			case "threshold":
			case "ratio":
			case "wet":
				break;
			// standard dialog events
			case "dlg-ok":
			case "dlg-open":
			case "dlg-reset":
			case "dlg-preview":
			case "dlg-close":
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgReverb" });
				break;
		}
	},
	dlgSpeed(event) {
		/*
		 * gain -  Min: 0.2   Max: 2
		 */
		let APP = imaudio,
			Self = Dialogs;
		switch (event.type) {
			// "fast events"
			case "set-rate":
				break;
			// standard dialog events
			case "dlg-ok":
			case "dlg-open":
			case "dlg-reset":
			case "dlg-preview":
			case "dlg-close":
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgSpeed" });
				break;
		}
	},
};
