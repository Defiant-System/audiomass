
const Waves = {
	async init(opt) {
		let arrayBuffer = await window.fetch(opt.url),
			gArray;
		
		this.audioContext = new AudioContext();
		this.buffer = await this.audioContext.decodeAudioData(arrayBuffer);
		this.data = this.buffer.getChannelData(0);

		this.analyser = this.audioContext.createAnalyser();
		this.analyser.fftSize = 32;
		this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);

		this.source = this.audioContext.createBufferSource();
		this.source.buffer = this.buffer;
		this.source.connect(this.analyser);
		this.source.connect(this.audioContext.destination);
		// this.source.loop = true;
		// this.source.loopEnd = 5;
		// this.source.loopStart = 3;

		// console.log( this.buffer );
		// console.log( this.audioContext );

		// this is swap canvas
		this.swap = this.createCanvas();
		// prepare UI canvases
		gArray = [
			{ color: "#555", offset: 0 },
			{ color: "#ccc", offset: 0.5 },
			{ color: "#555", offset: 1 },
		];
		this.cvsFull = this.prepareCanvas(opt.cvsFull, gArray);

		gArray = [
			{ color: "#113", offset: 0 },
			{ color: "#ccc", offset: 0.5 },
			{ color: "#113", offset: 1 },
		];
		this.cvsZoom = this.prepareCanvas(opt.cvsZoom, gArray);

		gArray = [
			{ color: "#ccc", offset: 0 },
			{ color: "#555", offset: 1 },
		];
		this.asa = this.prepareCanvas(opt.asa, gArray);

		this.renderFrame();
	},
	start() {
		if (this._paused === undefined) {
			this.source.start(0);
		} else {
			this.audioContext.resume();
		}
		this._paused = false;
		
		this.renderFrame();
	},
	stop() {
		this._paused = true;
		this.audioContext.suspend();
	},
	renderFrame() {
		if (!this._paused) {
			requestAnimationFrame(Waves.renderFrame.bind(this));
		}
		this.analyser.getByteFrequencyData(this.frequencyData);

		let o = this.asa,
			data = this.frequencyData,
			il = data.length,
			sw = (o.width - 2) / il,
			x = 0;
		
		o.cvs.width = o.width;
		o.ctx.fillStyle = "#124";
		
		for (let i=0; i<il; i++) {
			var v = data[i] / 256,
				h = v * o.height,
				y = o.height - h;
			o.ctx.fillRect(x, y, sw - 2, 4);
			// o.ctx.fillRect(x, y, sw - 2, h);
			x += sw;
		}
	},
	createCanvas(width=1, height=1) {
		let cvs = $(document.createElement("canvas")),
			ctx = cvs[0].getContext("2d");
		cvs.prop({ width, height });
		return { cvs, ctx }
	},
	prepareCanvas(el, gArray) {
		let cvs = el[0],
			ctx = cvs.getContext("2d"),
			width = el.prop("offsetWidth"),
			height = el.prop("offsetHeight"),
			gradient = ctx.createLinearGradient(0, 0, 0, height);
		// set width & height of canvas
		el.attr({ width, height });
		// defaults
		ctx.fillStyle = "#71a1ca";
		// prepare overlay gradient
		gArray.map(stop => gradient.addColorStop(stop.offset, stop.color));
		// essential canvas properties
		return { cvs, ctx, gradient, width, height };
	},
	draw(opt) {
		let o = this[opt.cvs],
			len = this.data.length,
			start = Math.round(len * opt.start),
			end = Math.round(len * opt.end),
			data = this.data.slice(start, end),
			step = Math.ceil(data.length / o.width),
			amp = Math.floor(o.height >> 1);

		o.ctx.clearRect(0, 0, o.width, o.height);

		for(let x=0; x<o.width; x++){
			let min = 1.0,
				max = -1.0;
			for (let j=0; j<step; j++) {
				let datum = data[(x * step) + j]; 
				if (datum < min) min = datum;
				if (datum > max) max = datum;
			}
			let y = (1 + min) * amp,
				w = 1,
				h = Math.max(1, (max - min) * amp);
			o.ctx.fillRect(x, y, w, h);
		}

		// gradient overlay
		o.ctx.save();
		o.ctx.globalCompositeOperation = "source-atop";
		o.ctx.fillStyle = o.gradient;
		o.ctx.fillRect(0, 0, o.width, o.height);
		o.ctx.restore();
	}
};
