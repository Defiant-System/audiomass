
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
				nodes: [],
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
		destroy() {
			let Self = this;
			if (Self._data._started) Self._data.source.stop();
			// DOM clean up
			Dialogs._active.find(".list-body .list-row").remove();
			Dialogs._active.find(".peq-dot-wrapper .peq-dot").remove();
			// data reverences clean up
			Self._data.analyzer.destroy();
			Self._data.nodes.map(node => Self.remove(node.id));
			// started flag
			delete Self._data._started;
		},
		connect(offlineContext) {
			let Self = this,
				file = Dialogs._file,
				buffer = AudioUtils.CopyBufferSegment({ file }),
				context = offlineContext || Self._data.context,
				source = context.createBufferSource(),
				destination = context.destination,
				nodes = Self._data.nodes;

			// if offline, re-create filters
			if (offlineContext) {
				nodes = nodes.map(node => {
					let id = node.id,
						filter = context.createBiquadFilter();
					filter.Q.value = node.filter.Q.value;
					filter.frequency.value = node.filter.frequency.value;
					filter.gain.value = node.filter.gain.value;
					filter.type = node.filter.type;
					return { id, filter };
				});
			}
			// pipe / connect filter rack
			let rack = nodes.reduce((prev, curr) => { prev.connect(curr.filter); return curr.filter; }, source);
			// preprare source buffer
			source.buffer = buffer;
			source.loop = !!context;
			// connect rack to animation/destination
			rack.connect(destination);

			if (!offlineContext) {
				// connect analyzer animation
				Self._data.analyzer.disconnectInput();
				Self._data.analyzer.connectInput(rack);
			}

			// save reference to source
			Self._data.source = source;

			return { source };
		},
		disconnect() {
			let Self = this;
			Self._data.source.stop();
			Self._data.analyzer.disconnectInput();
		},
		add(node) {
			let Data = this._data,
				id = node.id,
				filter = Data.context.createBiquadFilter();

			filter.Q.value = node.Q;
			filter.frequency.value = node.frequency;
			filter.gain.value = node.gain;
			filter.type = node.type;

			Data.nodes.unshift({ id, filter });
			// ui update
			this.render();
		},
		remove(id) {
			// find entry and remove
			let Data = this._data,
				index = Data.nodes.findIndex(node => node.id === id),
				node = Data.nodes[index],
				source = Data.source;
			// remove from nodes list
			Data.nodes.splice(index, 1);
			// ui update
			this.render();
		},
		update(id, data) {
			let node = this._data.nodes.find(node => node.id === id);
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

			Self._data.nodes.map(node => {
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

