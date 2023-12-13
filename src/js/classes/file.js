
class File {
	constructor(fsFile, el) {
		// save reference to original FS file
		this._file = fsFile || new karaqu.File({ kind: "wav" });

		let topTimeline = TimelinePlugin.create({
				height: 10,
				insertPosition: "beforebegin",
				// duration: .25,
				timeInterval: 0.05,
				primaryLabelInterval: 1,
				secondaryLabelInterval: 1,
				formatTimeCallback(seconds) {
					return seconds.toFixed(2);
				},
				style: {
					fontSize: "10px",
					color: "#71a1ca99",
				},
			}),
			bottomTimeline = TimelinePlugin.create({
				height: 10,
				timeInterval: 0.05,
				primaryLabelInterval: 1,
				secondaryLabelInterval: 1,
				formatTimeCallback(seconds) {
					return seconds.toFixed(2);
				},
				style: {
					fontSize: "10px",
					color: "#71a1ca77",
				},
			});

		// instantiate wavesurfer object
		this._ws = WaveSurfer.create({
			container: el[0],
			waveColor: "#9fcef6",
			progressColor: "#71a1ca",
			splitChannels: true,
			autoCenter: true,
			height: (+el.parent().prop("offsetHeight") - 10) / 2,
			minPxPerSec: 100,
  			plugins: [topTimeline, bottomTimeline],
		});

		this._ws.loadBlob(this._file.blob);

		// setTimeout(() => {
			// this._ws.registerPlugin(TimelinePlugin.create());
			// this._ws.registerPlugin(RegionsPlugin.create());
			// console.log( this._ws );
		// }, 500);
	}

	get kind() {
		return this._file.kind;
	}

	get base() {
		return this._file.base;
	}

	get isNew() {
		return !this._file.xNode;
	}

	get isDirty() {
		// TODO:
	}

	toBlob(opt={}) {
		let data = "",
			// file kind, if not specified
			kind = opt.kind || this.kind,
			type;

		switch (this.kind) {
			case "mp3": break;
			case "wav": break;
			case "ogg": break;
		}
		// console.log( data );
		return new Blob([data], { type });
	}

	dispatch(event) {
		let name,
			value;
		switch (event.type) {
			// native events
			case "change":
				break;
		}
	}
}
