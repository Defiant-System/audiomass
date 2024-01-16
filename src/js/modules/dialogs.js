
const Dialogs = {
	_active: false,
	dlgGain(event) {
		/*
		 * gain -  Min: 10%   Max: 200%
		 */
		let APP = imaudio,
			Self = Dialogs,
			file = Self._file,
			filter,
			value,
			rack;
		switch (event.type) {
			// "fast events"
			case "set-gain":
				if (Self._filters) {
					let val = event.value / 100;
					let time = Self._source.context.currentTime;
					Self._filters[0].gain.linearRampToValueAtTime(val, time);
				}
				break;
			case "create-filter-rack":
				let isPreview = event.context.constructor != OfflineAudioContext,
					buffer = AudioUtils.CopyBufferSegment({ file }),
					source = event.context.createBufferSource(),
					filters = Self._active.find(`input[name="gain"]`).map(iEl => {
						let filter = event.context.createGain();
						let suffix = iEl.getAttribute("data-suffix");
						let val = +iEl.value.slice(0, -suffix.length) / 100;
						let time = event.context.currentTime;
						filter.gain.linearRampToValueAtTime(val, time);
						return filter;
					});
				// preprare source buffer
				source.buffer = buffer;
				source.loop = isPreview;
				// create equalizer rack
				rack = filters.reduce((prev, curr) => { prev.connect(curr); return curr; }, source);
				// return stuff
				return { filters, source, rack };
			// reset buffer & filters
			case "dlg-apply-preset":
				if (Self._filters) {
					Self._active.find(`input[name="gain"]`).map(iEl => {
						let suffix = iEl.getAttribute("data-suffix");
						let val = +iEl.value.slice(0, -suffix.length) / 100;
						let time = Self._source.context.currentTime;
						Self._filters[0].gain.linearRampToValueAtTime(val, time);
					});
				}
				break;
			// standard dialog events
			case "dlg-preview":
			case "dlg-apply":
			case "dlg-open":
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
			Self = Dialogs,
			file = Self._file;
		switch (event.type) {
			// "fast events"
			case "set-normalize":
				// preview is not available
				break;
			// standard dialog events
			case "dlg-apply":
				let iEl = Self._active.find(`input[name="normalize"]`),
					suffix = iEl.data("suffix"),
					max = {
						val: +iEl.val().slice(0, -suffix.length) / 100,
						peak: 0,
					},
					context = file.node.context,
					buffer = AudioUtils.CopyBufferSegment({ file }),
					source = context.createBufferSource(),
					data = { file, spawn: event.spawn, sidebar: APP.spawn.sidebar };
				// transfer buffer
				source.buffer = buffer;
				// iterating faster first time...
				for (let i=0; i<buffer.numberOfChannels; ++i) {
					let chanData = buffer.getChannelData(i);
					for (let k=1, len=chanData.length; k<len; k=k+10) {
						let curr = Math.abs(chanData[k]);
						if (max.peak < curr) max.peak = curr;
					}
				}
				let diff = max.val / max.peak;
				for (let i=0; i<buffer.numberOfChannels; ++i) {
					let chanData = buffer.getChannelData(i);
					for (let k=0, len=chanData.length; k<len; ++k) {
						chanData[k] *= diff;
					}
				}
				// pipe it all
				source.connect(context.destination);
				// apply filter for UI
				AudioUtils.LoadDecoded(data, buffer);
				// close dialog
				Self.dlgNormalize({ ...data, type: "dlg-close" });
				break;
			case "dlg-open":
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
			Self = Dialogs,
			file = Self._file,
			filter,
			value,
			rack;
		switch (event.type) {
			case "set-threshold":
			case "set-knee":
			case "set-ratio":
			case "set-attack":
			case "set-release":
				if (Self._filters) {
					value = +event.iEl.val();
					Self._filters[0][event.iEl.attr("name")].setValueAtTime(value, Self._source.context.currentTime);
				}
				break;
			// create filter rack
			case "create-filter-rack":
				let isPreview = event.context.constructor != OfflineAudioContext,
					buffer = AudioUtils.CopyBufferSegment({ file }),
					source = event.context.createBufferSource(),
					compressor = event.context.createDynamicsCompressor(),
					filters = [compressor];
				
				Self._active.find(`input[data-change]`).map(iEl => {
					compressor[iEl.name].setValueAtTime(iEl.value, event.context.currentTime);
				});
				// preprare source buffer
				source.buffer = buffer;
				source.loop = isPreview;
				// connect compressor
				source.connect(compressor);
				// return stuff
				return { filters, source, rack: compressor };
			// reset buffer & filters
			case "dlg-apply-preset":
				if (Self._filters) {
					Self._active.find(`input[data-change]`).map(iEl => {
						Self._filters[0][iEl.name].setValueAtTime(iEl.value, Self._source.context.currentTime);
					});
				}
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
			filter,
			value,
			rack;
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
				if (Self._filters) {
					value = +event.iEl.data("fBand");
					filter = Self._filters.find(f => f.frequency.value === value);
					filter.gain.value = event.value;
				}
				break;
			// create filter rack
			case "create-filter-rack":
				let isPreview = event.context.constructor != OfflineAudioContext,
					buffer = AudioUtils.CopyBufferSegment({ file }),
					source = event.context.createBufferSource(),
					filters = Self._active.find(`input[data-fBand]`).map(iEl => {
						let suffix = iEl.getAttribute("data-suffix");
						let band = +iEl.getAttribute("data-fBand");
						let filter = event.context.createBiquadFilter();
						filter.type = iEl.getAttribute("data-fType");
						filter.gain.value = +iEl.value.slice(0, -suffix.length);
						filter.Q.value = 1; // resonance
						filter.frequency.value = band; // the cut-off frequency
						return filter;
					});
				// preprare source buffer
				source.buffer = buffer;
				source.loop = isPreview;
				// create equalizer rack
				rack = filters.reduce((prev, curr) => { prev.connect(curr); return curr; }, source);
				// return stuff
				return { filters, source, rack };
			// reset buffer & filters
			case "dlg-apply-preset":
				if (Self._filters) {
					Self._active.find(`input[data-fBand]`).map(iEl => {
						let suffix = iEl.getAttribute("data-suffix");
						let band = +iEl.getAttribute("data-fBand");
						let filter = Self._filters.find(f => f.frequency.value === band);
						filter.gain.value = +iEl.value.slice(0, -suffix.length);
					});
				}
				break;
			// standard dialog events
			case "dlg-preview":
			case "dlg-apply":
			case "dlg-open":
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
			filter,
			value,
			rack;
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
			case "create-filter-rack":
				let isPreview = event.context.constructor != OfflineAudioContext,
					buffer = AudioUtils.CopyBufferSegment({ file }),
					source = event.context.createBufferSource(),
					filters = Self._active.find(`input[data-fBand]`).map(iEl => {
						let suffix = iEl.getAttribute("data-suffix");
						let band = +iEl.getAttribute("data-fBand");
						let filter = event.context.createBiquadFilter();
						filter.type = iEl.getAttribute("data-fType");
						filter.gain.value = +iEl.value.slice(0, -suffix.length);
						filter.Q.value = 1; // resonance
						filter.frequency.value = band; // the cut-off frequency
						return filter;
					});
				// preprare source buffer
				source.buffer = buffer;
				source.loop = isPreview;
				// create equalizer rack
				rack = filters.reduce((prev, curr) => { prev.connect(curr); return curr; }, source);
				// return stuff
				return { filters, source, rack };
			// reset buffer & filters
			case "dlg-apply-preset":
				if (Self._filters) {
					Self._active.find(`input[data-fBand]`).map(iEl => {
						let suffix = iEl.getAttribute("data-suffix");
						let band = +iEl.getAttribute("data-fBand");
						let filter = Self._filters.find(f => f.frequency.value === band);
						filter.gain.value = +iEl.value.slice(0, -suffix.length);
					});
				}
				break;
			// standard dialog events
			case "dlg-preview":
			case "dlg-apply":
			case "dlg-open":
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
			Self = Dialogs,
			file = Self._file,
			context,
			filter,
			value,
			rack;
		switch (event.type) {
			case "set-limit-to":
			case "set-ratio":
			case "set-look-ahead":
				if (Self._limiter) {
					Self._limiter[event.val.name] = event.val.name === "ahead" ? event.value : event.value / 100;
					// stop current source
					Self._source.disconnect();
					Self._source.buffer = null;
					Self._source = null;
					// re-create filter
					context = file.node.context;
					filter = Self.dlgHardLimiter({ type: "create-filter-rack", context });
					// connect rack to "speakers"
					filter.rack.connect(context.destination);
					// save reference to buffer source
					Dialogs._source = filter.source;
					// start source
					Dialogs._source.start();
				}
				break;
			// create filter rack
			case "create-filter-rack":
				let isPreview = event.context.constructor != OfflineAudioContext,
					buffer = AudioUtils.CopyBufferSegment({ file }),
					source = event.context.createBufferSource(),
					val = Self._limiter,
					maxPeak = 0,
					filters = [];
				// get values if missing
				if (!val) {
					Self._limiter = val = {
						limit: parseInt(Self._active.find(`input[name="limit"]`).val(), 10) / 100,
						ratio: parseInt(Self._active.find(`input[name="ratio"]`).val(), 10) / 100,
						ahead: parseInt(Self._active.find(`input[name="ahead"]`).val(), 10),
					};
				}
				val.look = (val.ahead * buffer.sampleRate / 1e3) >> 0;
				// transfer buffer
				source.buffer = buffer;
				source.loop = isPreview;
				// process buffer
				for (let i=0, il=buffer.numberOfChannels; i<il; ++i) {
					let chanData = buffer.getChannelData(i);
					chanData.set(source.buffer.getChannelData(i));
					// iterating faster first time...
					for (let b=0, len=chanData.length; b<len; ++b) {
						for (let k=0; k<val.look; k=k+10) {
							let curr = Math.abs(chanData[b+k]);
							if (maxPeak < curr) maxPeak = curr;
						}
						let diff = val.limit / maxPeak;
						for (let k=0; k<val.look; ++k) {
							let origVal = chanData[b+k];
							let newVal = origVal * diff;
							let diffPeak = val.limit - Math.abs(newVal);
							diffPeak *= origVal < 0 ? -val.ratio : val.ratio;
							chanData[b+k] = (newVal + diffPeak);
						}
						b += val.look;
						maxPeak = 0;
					}
				}
				// rack / point to connect destination
				rack = source;
				// return stuff
				return { filters, source, rack };
			// standard dialog events
			case "dlg-preview":
			case "dlg-apply":
			case "dlg-open":
			case "dlg-reset":
			case "dlg-close":
				if (event.type === "dlg-close") delete Self._limiter;
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
			Self = Dialogs,
			file = Self._file,
			filter,
			value,
			rack;
		switch (event.type) {
			case "set-time":
				if (Self._filters) {
					value = +event.iEl.val();
					Self._filters[5].delayTime.value = value;
				}
				break;
			case "set-feedback":
				if (Self._filters) {
					value = +event.iEl.val();
					Self._filters[4].gain.value = value;
				}
				break;
			case "set-wet":
				if (Self._filters) {
					value = +event.iEl.val();
					Self._filters[2].gain.value = 1 - ((value - 0.5) * 2);
					Self._filters[3].gain.value = 1 - ((0.5 - value) * 2);
				}
				break;
			// create filter rack
			case "create-filter-rack":
				let isPreview = event.context.constructor != OfflineAudioContext,
					buffer = AudioUtils.CopyBufferSegment({ file }),
					source = event.context.createBufferSource(),
					filters = [
						event.context.createGain(), // 0 inputNode
						event.context.createGain(), // 1 outputNode
						event.context.createGain(), // 2 dryGainNode
						event.context.createGain(), // 3 wetGainNode
						event.context.createGain(), // 4 feedbackGainNode
						event.context.createDelay(5) // 5 delayNode
					];
				// filter chaning
				source.connect(filters[0]);
				filters[0].connect(filters[2]);  // line in to dry mix
				filters[2].connect(filters[1]);  // dry line out
				filters[5].connect(filters[4]);  // feedback loop
				filters[4].connect(filters[5]);
				filters[0].connect(filters[5]);  // line in to wet mix
				filters[5].connect(filters[3]);  // wet out
				filters[3].connect(filters[1]);  // wet line out
				rack = filters[1];               // connects to destination
				// preprare source buffer
				source.buffer = buffer;
				source.loop = isPreview;
				// enter values from UI controls
				Self._filters = filters;
				Self.dlgDelay({ type: "dlg-apply-preset" });

				// return stuff
				return { filters, source, rack };
			// reset buffer & filters
			case "dlg-apply-preset":
				if (Self._filters) {
					Self._active.find(`.field-box input[data-change]`).map(el => {
						let iEl = $(el),
							type = iEl.data("change");
						Self.dlgDelay({ type, iEl });
					});
				}
				break;
			// standard dialog events
			case "dlg-preview":
			case "dlg-apply":
			case "dlg-open":
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
			Self = Dialogs,
			file = Self._file,
			filter,
			value,
			rack;
		switch (event.type) {
			// "fast events"
			case "set-gain":
				// preview is not available
				break;
			// standard dialog events
			case "dlg-apply":
				let iEl = Self._active.find(`input[name="gain"]`),
					context = AudioUtils.CreateOfflineFXContext({ file }),
					waveShaper = context.createWaveShaper(),
					source = context.createBufferSource(),
					buffer = AudioUtils.CopyBufferSegment({ file }),
					data = { file, spawn: event.spawn, sidebar: APP.spawn.sidebar },
					computeDistance = val => {
						let gain = parseInt((val / 1) * 100, 10),
							samples = 44100,
							curve = new Float32Array(samples),
							deg = Math.PI / 180;
						for (let i=0; i<samples; ++i ) {
							let x = i * 2 / samples - 1;
							curve[i] = (3 + gain) * x * 20 * deg / (Math.PI + gain * Math.abs(x));
						}
						return curve;
					};
				// transfer buffer
				source.buffer = buffer;
				// wave shaper curve
				waveShaper.curve = computeDistance(+iEl.val());
				// pipe it all & render output
				source.connect(waveShaper);
				waveShaper.connect(context.destination);
				source.start();
				// apply filter for UI
				AudioUtils.ApplyFilter({ ...data, offlineCtx: context });
				// close dialog
				Self.dlgDistortion({ ...data, type: "dlg-close" });
				break;
			case "dlg-open":
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
			Self = Dialogs,
			file = Self._file,
			filter,
			value,
			rack;
		switch (event.type) {
			case "set-time":
			case "set-decay":
				if (Self._filters) {
					// prevent overload calls
					if (Self._reverb.woring) return;
					Self._reverb.woring = true;

					Self._reverb.time = event.val && event.val.name === "time" ? event.value : Self._reverb.time;
					Self._reverb.decay = event.val && event.val.name === "decay" ? event.value : Self._reverb.decay;
					
					for (let i=0, il=Self._reverb.sampleRate*Self._reverb.time; i<il; i++) {
						let p = Math.pow(1 - i / il, Self._reverb.decay);
						Self._reverb.impulseL[i] = (Math.random() * 2 - 1) * p;
						Self._reverb.impulseR[i] = (Math.random() * 2 - 1) * p;
					}
					Self._filters[1].buffer = Self._reverb.impulse;
					// reset working flag
					delete Self._reverb.woring;
				}
				break;
			case "set-wet":
				if (Self._filters) {
					value = event.value ? event.value : +Self._active.find(`input[name="wet"]`).val();
					// set defaults
					Self._filters[4].gain.value = 1 - ((value - 0.5) * 2);
					Self._filters[3].gain.value = 1 - ((0.5 - value) * 2);
				}
				break;
			// create filter rack
			case "create-filter-rack":
				let isPreview = event.context.constructor != OfflineAudioContext,
					buffer = AudioUtils.CopyBufferSegment({ file }),
					source = event.context.createBufferSource(),
					filters = [
						event.context.createGain(),      // 0 inputNode
						event.context.createConvolver(), // 1 reverbNode
						event.context.createGain(),      // 2 outputNode
						event.context.createGain(),      // 3 wetGainNode
						event.context.createGain(),      // 4 dryGainNode
					];
				// filter chaning
				source.connect(filters[0]);
				filters[0].connect(filters[1]);
				filters[1].connect(filters[3]);
				filters[0].connect(filters[4]);
				filters[4].connect(filters[2]);
				filters[3].connect(filters[2]);

				let context = event.context;
				let sampleRate = event.context.sampleRate;
				let impulse = event.context.createBuffer(2, sampleRate, sampleRate);
				let impulseL = impulse.getChannelData(0);
				let impulseR = impulse.getChannelData(1);
				let time = +Self._active.find(`input[name="time"]`).val()
				let decay = +Self._active.find(`input[name="decay"]`).val()
				Self._reverb = { context, sampleRate, impulse, impulseL, impulseR, time, decay };

				// rack / point to connect destination
				rack = filters[2];
				// preprare source buffer
				source.buffer = buffer;
				source.loop = isPreview;
				// enter values from UI controls
				Self._filters = filters;
				Self.dlgReverb({ type: "dlg-apply-preset" });

				// return stuff
				return { filters, source, rack };
			// reset buffer & filters
			case "dlg-apply-preset":
				if (Self._filters) {
					Self._active.find(`.field-box input[data-change]`).map(el => {
						let iEl = $(el),
							type = iEl.data("change");
						Self.dlgReverb({ type, iEl });
					});
				}
				break;
			// standard dialog events
			case "dlg-preview":
			case "dlg-apply":
			case "dlg-open":
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
			Self = Dialogs,
			file = Self._file,
			filter,
			value,
			rack;
		switch (event.type) {
			// "fast events"
			case "set-rate":
				if (Self._filters) {
					value = +event.iEl.val();
					Self._source.playbackRate.value = value;
				}
				break;
			// create filter rack
			case "create-filter-rack":
				// return stuff
				let isPreview = event.context.constructor != OfflineAudioContext,
					buffer = AudioUtils.CopyBufferSegment({ file }),
					source = event.context.createBufferSource(),
					rack = event.context.createGain(),
					filters = [rack];
				// filter chaning
				source.connect(rack);
				// preprare source buffer
				source.buffer = buffer;
				source.loop = isPreview;

				return { filters, source, rack };
			// reset buffer & filters
			case "dlg-apply-preset":
				if (Self._filters) {
					let iEl = Self._active.find(`input[name="rate"]`),
						type = iEl.data("change");
					Self.dlgSpeed({ type, iEl });
				}
				break;
			// standard dialog events
			case "dlg-preview":
			case "dlg-apply":
			case "dlg-open":
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
	dlgVocoder(event) {
		/*
		 * gain     - Min: 0   Max: 4.0
		 * sample   - Min: 0   Max: 2.00
		 * synth    - Min: 0   Max: 2.00
		 * noise    - Min: 0   Max: 2.00
		 * detune   - Min: -1.20   Max: 1.20
		 */
		let APP = imaudio,
			Self = Dialogs;
		switch (event.type) {
			// "fast events"
			case "set-gain":
			case "set-sample":
			case "set-synth":
			case "set-noise":
			case "set-detune":
				break;
			// standard dialog events
			case "dlg-apply":
			case "dlg-open":
			case "dlg-preview":
			case "dlg-reset":
			case "dlg-close":
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgVocoder" });
				break;
		}
	},
	dlgParagraphicEq(event) {
		/*
		 * user dynamic entries
		 */
		let APP = imaudio,
			Self = Dialogs,
			file = Self._file,
			Data = Self.peq._data;
		// console.log(event.type);
		switch (event.type) {
			case "set-gain":
			case "set-freq":
			case "set-q":
			case "toggle-row":
				break;
			case "remove-row":
				Self.peq.remove(+event.row.data("id"));
				break;
			case "set-type":
				Self.peq.update(+event.row.data("id"), { type: event.value });
				break;
			// standard dialog events
			case "dlg-preview":
				if (Data._started) {
					Data.source.stop();
					delete Data._started;
				} else {
					// start source
					Data.source.start();
					Data._started = true;
				}
				Self.preview = event.el.data("value") === "on";
				break;
			case "dlg-open":
				let options = {
						start: true,
						mode: 0,
						gradient: "steelblue",
						channelLayout: "dual-combined",
						bgAlpha: 0,
						overlay: true,
						showScaleX: false,
					};
				let el = event.dEl.find(`.peq-cvs .media-analyzer`),
					analyzer = new AudioMotionAnalyzer(el[0], options);
				// init Peq object
				Self.peq.init(event.dEl, analyzer);
				break;

			case "dlg-apply":
			case "dlg-reset":
			case "dlg-close":
				UI.doDialog({ ...event, type: `${event.type}-common`, name: "dlgParagraphicEq" });
				break;
		}
	},
	// paragraphic equalizer
	peq: {
		init(dEl, analyzer) {
			let Self = this,
				el = dEl.find(`.peq-cvs .media-analyzer`),
				width = el.prop("offsetWidth"),
				height = el.prop("offsetHeight"),
				file = Dialogs._file,
				context = analyzer.audioCtx,
				buffer = AudioUtils.CopyBufferSegment({ file }),
				source = context.createBufferSource();

			// preprare source buffer
			source.buffer = buffer;
			source.loop = true;

			// no filter initially
			source.connect(context.destination);
			// connect analyzer animation
			analyzer.connectInput(source);

			// prepare for faster calculations
			Self._data = {
				source,
				context,
				analyzer,
				filters: [],
				noctaves: 11,
				nyquist: context.sampleRate * 0.5,
				frequencyHz: new Float32Array(width),
				magResponse: new Float32Array(width),
				phaseResponse: new Float32Array(width),
			};

			// fast references
			Self._width = width;
			Self._height = height;
			// prepare canvas
			Self._cvs = el.nextAll("canvas.peq-line:first").attr({ width, height });
			Self._ctx = Self._cvs[0].getContext("2d");
			Self._ctx.strokeStyle = "#9fcef6";
			Self._ctx.lineWidth = 2;
			// render filter line
			Self.render();
		},
		add(node) {
			let Data = this._data,
				id = node.id,
				filter = Data.context.createBiquadFilter(),
				destination = Data.context.destination;
			if (Data.filters.length) destination = Data.filters[0].filter;

			filter.Q.value = node.Q;
			filter.frequency.value = node.frequency;
			filter.gain.value = node.gain;
			filter.type = node.type;

			Data.source.connect(filter);
			filter.connect(destination);

			// connect analyzer animation
			Data.analyzer.disconnectInput();
			Data.analyzer.connectInput(filter);

			Data.filters.unshift({ id, filter });
			// ui update
			this.render();
		},
		remove(id) {
			// find entry and remove
			let Data = this._data,
				index = Data.filters.findIndex(node => node.id === id),
				node = Data.filters[index],
				source = Data.source;
			// disonnect node before delete
			node.filter.disconnect();
			// remove from filters list
			Data.filters.splice(index, 1);
			// reconnect filters
			// Data.filters.reduce((prev, curr) => { prev.disconnect(); prev.connect(curr); return curr; }, source);

			if (!Data.filters.length) {
				// Data.analyzer.disconnectInput();
				// connect analyzer animation
				Data.analyzer.connectInput(source);
			}
			// ui update
			this.render();
		},
		update(id, data) {
			let node = this._data.filters.find(node => node.id === id);
			if (data.type) node.filter.type = data.type;
			else {
				for (let key in data) {
					let value = data[key];
					switch (key) {
						case "frequency": value = Math.clamp(value, 1, 17000); break;
					}
					node.filter[key].value = value;
				}
			}
			this.render();
		},
		render() {
			let Self = this,
				cw = Self._width,
				ch = Self._height,
				ch2 = ch * .5,
				dbToY = db => ch2 - (ch2 / 35) * db, // dbScale = 35
				weightedAverage = (a, b) => [a, b].reduce((acc, curr) => acc + curr * curr, 0) / (a + b),
				base = new Float32Array(cw),
				avg = [];

			let len = cw;
			while (len--) {
				// Convert to log frequency scale (octaves)
				Self._data.frequencyHz[len] = Self._data.nyquist * Math.pow(2, Self._data.noctaves * (len/cw - 1));
				// reset average array
				avg[len] = 0;
			}

			Self._data.filters.map(node => {
				node.filter.getFrequencyResponse(Self._data.frequencyHz, Self._data.magResponse, Self._data.phaseResponse);
				for (let i=0; i<cw; ++i) {
					let dbResponse = 20 * Math.log(Self._data.magResponse[i]) / Math.LN10;
					avg[i] = weightedAverage(avg[i], dbResponse);
				}
			});

			Self._ctx.clearRect(0, 0, cw, ch);
			Self._ctx.beginPath();
			for (let x=0; x<cw; ++x) {
				let y = ch2 - (ch2 / 35) * avg[x]; // dbScale = 35
				if (x == 0) Self._ctx.moveTo(x, y);
				else Self._ctx.lineTo(x, y);
			}
			Self._ctx.stroke();
		}
	}
};
