
let Peq = {
	init(dEl) {
		let Self = this,
			el = dEl.find(`.peq-cvs .media-analyzer`),
			width = el.prop("offsetWidth"),
			height = el.prop("offsetHeight");
		// prepare canvas
		Self._lineCvs = el.nextAll("canvas.peq-line:first").attr({ width, height });
		Self._lineCtx = Self._lineCvs[0].getContext("2d");
		Self._lineCtx.strokeStyle = "#d0f6ff";
		Self._lineCtx.lineWidth = 1;
		Self._lineCtx.translate(.5, .5);
		// initial draw line
		Self.draw();
	},
	draw() {
		let Self = this,
			ctx = Self._lineCtx;
		ctx.clearRect(0, 0, 1e3, 1e3);
		ctx.beginPath();
		ctx.moveTo(0, 99);
		ctx.lineTo(446, 99);
		ctx.stroke();
	}
};
