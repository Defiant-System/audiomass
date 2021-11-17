
const Audio = {
	init(canvas) {
		this.cvs = canvas[0];
		this.ctx = this.cvs.getContext("2d");

		this.gradient = this.ctx.createLinearGradient(0, 0, 0, this.cvs.height);
		this.gradient.addColorStop(0.0, "#0c1c36");
		this.gradient.addColorStop(0.495, "#6cf7ff");
		this.gradient.addColorStop(0.5, "#fff");
		this.gradient.addColorStop(0.505, "#6cf7ff");
		this.gradient.addColorStop(1.0, "#0c1c36");
	},
	async visualizeFile(opt) {
		let arrayBuffer = await window.fetch(opt.url),
			audioContext = new AudioContext(),
			buffer = await audioContext.decodeAudioData(arrayBuffer),
			data = this.visualize(buffer, Math.floor(this.cvs.width));

		await this.draw({ ...opt, data });
	},
	visualize(buffer, samples) {
		let rawData = buffer.getChannelData(0),
			blockSize = Math.floor(rawData.length / samples),
			filteredData = [];

		for (let i=0; i<samples; i++) {
			let blockStart = blockSize * i,
				sum = 0;
			for (let j=0; j<blockSize; j++) {
				sum = sum + Math.abs(rawData[blockStart + j])
			}
			filteredData.push(sum / blockSize);
		}

		let multiplier = Math.pow(Math.max(...filteredData), -1);
		filteredData = filteredData.map(n => n * multiplier);

		return filteredData;
	},
	draw(opt) {
		let width = this.cvs.width,
			height = this.cvs.height,
			h = Math.floor(height / 2);
		this.ctx.clearRect(0, 0, width, height);
		
		this.ctx.lineWidth = 1;
		this.ctx.strokeStyle = "#71a1ca";
		this.ctx.translate(0.5, 0.5);
		this.ctx.beginPath();

		// iterate points
		opt.data.map((v, x) => {
			let y = (v * (h - 4)),
				x1 = x,
				y1 = h - y,
				x2 = 0,
				y2 = (y * 2);
			this.ctx.strokeRect(x1, y1, x2, y2);
		});
		this.ctx.stroke();

		// gradient overlay
		this.ctx.save();
		this.ctx.globalCompositeOperation = "source-atop";
		this.ctx.fillStyle = this.gradient;
		this.ctx.fillRect(0, 0, width, height);
		this.ctx.restore();
	}
};
