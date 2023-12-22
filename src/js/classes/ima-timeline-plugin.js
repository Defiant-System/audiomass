
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

		let container = $(this.wavesurfer.getWrapper());
		this.timelineWrapper = container.prepend(`<div part="timeline"></div>`);

		let duration = this.wavesurfer.getDuration() ?? 0;
		let pxPerSec = Math.round(+this.timelineWrapper.prop("scrollWidth") / duration);
		let timeInterval = this.defaultTimeInterval(pxPerSec);

		let lis = [`<ul part="timeline-notch-ul" style="width: ${duration * pxPerSec}px; --liw: ${pxPerSec}px; --nw: ${pxPerSec * .1}px;">`];
		for (let i=0; i<duration; i+=timeInterval) {
			lis.push(`<li part="timeline-notch-li">${i.toFixed(2)}</li>`);
		}
		lis.push(`</ul>`);

		this.timelineWrapper.prepend(lis.join(""));
		this.timelineUL = this.timelineWrapper.find("ul");
		console.log(this.timelineUL);
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
		if (!this.rendered) this.once();
	}
}
