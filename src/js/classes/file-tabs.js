
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
			boxWaves: spawn.find(".box.waves"),
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

	add(fsFile, buffer) {
		if (fsFile.new) {
			let tId = "f"+ Date.now(),
				fileEl = this._els.content,
				// add tab to tab row
				tabEl = this._spawn.tabs.add(fsFile.new, tId);
			// reference to tab element
			this._stack[tId] = { tabEl, fileEl };
			// reset view / show blank view
			this.dispatch({ type: "show-blank-view", spawn: this._spawn });
			// focus on file
			this.focus(tId);
		} else {
			let fileEl = this._els.filesWrapper.append(this._template.clone(true)),
				file = new File(this, fsFile, fileEl, buffer),
				tabEl = this._spawn.tabs.add(fsFile.base, file.id),
				history = new window.History;

			// add element to DOM + append file contents
			fileEl.data({ id: file.id });
			// save reference to tab
			this._stack[file.id] = { tabEl, history, file, fileEl };
			// focus on file
			this.focus(file.id);
		}
	}

	merge(ref) {
		let tId = ref.tId,
			fileEl = this._els.filesWrapper.append(this._template.clone(true)),
			file = new File(this, ref.file._file, fileEl),
			tabEl = this._spawn.tabs.add(file.base, tId, true),
			history = ref.history;

		// save reference to tab
		this._stack[tId] = { tabEl, history, file, fileEl };
	}

	removeDelayed() {
		if (!this._active) return;
		let el = this._active.tabEl;
		this._spawn.tabs.wait(el);
	}

	remove(tId) {
		let id = tId || this._active.tabEl.data("id"),
			item = this._stack[id],
			nextTab = item.tabEl.parent().find(`.tabbar-tab_:not([data-id="${id}"])`);
		
		if (item.fileEl[0] !== this._els.content[0]) {
			// remove element from DOM tree
			item.fileEl.remove();
			// remove tab element from DOM tree
			if (!tId) this._spawn.tabs.remove(item.tabEl);
			// delete references
			this._stack[id] = false;
			delete this._stack[id];
		}
		
		if (nextTab.length) {
			this.focus(nextTab.data("id"));
		}
	}

	focus(tId) {
		if (this._active) {
			// adjust active file
			this._active.fileEl.removeClass("active");
			this._els.boxWaves.removeClass("mono-channel");
			
			// return;
		}

		// reference to active tab
		this._active = this._stack[tId];

		if (this._active.file) {
			// reset view / show blank view
			this.dispatch({ type: "hide-blank-view" });
			// adjust active file
			this._active.fileEl.addClass("active");
			// is it mono or stereo file?
			if (this._active.file._ready && this._active.file._ws.exportPeaks().length === 1) {
				this._els.boxWaves.addClass("mono-channel");
			}

			// connect frequency analyzer to file
			["frequency", "spectrum", "speaker"]
				.map(device => this._parent[device].dispatch({
					type: "connect-file-output",
					spawn: this._spawn,
					file: this._active.file,
				}));
			// enable toolbar tools
			this._parent.toolbar.dispatch({ type: "enable-tools", spawn: this._spawn });
		} else {
			// reset view / show blank view
			this.dispatch({ type: "show-blank-view" });
			// disable toolbar tools
			this._parent.toolbar.dispatch({ type: "disable-tools", spawn: this._spawn });
		}
	}

	dispatch(event) {
		let Self = this;
		// console.log(event);
		switch (event.type) {
			case "spawn.resize":
				// exit if "blank-view" for instance
				if (!Self._active.file) return;
				// proxy event spawn -> tabs -> file
				Object.keys(Self._stack).map(key => Self._active.file.dispatch({ ...event, type: "resize-view" }));
				break;
			case "show-blank-view":
				// show blank view
				Self._els.content.addClass("show-blank-view");
				break;
			case "hide-blank-view":
				// hide blank view
				Self._els.content.removeClass("show-blank-view");
				break;
			case "new-from-selection":
				let file = new karaqu.File({ kind: "wav" }),
					buffer = AudioUtils.CopyBufferSegment({ file: event.file });
				Self.add(file, buffer);
				break;
		}
	}

	openCdn(url) {
		return this.openLocal(url);
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
