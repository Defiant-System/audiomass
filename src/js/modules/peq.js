
let Peq = (() => {
	
	// Paragraphic Equalizer
	let Peq = {
		init(dEl, analyzer) {
			let Self = this,
				el = dEl.find(`.peq-cvs .media-analyzer`),
				width = el.prop("offsetWidth"),
				height = el.prop("offsetHeight"),
				file = Dialogs._file,
				context = analyzer.audioCtx;

			// prepare for faster calculations
			Self._data = {
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
		connect(file, loop) {
			let Self = this,
				buffer = AudioUtils.CopyBufferSegment({ file }),
				source = Self._data.context.createBufferSource();

			// preprare source buffer
			source.buffer = buffer;
			source.loop = loop;
			// no filter initially
			source.connect(Self._data.context.destination);
			// connect analyzer animation
			Self._data.analyzer.connectInput(source);

			// save reference to source
			Self._data.source = source;

			return { source };
		},
		disconnect() {
			console.log( "disconnect" );
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
	};

	return Peq;
})();

