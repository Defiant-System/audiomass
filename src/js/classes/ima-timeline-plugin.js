
class ImaTimeline {
	constructor(options) {
		this.options = this.options;
		this.rendered = false;
	}

	static create() {
		return new ImaTimeline();
	}

	init(wavesurfer) {
		this.wavesurfer = wavesurfer;

		// subscribe
		this.wavesurfer.on("redraw", () => this.initTimeline());
	}

	once() {
		if (!this.wavesurfer.getDuration()) return;

		this.wsContainer = $(this.wavesurfer.getWrapper());
		this.timelineWrapper = this.wsContainer.before(`<div part="timeline"></div>`);
		
		let sW = +this.wsContainer.prop("scrollWidth");
		let duration = this.wavesurfer.getDuration() ?? 0;
		let pxPerSec = Math.round(sW / duration);
		let timeInterval = this.defaultTimeInterval(pxPerSec);
		let lis = [`<ul part="timeline-notch-ul" style="width: ${duration * pxPerSec}px; --liw: ${pxPerSec}px; --nw: ${(pxPerSec * .1).toFixed(1)}px;">`];

		for (let i=0; i<duration; i+=timeInterval) {
			lis.push(`<li part="timeline-notch-li">${i.toFixed(2)}</li>`);
		}

		lis.push(`</ul>`);

		this.timelineWrapper.html(lis.join(""));
		this.timelineUL = this.timelineWrapper.find("ul");
		this.rendered = true;
	}

	// Return how many seconds should be between each notch
	defaultTimeInterval(pxPerSec) {
		if (pxPerSec >= 25) return 1
		else if (pxPerSec * 5 >= 25) return 5
		else if (pxPerSec * 15 >= 25) return 15
		return Math.ceil(0.5 / pxPerSec) * 60
	}

	// Return the cadence of notches that get labels in the primary color.
	defaultPrimaryLabelInterval(pxPerSec) {
		if (pxPerSec >= 25) return 10
		else if (pxPerSec * 5 >= 25) return 6
		else if (pxPerSec * 15 >= 25) return 4
		return 4
	}

	// Return the cadence of notches that get labels in the secondary color.
	defaultSecondaryLabelInterval(pxPerSec) {
		if (pxPerSec >= 25) return 5
		else if (pxPerSec * 5 >= 25) return 2
		else if (pxPerSec * 15 >= 25) return 2
		return 2
	}

	initTimeline() {
		if (this.rendered) {
			let sW = +this.wsContainer.prop("scrollWidth");
			let duration = this.wavesurfer.getDuration();
			let pxPerSec = Math.round(sW / duration);
			this.timelineUL.css({
				"--liw": `${pxPerSec}px`,
				"--nw": `${(pxPerSec * .1).toFixed(1)}px`,
			});
		} else this.once();
	}
}
