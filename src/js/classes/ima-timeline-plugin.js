
class ImaTimeline {
	constructor(options) {
		this.options = this.options;
		this.timelineWrapper = this.initTimelineWrapper();
	}

	static create() {
		return new ImaTimeline({
			timeInterval: 0.05,
			primaryLabelInterval: 1,
			secondaryLabelInterval: 1,
			formatTimeCallback: seconds => seconds.toFixed(2),
		});
	}

	init(wavesurfer) {
		this.wavesurfer = wavesurfer;

		let container = this.wavesurfer.getWrapper();
		let tmp = container.insertAdjacentElement("beforeBegin", this.timelineWrapper);
		// console.log( tmp );

		// subscribe
		this.wavesurfer.on("redraw", () => this.initTimeline());
	}

	once() {
		
	}

	initTimelineWrapper() {
		const div = document.createElement("div");
		div.setAttribute("part", "timeline");
		// div.setAttribute("style", "pointer-events: none;");
		return div;
	}

	initTimeline() {

	}
}
