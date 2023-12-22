
class ImaTimeline {
	constructor(options) {
		this.options = this.options;
		this.timelineWrapper = this.initTimelineWrapper();
		this.rendered = false;
	}

	static create() {
		return new ImaTimeline();
	}

	init(wavesurfer) {
		this.wavesurfer = wavesurfer;

		let container = this.wavesurfer.getWrapper();
		container.insertAdjacentElement("beforeBegin", this.timelineWrapper);

		// subscribe
		this.wavesurfer.on("redraw", () => this.initTimeline());

		// if (this.wavesurfer.getDuration()) {
		// 	this.initTimeline();
		// }
	}

	once() {
		if (!this.wavesurfer.getDuration()) return;

		let duration = this.wavesurfer.getDuration() ?? 0;
		let pxPerSec = Math.round(this.timelineWrapper.scrollWidth / duration);
		let timeInterval = this.defaultTimeInterval(pxPerSec);

		let lis = [`<ul part="timeline-notch-ul" style="width: ${duration * pxPerSec}px; --nw: ${pxPerSec * .1}px;">`];
		for (let i=0; i<duration; i+=timeInterval) {
			lis.push(`<li part="timeline-notch-li" style="width: ${pxPerSec}px;">${i.toFixed(2)}</li>`);
		}
		lis.push(`</ul>`);

		this.timelineWrapper.innerHTML = lis.join("");
		this.rendered = true;
	}

	initTimelineWrapper() {
		const div = document.createElement("div");
		div.setAttribute("part", "timeline");
		// div.setAttribute("style", "pointer-events: none;");
		return div;
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
