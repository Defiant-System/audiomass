
class File {
	constructor(fsFile, el) {
		// save reference to original FS file
		this._file = fsFile || new karaqu.File({ kind: "wav" });

		switch (this.kind) {
			case "mp3":
				break;
			case "wav": break;
			case "ogg": break;
		}

		// console.log( this._file );
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

	get data() {
		let data = this._file.data;

		switch (this.kind) {
			case "mp3": break;
			case "wav": break;
			case "ogg": break;
		}

		return data || "";
	}

	toBlob(opt={}) {
		let data = this._el.html(),
			// file kind, if not specified
			kind = opt.kind || this.kind,
			type;

		switch (kind) {
			case "txt":
				type = "text/plain";
				data = data.replace(/<br>|<br\/>/g, "\n").stripHtml();
				break;
			case "htm":
			case "html":
				type = "text/html";
				break;
			case "y":
			case "md":
				// TODO: if in page view mode, concat string from page-elements
				type = "text/markdown";
				data = Markdown.fromHTML(data);
				break;
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
