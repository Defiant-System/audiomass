
class FileTabs {
	constructor(parent, spawn) {
		this._parent = parent;
		this._spawn = spawn;
		this._stack = {};
		this._active = null;

		// fast references
		this._els = {
			content: spawn.find("content"),
			filesWrapper: spawn.find(".files-wrapper"),
		};

		// canvas / file wrapper
		let template = this._els.filesWrapper.find("> .file");
		this._template = template.clone(true);
		template.remove();
	}

	get length() {
		return Object.keys(this._stack).length;
	}

	get active() {
		return this._active;
	}

	get file() {
		return this._active.file._file;
	}

	toBlob(opt={}) {
		return this._active.file.toBlob(this._active.fileEl, opt);
	}

	add(fsFile) {
		if (fsFile.new) {

		} else {
			let fileEl = this._els.filesWrapper.append(this._template.clone(true)),
				file = new File(this, fsFile, fileEl),
				history = new window.History;

			this._stack[file.id] = { history, file };
			
			// focus on file
			this.focus(file.id);
		}
	}

	focus(tId) {
		// reference to active tab
		this._active = this._stack[tId];

		if (this._active.file) {
			// reset view / show blank view
			this.dispatch({ type: "hide-blank-view" });
			// connect frequency analyzer to file
			["frequency", "spectrum"].map(name =>
				this._spawn[name].dispatch({ type: "connect-file-output", file: this._active.file }));
			// enable toolbar tools
			this._spawn.toolbar.dispatch({ type: "enable-tools" });
		} else {
			// reset view / show blank view
			this.dispatch({ type: "show-blank-view" });
			// disable toolbar tools
			this._spawn.toolbar.dispatch({ type: "disable-tools" });
		}
	}

	dispatch(event) {
		let name,
			value;
		// console.log(event);
		switch (event.type) {
			case "show-blank-view":
				// show blank view
				this._els.content.addClass("show-blank-view");
				break;
			case "hide-blank-view":
				// hide blank view
				this._els.content.removeClass("show-blank-view");
				break;
		}
	}

	openLocal(url) {
		let parts = url.slice(url.lastIndexOf("/") + 1),
			[ name, kind ] = parts.split("."),
			file = new karaqu.File({ name, kind });
		// return promise
		return new Promise((resolve, reject) => {
			// fetch image and transform it to a "fake" file
			fetch(url)
				.then(resp => resp.blob())
				.then(blob => {
					// here the image is a blob
					file.blob = blob;

					let reader = new FileReader();
					reader.addEventListener("load", () => {
						// this will then display a text file
						file.data = reader.result;
						resolve(file);
					}, false);
					reader.readAsText(blob);
				})
				.catch(err => reject(err));
		});
	}
}
