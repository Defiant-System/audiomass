
// imaudio.spectrum

{
	init() {
		// fast references
		this.els = {
			el: window.find(`.dock .box[data-area="spectrum"] .body`),
		};
		// main canvas
		this.cvs = this.els.el.append("<canvas></canvas>")[0];
		this.ctx = this.cvs.getContext("2d");
		// swap canvas
		this.swapCvs = document.createElement("canvas");
		this.swapCtx = this.swapCvs.getContext("2d");

		// subscribe to events
		window.on("audio-play", this.dispatch);
		window.on("audio-pause", this.dispatch);
		window.on("audio-stop", this.dispatch);
	},
	dispatch(event) {
		let APP = imaudio,
			Self = APP.spectrum,
			isOn,
			el;
		switch (event.type) {
			// subscribed events
			case "audio-play":
				// turn on flag
				Self._playing = true;
				Self.draw();
				break;
			case "audio-pause":
			case "audio-stop":
				// reset flag
				delete Self._playing;
				cancelAnimationFrame(Self._rafId);
				break;
			// custom events
			case "connect-file-output":
				// make sure canvas fits its parent element
				let pEl = Self.cvs.parentNode;
				Self.cvs.width  = Self.swapCvs.width  = +pEl.offsetWidth;
				Self.cvs.height = Self.swapCvs.height = +pEl.offsetHeight;

				let freqAnalyser = APP.frequency.analyzer,
					specAnalyser = freqAnalyser.audioCtx.createAnalyser();
				specAnalyser.fftSize = 2048;
				// specAnalyser.maxDecibels = -25;
				// specAnalyser.minDecibels = -60;
				// specAnalyser.smoothingTimeConstant = 0.5;

				Self.frequencyData = new Uint8Array(specAnalyser.frequencyBinCount);
				Self.specAnalyser = specAnalyser;
				// connect to output of frequency analyzer
				freqAnalyser.connectOutput(specAnalyser);
				break;
			case "toggle-analyser":
				isOn = event.el.parent().hasClass("on");
				event.el.parent().toggleClass("on", isOn);
				break;
		}
	},
	draw() {
		if (!this._playing) return;
		this._rafId = requestAnimationFrame(() => this.draw());

		this.specAnalyser.getByteFrequencyData(this.frequencyData);
		
		let ctx = this.ctx,
			width = this.cvs.width,
			height = this.cvs.height,
			data = this.frequencyData,
			i = 0,
			il = data.length,
			speed = 3;

		this.swapCtx.drawImage(this.cvs, 0, 0, width, height);
		this.cvs.width = width;

		for (; i<il; i++) {
			let value = data[i],
				y = Math.round (i/il * height);
			
			// draw the line at the right side of the canvas
			ctx.fillStyle = this.getFullColor(value);
			ctx.fillRect(width - speed, height - y, speed, speed);
		}
		ctx.translate(-speed, 0);
		ctx.drawImage(this.swapCvs, 0, 0, width, height, 0, 0, width, height);
		ctx.setTransform (1, 0, 0, 1, 0, 0);

		this.value_changed = false;
	},
	getFullColor(value) {
		let palette = {
				0: [0, 0, 0, 0],
				10: [75, 0, 159, 1],
				20: [104, 0, 251, 1],
				30: [131, 0, 255, 1],
				40: [155, 18, 157, 1],
				50: [175, 37, 0, 1],
				60: [191, 59, 0, 1],
				70: [206, 88, 0, 1],
				80: [223, 132, 0, 1],
				90: [240, 188, 0, 1],
				100: [255, 252, 0, 1]      
			},
			//floor to nearest 10:
			dec = 100 * value / 255,
			floored = 10 * Math.floor(dec / 10),
			dist = dec - floored / 10,
			next;

		if (dec < 100){
			next = [
				palette[floored + 10][0] - palette[floored + 10][0],
				palette[floored + 10][1] - palette[floored + 10][1],
				palette[floored + 10][2] - palette[floored + 10][2],
				palette[floored + 10][3] - palette[floored + 10][3]
			];
		} else {
			next = [0, 0, 0, 0];
		}

		let c = [
			palette[floored][0] + dist * next[0],
			palette[floored][1] + dist * next[1],
			palette[floored][2] + dist * next[2],
			palette[floored][3] + dist * next[3]
		];

		return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${c[3]})`;
	}
}
