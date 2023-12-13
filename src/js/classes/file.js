
class File {
	constructor(fsFile, el) {
		// save reference to original FS file
		this._file = fsFile || new karaqu.File({ kind: "wav" });

		// instantiate wavesurfer object
		this._ws = WaveSurfer.create({
			container: el[0],
			waveColor: "#71a1ca",
			// progressColor: "#71a1ca",
			height: 300,
		});

		this._ws.loadBlob(this._file.blob);
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
