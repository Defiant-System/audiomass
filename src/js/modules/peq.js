
let seed = 1000;
let line_arr = new Array(seed);

let db = { max: 35 };
let freq = { max: 20000 };
let jump = freq.max / seed >> 0;


let Peq = {
	_entries: [],
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

		// Self.Add({ id: 1, type: "peaking", on: true, freq: 1000, gain: 30, q: 5 });
		// Self.Add({ id: 2, type: "peaking", on: true, freq: 8000, gain: -30, q: 5 });
	},
	Get(id) {
		return this._entries.find(entry => entry.id === id);
	},
	Add(entry) {
		this._entries.push(entry);
		// loop entries
		this._entries.map(entry => this.Compute(entry));
		// draw line
		this.Render();
	},
	Remove(entry) {

	},
	Render() {
		let Self = this,
			ctx = Self._lineCtx,
			cw = Self._width,
			ch = Self._height,
			chh = ch / 2,
			t2 = seed / 2,
			t3 = seed / 4;

		for (let o=0; o<Self._entries.length; ++o) {
			let curr = Self._entries[o];
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

		ctx.clearRect(0, 0, cw, ch);
		ctx.beginPath();
		ctx.moveTo(0, chh - (line_arr[0] * (chh / db.max)));

		for (let i=0; i<t3; i+=1) {
			let x = (i * 2) * (cw / seed);
			let y = chh - (line_arr[i] * (chh / db.max));
			ctx.lineTo(x, y);
		}

		for (let i=t3, h=0; i<seed; i+=3, h+=2) {
			let x = (t2 + h) * (cw / seed);
			let y = chh - (line_arr[i] * (chh / db.max));
			ctx.lineTo (x, y);
		}
		ctx.stroke ();
	},
	Compute(entry) {
		let ease = t => t*t*t*t*t,
			ease_out = t => t*t*t*t,
			edge = {},
			start,
			end,
			rounding = freq.max * (2 / entry.q),
			hr = rounding / jump >> 0;

		if (!entry._arr) entry._arr = [];
		for (let i=0; i<seed; ++i) {
			entry._arr[i] = 0;
		}

		switch (entry.type) {
			case "peaking":
				edge.left = entry.freq - (rounding / 2);
				edge.right = entry.freq + (rounding / 2);
				start = edge.left  / jump >> 0;
				end = edge.right / jump >> 0;
				
				for (let i=start, j=0; i<end; ++i) {
					if (i * jump < entry.freq) {
						++j;
						entry._arr[i] += ease(j / (hr / 2)) * entry.gain;
					} else {
						--j;
						entry._arr[i] += ease(j / (hr / 2)) * entry.gain;
					}
				}
				break;
			case "highpass":
				edge.left = entry.freq - rounding;
				start = edge.left  / jump >> 0;
				end = entry.freq / jump >> 0;

				for (let i = 0; i<start; ++i) {
					entry._arr[i] = -db.max;
				}
				// todo improve this!!!
				for (let i=start, j=hr; i<end; ++i) {
					--j;
					entry._arr[i] -= ease_out(j / hr) * db.max;
				}
				break;
			case "lowpass":
				edge.right = entry.freq + rounding;
				start = entry.freq  / jump >> 0;
				end = edge.right  / jump >> 0;

				for (let i = end; i<seed; ++i) {
					entry._arr[i] = -db.max;
				}
				// todo improve this!!!
				for (let i=start, j=0; i<end; ++i) {
					++j;
					entry._arr[i] -= ease_out(j / hr) * db.max;
				}
				break;
		}
	}
};

