
class File {
	constructor(fsFile, el) {
		// save reference to original FS file
		this._file = fsFile || new karaqu.File({ kind: "wav" });

		let timeline = TimelinePlugin.create({
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
			}),
			zoom = ZoomPlugin.create({ scale: 0.2 });

		// instantiate wavesurfer object
		this._ws = WaveSurfer.create({
			container: el[0],
			waveColor: "#9fcef6",
			progressColor: "#71a1ca",
			hideScrollbar: true,
			splitChannels: true,
			autoCenter: true,
			height: (+el.parent().prop("offsetHeight") - 4) / 2,
			minPxPerSec: 100,
  			plugins: [timeline, zoom],
		});

		this._ws.loadBlob(this._file.blob);

		this._ws.on("zoom", minPxPerSec => {
			console.log( minPxPerSec +"px/s" );
		});

		this._ws.on("ready", duration => {
			// temp
			this._ws.zoom(150);
			this._ws.skip(1.35);
		});
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
