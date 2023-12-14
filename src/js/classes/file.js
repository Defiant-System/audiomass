
class File {
	constructor(parent, fsFile, el) {
		// save reference to parent object
		this._parent = parent;
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

		// disable default mouse wheel handler
		zoom._onWheel = zoom.onWheel;
		delete zoom.onWheel;

		// instantiate wavesurfer object
		this._ws = WaveSurfer.create({
			container: el[0],
			cursorColor: "#afdeff",
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

		this._ws.on("load", url => this.dispatch({ type: "ws-load", url }));
		this._ws.on("loading", percent => this.dispatch({ type: "ws-loading", percent }));
		this._ws.on("decode", duration => this.dispatch({ type: "ws-decode", duration }));
		this._ws.on("ready", duration => this.dispatch({ type: "ws-ready", duration }));
		this._ws.on("redraw", () => this.dispatch({ type: "ws-redraw" }));
		this._ws.on("play", () => this.dispatch({ type: "ws-play" }));
		this._ws.on("pause", () => this.dispatch({ type: "ws-pause" }));
		this._ws.on("destroy", () => this.dispatch({ type: "ws-destroy" }));
		this._ws.on("timeupdate", currentTime => this.dispatch({ type: "ws-timeupdate", currentTime }));
		this._ws.on("seeking", currentTime => this.dispatch({ type: "ws-seeking", currentTime }));
		this._ws.on("interaction", newTime => this.dispatch({ type: "ws-interaction", newTime }));
		this._ws.on("click", relativeX => this.dispatch({ type: "ws-click", relativeX }));
		this._ws.on("drag", relativeX => this.dispatch({ type: "ws-drag", relativeX }));
		this._ws.on("scroll", (visibleStartTime, visibleEndTime) => this.dispatch({ type: "ws-scroll", visibleStartTime, visibleEndTime }));
		this._ws.on("zoom", minPxPerSec => this.dispatch({ type: "ws-zoom", minPxPerSec }));
	}

	dispatch(event) {
		let APP = this._parent._APP,
			ws = this._ws;
		// console.log(event);
		switch (event.type) {
			// native events
			case "ws-ready":
				// temp
				// ws.zoom(150);
				// ws.skip(1.35);
				break;
			case "ws-load": break;
			case "ws-loading": break;
			case "ws-decode": break;
			case "ws-redraw": break;
			case "ws-destroy": break;
			case "ws-timeupdate":
				// console.log(ws.media);
				break;
			case "ws-seeking": break;
			case "ws-interaction": break;
			case "ws-click": break;
			case "ws-drag": break;
			case "ws-play": break;
			case "ws-pause":
				// sync gutter UI
				APP.toolbar.dispatch({ type: "reset-play-button", ws });
				break;
			case "ws-scroll":
			case "ws-zoom":
				// sync gutter UI
				APP.waves.dispatch({ type: "ui-sync-gutter", ws });
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
