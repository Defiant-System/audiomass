
let ranges = [];

ranges.push({
	freq: 1000,
	gain: 30,
	q: 5,
	type: "peaking",
	_on: true,
});

ranges.push({
	freq: 8000,
	gain: -30,
	q: 5,
	type: "peaking",
	_on: true,
});




let seed = 1000;
let line_arr = new Array(seed);

let db = { max: 35 };
let freq = { max: 20000 };
let jump = freq.max / seed >> 0;


let Peq = {
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
		Self._lineCtx.strokeStyle = "#d0f6ff";
		Self._lineCtx.lineWidth = 1;

		// loop entries
		ranges.map(range => Self.range_compute_arr(range));

		// initial draw line
		Self.render();
	},
	render() {
		let Self = this,
			ctx = Self._lineCtx,
			cw = Self._width,
			ch = Self._height,
			ch_half = ch / 2,
			t2 = seed / 2,
			t3 = seed / 4;

		for (let o=0; o<ranges.length; ++o) {
			let curr = ranges[o];
			if (o === 0) {
				for (let i=0; i<seed; ++i) {
					line_arr[i] = curr._arr[i];
				}
			} else {
				for (let i=0; i<seed; ++i) {
					line_arr[i] += curr._arr[i];
				}
			}
		}

		ctx.clearRect(0, 0, 1e3, 1e3);
		ctx.beginPath();
		ctx.moveTo(0, ch_half - (line_arr[0] * (ch_half / db.max)));

		for (let i=0; i<t3; i+=1) {
			let x = (i * 2) * (cw / seed);
			let y = ch_half - (line_arr[i] * (ch_half / db.max));
			ctx.lineTo(x, y);
		}

		for (let i=t3, h=0; i<seed; i+=3, h+=2) {
			let x = (t2 + h) * (cw / seed);
			let y = ch_half - (line_arr[i] * (ch_half / db.max));
			ctx.lineTo (x, y);
		}
		ctx.stroke ();
	},
	range_compute_arr(range) {
		let ease = t => t*t*t*t*t,
			ease_out = t => t*t*t*t,
			edge = {},
			start,
			end,
			rounding = freq.max * (2 / range.q),
			hr = rounding / jump >> 0;

		if (!range._arr) range._arr = [];
		for (let i=0; i<seed; ++i) {
			range._arr[i] = 0;
		}

		switch (range.type) {
			case "peaking":
				edge.left = range.freq - (rounding / 2);
				edge.right = range.freq + (rounding / 2);
				start = edge.left  / jump >> 0;
				end = edge.right / jump >> 0;
				
				for (let i=start, j=0; i<end; ++i) {
					if (i * jump < range.freq) {
						++j;
						range._arr[i] += ease(j / (hr / 2)) * range.gain;
					} else {
						--j;
						range._arr[i] += ease(j / (hr / 2)) * range.gain;
					}
				}
				break;
			case "highpass":
				edge.left = range.freq - rounding;
				start = edge.left  / jump >> 0;
				end = range.freq / jump >> 0;

				for (let i = 0; i<start; ++i) {
					range._arr[i] = -db.max;
				}
				// todo improve this!!!
				for (let i=start, j=hr; i<end; ++i) {
					--j;
					range._arr[i] -= ease_out(j / hr) * db.max;
				}
				break;
			case "lowpass":
				edge.right = range.freq + rounding;
				start = range.freq  / jump >> 0;
				end = edge.right  / jump >> 0;

				for (let i = end; i<seed; ++i) {
					range._arr[i] = -db.max;
				}
				// todo improve this!!!
				for (let i=start, j=0; i<end; ++i) {
					++j;
					range._arr[i] -= ease_out(j / hr) * db.max;
				}
				break;
		}
	}
};


