
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
			case "dlg-open":
			case "dlg-preview":
			case "dlg-apply":
			case "dlg-reset":
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
			case "dlg-open":
			case "dlg-preview":
			case "dlg-apply":
			case "dlg-reset":
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
			case "dlg-open":
			case "dlg-preview":
			case "dlg-apply":
			case "dlg-reset":
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
			case "dlg-open":
			case "dlg-preview":
			case "dlg-apply":
			case "dlg-reset":
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
			Self = Dialogs,
			file = Self._file,
			buffer,
			source,
			filter,
			value;
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
				value = +event.iEl.data("fBand");
				filter = Self._filters.find(f => f.frequency.value === value);
				filter.gain.value = event.value;
				break;
			// reset buffer & filters
			case "dlg-reset":
				buffer = AudioUtils.CopyBufferSegment({ file });
				source = file.node.context.createBufferSource();
				source.buffer = buffer;
				source.loop = true;

				let filters = Self._active.find(`input[data-fBand]`).map(iEl => {
						let band = +iEl.getAttribute("data-fBand");
						let filter = file.node.context.createBiquadFilter();
						filter.type = iEl.getAttribute("data-fType");
						filter.gain.value = 0;
						filter.Q.value = 1; // resonance
						filter.frequency.value = band; // the cut-off frequency
						return filter;
					}),
					equalizer = filters.reduce((prev, curr) => { prev.connect(curr); return curr; }, source);
				// connect equalizer to "speakers"
				equalizer.connect(file.node.context.destination);
				// save reference to filters
				Self._filters = filters;
				// save reference to buffer source
				Self._source = source;
				break;
			// standard dialog events
			case "dlg-preview":
				if (Self._source) {
					Self._source.stop();
					delete Self._source;
				} else {
					Self.dlgGraphicEq({ type: "dlg-reset" });
					Self._source.start();
				}
				break;
			case "dlg-open":
			case "dlg-apply":
			case "dlg-reset":
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
		 * 1.4 KHz   Min: -25 dB     Max: 25 dB
		 * 2 KHz     Min: -25 dB     Max: 25 dB
		 * 2.8 KHz   Min: -25 dB     Max: 25 dB
		 * 4 KHz     Min: -25 dB     Max: 25 dB
		 * 5.6 KHz   Min: -25 dB     Max: 25 dB
		 * 8 KHz     Min: -25 dB     Max: 25 dB
		 * 11.3 KHz  Min: -25 dB     Max: 25 dB
		 * 16 KHz    Min: -25 dB     Max: 25 dB
		 * 22 KHz    Min: -25 dB     Max: 25 dB
		 */
		let APP = imaudio,
			Self = Dialogs,
			file = Self._file,
			buffer,
			source,
			filter,
			value;
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
			case "hz14K":
			case "hz2K":
			case "hz28K":
			case "hz4K":
			case "hz56K":
			case "hz8K":
			case "hz113K":
			case "hz16K":
			case "hz22K":
				value = +event.iEl.data("fBand");
				filter = Self._filters.find(f => f.frequency.value === value);
				filter.gain.value = event.value;
				break;
			// reset buffer & filters
			case "dlg-reset":
				buffer = AudioUtils.CopyBufferSegment({ file });
				source = file.node.context.createBufferSource();
				source.buffer = buffer;
				source.loop = true;

				let filters = Self._active.find(`input[data-fBand]`).map(iEl => {
						let band = +iEl.getAttribute("data-fBand");
						let filter = file.node.context.createBiquadFilter();
						filter.type = iEl.getAttribute("data-fType");
						filter.gain.value = 0;
						filter.Q.value = 1; // resonance
						filter.frequency.value = band; // the cut-off frequency
						return filter;
					}),
					equalizer = filters.reduce((prev, curr) => { prev.connect(curr); return curr; }, source);
				// connect equalizer to "speakers"
				equalizer.connect(file.node.context.destination);
				// save reference to filters
				Self._filters = filters;
				// save reference to buffer source
				Self._source = source;
				break;
			// standard dialog events
			case "dlg-preview":
				if (Self._source) {
					Self._source.stop();
					delete Self._source;
				} else {
					Self.dlgGraphicEq20({ type: "dlg-reset" });
					Self._source.start();
				}
				break;
			case "dlg-open":
			case "dlg-apply":
			case "dlg-reset":
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
			case "dlg-open":
			case "dlg-preview":
			case "dlg-apply":
			case "dlg-reset":
			case "dlg-close":
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgHardLimiter" });
				break;
		}
	},
	dlgDelay(event) {
		/*
		 * time        min: 0    max: 5
		 * feedback    min: 0    max: 1
		 * wet         min: 0    max: 1
		 */
		let APP = imaudio,
			Self = Dialogs;
		switch (event.type) {
			case "set-time":
			case "set-feedback":
			case "set-wet":
				break;
			// standard dialog events
			case "dlg-open":
			case "dlg-preview":
			case "dlg-apply":
			case "dlg-reset":
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
			case "dlg-open":
			case "dlg-preview":
			case "dlg-apply":
			case "dlg-reset":
			case "dlg-close":
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgDistortion" });
				break;
		}
	},
	dlgReverb(event) {
		/*
		 * time      min: 0    max: 3
		 * decay     min: 0    max: 3
		 * wet       min: 0    max: 1
		 */
		let APP = imaudio,
			Self = Dialogs;
		switch (event.type) {
			case "set-time":
			case "set-decay":
			case "set-wet":
				break;
			// standard dialog events
			case "dlg-open":
			case "dlg-preview":
			case "dlg-apply":
			case "dlg-reset":
			case "dlg-close":
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgReverb" });
				break;
		}
	},
	dlgSpeed(event) {
		/*
		 * rate -  Min: 0.2   Max: 2
		 */
		let APP = imaudio,
			Self = Dialogs;
		switch (event.type) {
			// "fast events"
			case "set-rate":
				break;
			// standard dialog events
			case "dlg-open":
			case "dlg-preview":
			case "dlg-apply":
			case "dlg-reset":
			case "dlg-close":
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgSpeed" });
				break;
		}
	},
	dlgSilence(event) {
		/*
		 * duration -  Min: 0   Max: 10
		 */
		let APP = imaudio,
			Self = Dialogs;
		switch (event.type) {
			// "fast events"
			case "set-duration":
				Self.data.duration = event.value;
				break;
			// standard dialog events
			case "dlg-apply":
				APP.dispatch({ type: "insert-silence", spawn: event.spawn, ...Self.data });
				Self.dlgSilence({ ...event, type: "dlg-close" });
				break;
			case "dlg-open":
			case "dlg-preview":
			case "dlg-reset":
			case "dlg-close":
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgSilence" });
				break;
		}
	},
	dlgChannelInfo(event) {
		/*
		 * 
		 */
		let APP = imaudio,
			Self = Dialogs;
		switch (event.type) {
			// "fast events"
			case "set-flip-channels":
				break;
			// standard dialog events
			case "dlg-open":
			case "dlg-preview":
			case "dlg-apply":
			case "dlg-reset":
			case "dlg-close":
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgChannelInfo" });
				break;
		}
	},
};
