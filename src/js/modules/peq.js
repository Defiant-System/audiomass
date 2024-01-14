
let Peq = {
	_filters: [],
	init(dEl) {
		let context = Dialogs._file.node.context,
			filter = context.createBiquadFilter(),
			Self = this,
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

		Self._data = {
			noctaves: 11,
			nyquist: 0.5 * context.sampleRate,
			frequencyHz: new Float32Array(width),
			magResponse: new Float32Array(width),
			phaseResponse: new Float32Array(width),
		};

		filter.Q.value = 5;
		filter.frequency.value = 2000;
		filter.gain.value = 2;
		filter.connect(context.destination);

		Self._filters.push(filter);
		Self._context = context;

		Self.Render();
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

	},
	Remove(id) {

	},
	Render() {
		let Self = this,
			filter = Self._filters[0],
			ctx = Self._lineCtx,
			cw = Self._width,
			ch = Self._height,
			pixelsPerDb = (ch >> 1) / 35, // dbScale = 35
			dbToY = db => (ch >> 1) - pixelsPerDb * db;

		ctx.clearRect(0, 0, cw, ch);
		ctx.beginPath();
		ctx.moveTo(0, 0);
		
		// console.time("plot");
		let len = cw;
		while (len--) {
			// Convert to log frequency scale (octaves)
			Self._data.frequencyHz[len] = Self._data.nyquist * Math.pow(2, Self._data.noctaves * (len/cw - 1));
		}
		filter.getFrequencyResponse(Self._data.frequencyHz, Self._data.magResponse, Self._data.phaseResponse);

		for (let x=0; x<cw; ++x) {
			let response = Self._data.magResponse[x];
			let dbResponse = 20 * Math.log(response) / Math.LN10;
			let y = dbToY(dbResponse);
			if (x == 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
		ctx.stroke();
		// console.timeEnd("plot");
	},
	Compute(entry) {

	}
};
