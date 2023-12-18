
// imaudio.spectrum

// https://colorkit.co/palette/-5437df-8748bd-ba4698-e83872-e97e69-e2b358-d1e434-afe961-86e983-4ae89e/
// https://colorkit.co/color-palette-generator/-4256bc-6153bc-7b4dbc-9245bc-a83abc-b14ab3-ad6ca0-a6878b-9e9e70-93b44a/

{
	t1: ["#000", "#5437df", "#8748bd", "#ba4698", "#e83872", "#e97e69", "#e2b358", "#d1e434", "#afe961", "#86e983", "#4ae89e"],
	t2: ["#000", "#4256bc", "#6153bc", "#7b4dbc", "#9245bc", "#a83abc", "#b14ab3", "#ad6ca0", "#a6878b", "#9e9e70", "#93b44a"],
	mass: ["#000", "#4b009f", "#6800fb", "#8300ff", "#9b129d", "#af2500", "#bf3b00", "#ce5800", "#df8400", "#f0bc00", "#fffc00"],
	prism: ["#000", "#a35", "#c66", "#e94", "#ed0", "#9d5", "#4d8", "#2cb", "#0bc", "#09c", "#36b"],
	init(Spawn) {
		// fast references
		this.els = {
			el: Spawn.find(`.dock .box[data-area="spectrum"] .body`),
		};
		// main canvas
		this.cvs = this.els.el.append("<canvas></canvas>")[0];
		this.ctx = this.cvs.getContext("2d");
		// swap canvas
		this.swapCvs = document.createElement("canvas");
		this.swapCtx = this.swapCvs.getContext("2d");

		// translate palette hex to rgba array
		this.palette = {};
		this.mass.map((color, i) => {
			let { style } = new Option();
			style.color = color;
			let v = style.color.match(/^rgb?\((\d+),\s*(\d+),\s*(\d+)\)$/),
				a = color === "#000" ? 0 : 1;
			this.palette[(i * 10).toString()] = [+v[1], +v[2], +v[3], a];
		});
		
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
			let y = Math.round (i/il * height);
			// draw the line at the right side of the canvas
			ctx.fillStyle = this.getFullColor(data[i]);
			ctx.fillRect(width - speed, height - y, speed, speed);
		}
		ctx.translate(-speed, 0);
		ctx.drawImage(this.swapCvs, 0, 0, width, height, 0, 0, width, height);
		ctx.setTransform (1, 0, 0, 1, 0, 0);

		this.value_changed = false;
	},
	getFullColor(value) {
		let palette = this.palette,
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
				palette[floored + 10][3] - palette[floored + 10][3],
			];
		} else {
			next = [0, 0, 0, 0];
		}
		let c = [
			palette[floored][0] + dist * next[0],
			palette[floored][1] + dist * next[1],
			palette[floored][2] + dist * next[2],
			palette[floored][3] + dist * next[3],
		];
		return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${c[3]})`;
	}
}
