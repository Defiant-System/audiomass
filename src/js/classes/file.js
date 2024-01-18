
class File {
	constructor(parent, fsFile, el, buffer) {
		// save reference to parent object
		this._parent = parent;
		this._el = el;
		// save reference to original FS file
		this._file = fsFile || new karaqu.File({ kind: "mp3" });
		// file is not ready until it is decoded
		this._ready = false;

		this.id = fsFile.id;
		this.channelOn  = { waveColor: "#9fcef6", progressColor: "#6d9dc8" };
		this.channelOff = { waveColor: "#568", progressColor: "#568" };

		// custom timeline plugin
		let timeline = ImaTimeline.create();
		let zoom = ZoomPlugin.create({ scale: 0.2 });
		let regions = RegionsPlugin.create();

		// instantiate wavesurfer object
		this._ws = WaveSurfer.create({
			container: el[0],
			cursorColor: "#f90",
			hideScrollbar: true,
			sampleRate: 44100,
			// dragToSeek: true,
			// autoCenter: true,
			// autoScroll: false,
			minPxPerSec: 100,
  			plugins: [timeline, zoom, regions],
		});
		// reference to regions
		this._regions = regions;
		this._regions.enableDragSelection({ id: "region-selected" });

		// regions mouse events
		this._regions.on("region-created", region => {
			region.on("update", () => this.dispatch({ type: "ws-region-timeupdate", region }));
			this.dispatch({ type: "ws-region-created", region });
		});
		this._regions.on("region-updated", region => this.dispatch({ type: "ws-region-updated", region }));
		// regions events during  play
		this._regions.on("region-in", region => this._activeRegion = region);
		this._regions.on("region-out", region => {
			if (this._loop) {
				if (this._activeRegion === region) region.play();
				else this._activeRegion = null;
			} else {
				this._ws.stop();
				if (this._activeRegion) {
					this._ws.seekTo(this._activeRegion.start / this._activeRegion.totalDuration);
				}
			}
		});

		// auto-obey sidebar volume
		let volume = parent._spawn.data.sidebar.els.vWrapper.find(".txt-volume h2").html();
		this._ws.setVolume(volume/100);

		// wavesurfer events
		this._ws.on("load", url => this.dispatch({ type: "ws-load", url }));
		this._ws.on("loading", percent => this.dispatch({ type: "ws-loading", percent }));
		this._ws.on("decode", duration => this.dispatch({ type: "ws-decode", duration }));
		this._ws.on("ready", duration => this.dispatch({ type: "ws-ready", duration }));
		this._ws.on("redraw", () => this.dispatch({ type: "ws-redraw" }));
		this._ws.on("finish", () => this.dispatch({ type: "ws-finish" }));
		this._ws.on("play", () => this.dispatch({ type: "ws-play" }));
		this._ws.on("pause", () => this.dispatch({ type: "ws-pause" }));
		this._ws.on("destroy", () => this.dispatch({ type: "ws-destroy" }));
		this._ws.on("timeupdate", currentTime => this.dispatch({ type: "ws-timeupdate", currentTime }));
		this._ws.on("seeking", currentTime => this.dispatch({ type: "ws-seeking", currentTime }));
		this._ws.on("interaction", newTime => this.dispatch({ type: "ws-interaction", newTime }));
		this._ws.on("click", relativeX => this.dispatch({ type: "ws-click", relativeX }));
		this._ws.on("drag", (relativeX, number) => this.dispatch({ type: "ws-drag", relativeX, number }));
		this._ws.on("scroll", (visibleStartTime, visibleEndTime) => this.dispatch({ type: "ws-scroll", visibleStartTime, visibleEndTime }));
		this._ws.on("zoom", minPxPerSec => this.dispatch({ type: "ws-zoom", minPxPerSec }));

		if (buffer) {
			// load file blob when done
			AudioUtils.LoadDecoded({ file: this, callback: blob => this._file.blob = blob }, buffer);
		} else {
			// load file blob
			this._ws.loadBlob(this._file.blob);
		}
	}

	dispatch(event) {
		let Spawn = this._parent._parent,
			ws = this._ws,
			value;
		// console.log(event);
		switch (event.type) {
			// custom events
			case "ws-ready":
				// UI is mono / stereo
				if (ws.exportPeaks().length === 1) {
					this._el.parents(".box.waves").addClass("mono-channel");
				} else {
					this._el.parents(".box.waves").removeClass("mono-channel");
				}
				// fix into view
				this.dispatch({ ...event, type: "resize-view" });
				// update ready flag
				this._ready = true;
				// emit range related event
				this._parent._spawn.emit("timeupdate", { ws });
				// clear regions on mousedown
				this._el.find("> div").shadowRoot().find(".wrapper")
					.on("pointerdown", e => this.dispatch({ type: "ws-region-reset", e }))
					.on("pointermove", e => this.dispatch({ type: "pointermove", e }));
				break;
			case "ws-load": break;
			case "ws-loading": break;
			case "ws-decode": break;
			case "ws-redraw":
				break;
			case "ws-destroy": break;
			case "ws-timeupdate":
				if (ws.decodedData) this._parent._spawn.emit("timeupdate", { currentTime: event.currentTime });
				break;
			case "ws-seeking":
				// emit range related event
				this._parent._spawn.emit("cursor-seeking");
				break;
			case "ws-interaction": break;
			case "ws-click": break;
			case "ws-drag": break;
			case "ws-finish":
				if (this._loop) {
					ws.seekTo(0);
					ws.play();
				}
				break;
			case "ws-play": break;
			case "ws-pause":
				// sync gutter UI
				Spawn.toolbar.dispatch({ type: "reset-play-button", spawn: this._parent._spawn, ws });
				break;
			case "ws-scroll":
			case "ws-zoom":
				// sync gutter UI
				Spawn.waves.dispatch({ type: "ui-sync-gutter", spawn: this._parent._spawn, ws });
				break;
			case "pointermove":
				// Position
			    let bbox = ws.getWrapper().getBoundingClientRect(),
			    	relativeX = Math.min(1, Math.max(0, (event.e.clientX - bbox.left) / bbox.width)),
			    	// Timestamp
			    	duration = ws.getDuration() || 0,
			    	hoverTime = duration * relativeX;
				// emit related event
				this._parent._spawn.emit("timeupdate", { relativeX, hoverTime });
				break;
			// region events
			case "ws-region-reset":
				if (event.e && event.e.button === 2) {
					let target = event.e.target,
						context = target.nodeName === "DIV" && target.getAttribute("part").startsWith("region ")
								? "selection" : "waveform";
					this._parent._els.filesWrapper.data({ context });
					return;
				}
				this._activeRegion = null;
				this._regions.clearRegions();
				// emit range related event
				this._parent._spawn.emit("clear-range");
				break;
			case "ws-region-collapse-start":
				value = this._activeRegion.start / this._activeRegion.totalDuration;
				/* falls through */
			case "ws-region-collapse-end":
				// region end time index
				value = value || this._activeRegion.end / this._activeRegion.totalDuration;
				// clear active region
				this._activeRegion.remove();
				this._activeRegion = null;
				// // emit range related event
				this._parent._spawn.emit("clear-range");
				// move cursor
				ws.seekTo(value);
				break;
			case "ws-region-created":
			case "ws-region-updated":
				// move cursor to begining of region
				value = event.region.start / (event.region.totalDuration || ws.decodedData.duration);
				ws.seekTo(value);
				// save reference to region
				this._activeRegion = event.region;
				// emit range related event
				this._parent._spawn.emit("update-range", { region: event.region });
				break;
			case "ws-region-timeupdate":
				// emit range related event
				this._parent._spawn.emit("time-update-range", { region: event.region });
				break;
			// external events
			case "resize-view":
				if (ws.exportPeaks().length === 1) {
					value = {
						splitChannels: [{ ...this.channelOn }],
						height: (+this._el.parent().prop("offsetHeight") - 15),
					};
				} else {
					value = {
						splitChannels: [{ ...this.channelOn }, { ...this.channelOn }],
						height: (+this._el.parent().prop("offsetHeight") - 14) >> 1,
					};
				}
				ws.setOptions(value);
				break;
			case "toggle-channel":
				value = [...ws.options.splitChannels];
				value[event.value[0]] = event.value[1] ? { ...this.channelOn } : { ...this.channelOff };
				ws.setOptions({ splitChannels: value });
				break;
		}
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
}
