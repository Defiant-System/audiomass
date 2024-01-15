
let Peq = {
	_filters: [],
	init(dEl) {
		let Self = this,
			el = dEl.find(`.peq-cvs .media-analyzer`),
			width = el.prop("offsetWidth"),
			height = el.prop("offsetHeight");
		// fast references
		Self._width = width;
		Self._height = height;
		// prepare canvas
		Self._lineCvs = el.nextAll("canvas.peq-line:first").attr({ width, height });
		Self._lineCtx = Self._lineCvs[0].getContext("2d");
		Self._lineCtx.strokeStyle = "#9fcef6";
		Self._lineCtx.lineWidth = 2;

		Self._context = Dialogs._file.node.context;

		Self._data = {
			noctaves: 11,
			nyquist: 0.5 * Self._context.sampleRate,
			frequencyHz: new Float32Array(width),
			magResponse: new Float32Array(width),
			phaseResponse: new Float32Array(width),
		};

		Self.Add({ type: "highpass", frequency: 100, gain: -2, Q: 0 });
		Self.Add({ type: "lowpass", frequency: 2000, gain: 10, Q: 5 });
	},
	Update(id, data) {
		let Self = this,
			filter = Self._filters[0],
			hz = { min: 10, max: 22000 },
			v1 = Math.clamp(data.freq, hz.min, hz.max) / hz.max,
			v2 = Math.pow(2.0, Self._data.noctaves * (v1 - 1));

		filter.frequency.value = v2 * Self._data.nyquist;
		Self.Render();
	},
	Add(entry) {
		let Self = this,
			filter = Self._context.createBiquadFilter(),
			destination = Self._filters.length ? Self._filters[0] : Self._context.destination;

		filter.Q.value = entry.Q;
		filter.frequency.value = entry.frequency;
		filter.gain.value = entry.gain;
		filter.type = entry.type;

		filter.connect(destination);

		Self._filters.unshift(filter);
		Self.Render();
	},
	Remove(id) {

	},
	Compute(entry) {

	},
	Render() {
		let Self = this,
			ctx = Self._lineCtx,
			cw = Self._width,
			ch = Self._height,
			pixelsPerDb = (ch >> 1) / 35, // dbScale = 35
			dbToY = db => (ch >> 1) - pixelsPerDb * db,
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

		Self._filters.map(filter => {
			filter.getFrequencyResponse(Self._data.frequencyHz, Self._data.magResponse, Self._data.phaseResponse);
			for (let i=0; i<cw; ++i) {
				let dbResponse = 20 * Math.log(Self._data.magResponse[i]) / Math.LN10;
				avg[i] = weightedAverage(avg[i], dbResponse);
			}
		});

		ctx.clearRect(0, 0, cw, ch);
		ctx.beginPath();
		for (let x=0; x<cw; ++x) {
			let y = dbToY(avg[x]);
			if (x == 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
		ctx.stroke();
	}
};
