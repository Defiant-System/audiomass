
const Waves = {
	async init(opt) {
		let arrayBuffer = await window.fetch(opt.url);
		
		this.audioContext = new AudioContext();
		this.buffer = await this.audioContext.decodeAudioData(arrayBuffer);
		this.data = this.buffer.getChannelData(0);

		this.cvsFull = this.prepareCanvas(opt.cvsFull);
		this.cvsZoom = this.prepareCanvas(opt.cvsZoom);
	},
	prepareCanvas(el) {
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
		gradient.addColorStop(0.1, "#0c1c36");
		gradient.addColorStop(0.495, "#5dcad0");
		gradient.addColorStop(0.5, "#fff");
		gradient.addColorStop(0.505, "#5dcad0");
		gradient.addColorStop(0.9, "#0c1c36");
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
