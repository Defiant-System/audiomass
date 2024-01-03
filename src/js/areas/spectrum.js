
// imaudio.spawn.spectrum

// https://colorkit.co/palette/-5437df-8748bd-ba4698-e83872-e97e69-e2b358-d1e434-afe961-86e983-4ae89e/
// https://colorkit.co/color-palette-generator/-4256bc-6153bc-7b4dbc-9245bc-a83abc-b14ab3-ad6ca0-a6878b-9e9e70-93b44a/

{
	t1: ["#000", "#5437df", "#8748bd", "#ba4698", "#e83872", "#e97e69", "#e2b358", "#d1e434", "#afe961", "#86e983", "#4ae89e"],
	t2: ["#000", "#4256bc", "#6153bc", "#7b4dbc", "#9245bc", "#a83abc", "#b14ab3", "#ad6ca0", "#a6878b", "#9e9e70", "#93b44a"],
	mass: ["#000", "#4b009f", "#6800fb", "#8300ff", "#9b129d", "#af2500", "#bf3b00", "#ce5800", "#df8400", "#f0bc00", "#fffc00"],
	prism: ["#000", "#a35", "#c66", "#e94", "#ed0", "#9d5", "#4d8", "#2cb", "#0bc", "#09c", "#36b"],
	init(Spawn) {
		// translate palette hex to rgba array
		this.palette = {};
		this.mass.map((color, i) => {
			let { style } = new Option();
			style.color = color;
			let v = style.color.match(/^rgb?\((\d+),\s*(\d+),\s*(\d+)\)$/),
				a = color === "#000" ? 0 : 1;
			this.palette[(i * 10).toString()] = [+v[1], +v[2], +v[3], a];
		});
		
		// reserve persistent reference for this object
		Spawn.data.spectrum = {};
		// subscribe to events
		Spawn.on("audio-play", this.dispatch);
		Spawn.on("audio-pause", this.dispatch);
		Spawn.on("audio-stop", this.dispatch);
	},
	dispatch(event) {
		let APP = imaudio,
			Spawn = event.spawn,
			Self = APP.spawn.spectrum,
			Data = Spawn.data.spectrum,
			isOn,
			el;
		// console.log(event);
		switch (event.type) {
			// subscribed events
			case "audio-play":
				// turn on flag
				Spawn.data._playing = true;
				if (Data.specAnalyser) Self.draw(Spawn);
				break;
			case "audio-pause":
			case "audio-stop":
				// fadeout flag
				Spawn.data._fadeOut = true;
				// delayed stop
				setTimeout(() => {
					delete Spawn.data._fadeOut;
					delete Spawn.data._playing;
					cancelAnimationFrame(Spawn.data._rafId);
				}, 1e3);
				break;
			// custom events
			case "connect-file-output":
				if (!Data.cvs) {
					// find box body
					let el = Spawn.find(`.dock .box[data-area="spectrum"] .body`);
					// main canvas
					Data.cvs = el.append("<canvas></canvas>")[0];
					Data.ctx = Data.cvs.getContext("2d");
					// swap canvas
					Data.swapCvs = document.createElement("canvas");
					Data.swapCtx = Data.swapCvs.getContext("2d");

					// make sure canvas fits its parent element
					let pEl = Data.cvs.parentNode;
					Data.cvs.width  = Data.swapCvs.width  = +pEl.offsetWidth;
					Data.cvs.height = Data.swapCvs.height = +pEl.offsetHeight;
				}

				let freqAnalyser = Spawn.data.frequency.analyzer,
					specAnalyser = freqAnalyser.audioCtx.createAnalyser();
				specAnalyser.fftSize = 2048;
				// specAnalyser.maxDecibels = -25;
				// specAnalyser.minDecibels = -60;
				// specAnalyser.smoothingTimeConstant = 0.5;

				Data.frequencyData = new Uint8Array(specAnalyser.frequencyBinCount);
				Data.specAnalyser = specAnalyser;
				// connect to output of frequency analyzer
				freqAnalyser.connectOutput(specAnalyser);
				break;
			case "toggle-analyser":
				isOn = event.el.parent().hasClass("on");
				event.el.parent().toggleClass("on", isOn);
				break;
		}
	},
	draw(Spawn) {
		if (!Spawn.data._playing) return;
		Spawn.data._rafId = requestAnimationFrame(() => this.draw(Spawn));

		let Data = Spawn.data.spectrum;
		Data.specAnalyser.getByteFrequencyData(Data.frequencyData);
		
		let ctx = Data.ctx,
			width = Data.cvs.width,
			height = Data.cvs.height,
			data = Data.frequencyData,
			i = 0,
			il = data.length,
			speed = 3;

		if (Spawn.data._fadeOut) {
			ctx.globalCompositeOperation = "destination-in";
			ctx.fillStyle = "#ff000077";
			ctx.fillRect(0, 0, width, height);
			// ctx.globalCompositeOperation = "source-over"
		} else {
			Data.swapCtx.drawImage(Data.cvs, 0, 0, width, height);
			Data.cvs.width = width;

			for (; i<il; i++) {
				let y = Math.round (i/il * height);
				// draw the line at the right side of the canvas
				ctx.fillStyle = this.getFullColor(data[i]);
				ctx.fillRect(width - speed, height - y, speed, speed);
			}
			ctx.translate(-speed, 0);
			ctx.drawImage(Data.swapCvs, 0, 0, width, height, 0, 0, width, height);
			ctx.setTransform (1, 0, 0, 1, 0, 0);
		}
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
