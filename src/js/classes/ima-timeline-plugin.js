
class ImaTimeline {
	constructor(options) {
		
	}

	static create() {
		return new ImaTimeline({
			height: 8,
			insertPosition: "beforebegin",
			timeInterval: 0.05,
			primaryLabelInterval: 1,
			secondaryLabelInterval: 1,
			formatTimeCallback: seconds => seconds.toFixed(2),
			style: {
				fontSize: "9px",
				color: "#71a1ca77",
			},
		});
	}

	init(wavesurfer) {
		this.wavesurfer = wavesurfer;

		// subscribe
		this.wavesurfer.on("redraw", () => this.initTimeline());
	}

	once() {
		
	}

	initTimeline() {
		console.log( "initTimeline" );
	}
}
