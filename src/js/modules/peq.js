
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

		filter.Q.value = 5;
		filter.frequency.value = 2000;
		filter.gain.value = 2;
		filter.connect(context.destination);

		Self._filters.push(filter);
		Self._context = context;

		Self.Render();
	},
	Update(id, data) {

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
			dbScale = 37,
			pixelsPerDb = (0.5 * ch) / dbScale,
			dbToY = db => (0.5 * ch) - pixelsPerDb * db;

		ctx.clearRect(0, 0, cw, ch);
		ctx.beginPath();
		ctx.moveTo(0, 0);

		let noctaves = 11;
		let frequencyHz = new Float32Array(cw);
		let magResponse = new Float32Array(cw);
		let phaseResponse = new Float32Array(cw);
		let nyquist = 0.5 * Self._context.sampleRate;
		// First get response.
		for (let i=0; i<cw; ++i) {
			// Convert to log frequency scale (octaves).
			frequencyHz[i] = nyquist * Math.pow(2.0, noctaves * (i / cw - 1.0));
		}

		filter.getFrequencyResponse(frequencyHz, magResponse, phaseResponse);

		for (let i=0; i<cw; ++i) {
			let f = magResponse[i];
			let response = magResponse[i];
			let dbResponse = 20.0 * Math.log(response) / Math.LN10;
			let x = i;
			let y = dbToY(dbResponse);
			
			if (i == 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
		ctx.stroke();
	},
	Compute(entry) {

	}
};
