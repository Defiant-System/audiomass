
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

		ctx.fillStyle = "#71a1ca";
		// ctx.shadowColor = "#ffffff66";
		// ctx.shadowBlur = 7;

		// prepare overlay gradient
		gradient.addColorStop(0.0, "#0c1c36");
		gradient.addColorStop(0.495, "#6cf7ff");
		gradient.addColorStop(0.5, "#fff");
		gradient.addColorStop(0.505, "#6cf7ff");
		gradient.addColorStop(1.0, "#0c1c36");
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

		for(var i=0; i<o.width; i++){
	        var min = 1.0,
	        	max = -1.0;
	        for (var j=0; j<step; j++) {
	            var datum = data[(i * step) + j]; 
	            if (datum < min) min = datum;
	            if (datum > max) max = datum;
	        }
	        let x = i,
	        	y = (1 + min) * amp,
	        	w = 1,
	        	h = Math.max(1, (max - min) * amp);
	        o.ctx.fillRect(x, y, w, h);
	    }

		// gradient overlay
		// o.ctx.save();
		// o.ctx.globalCompositeOperation = "source-atop";
		// o.ctx.fillStyle = o.gradient;
		// o.ctx.fillRect(0, 0, o.width, o.height);
		// o.ctx.restore();
	}
};
