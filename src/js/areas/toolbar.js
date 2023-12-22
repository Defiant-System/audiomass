
// imaudio.spawn.toolbar

{
	init(Spawn) {
		let el = Spawn.find(`> div[data-area="toolbar"]`);
		// fast references for this spawn
		Spawn.data.toolbar = {
			els: {
				content: Spawn.find(`content`),
				sidebar: Spawn.find(`.toolbar-tool_[data-click="toggle-sidebar"]`),
				undo: Spawn.find(`.toolbar-tool_[data-click="file-undo"]`),
				redo: Spawn.find(`.toolbar-tool_[data-click="file-redo"]`),
				rewind: Spawn.find(`.toolbar-tool_[data-click="rewind-audio"]`),
				forward: Spawn.find(`.toolbar-tool_[data-click="forward-audio"]`),
				stop: Spawn.find(`.toolbar-tool_[data-click="stop-audio"]`),
				play: Spawn.find(`.toolbar-tool_[data-click="play-audio"]`),
				record: Spawn.find(`.toolbar-tool_[data-click="record-audio"]`),
				loop: Spawn.find(`.toolbar-tool_[data-click="loop-audio"]`),
				copy: Spawn.find(`.toolbar-tool_[data-click="copy-selection"]`),
				paste: Spawn.find(`.toolbar-tool_[data-click="paste-selection"]`),
				cut: Spawn.find(`.toolbar-tool_[data-click="cut-selection"]`),
				silenceSel: Spawn.find(`.toolbar-tool_[data-click="silence-selection"]`),
				silenceRest: Spawn.find(`.toolbar-tool_[data-click="silence-rest"]`),
				settings: Spawn.find(`.toolbar-tool_[data-menu="view-settings"]`),
				// display
				display: Spawn.find(`.toolbar-field_`),
				currentTime: Spawn.find(`.display .current-time`),
				totalTime: Spawn.find(`.display .total-time`),
				hoverTime: Spawn.find(`.display .hover-time`),
			}
		};
		
		// subscribe to events
		Spawn.on("timeupdate", this.dispatch);
		Spawn.on("clear-range", this.dispatch);
		Spawn.on("update-range", this.dispatch);
	},
	dispatch(event) {
		let APP = imaudio,
			Spawn = event.spawn,
			Self = APP.spawn.toolbar,
			file,
			value,
			isOn,
			el;
		switch (event.type) {
			// subscribed events
			case "timeupdate":
				if (event.detail.ws) {
					value = Self.format(event.detail.ws.decodedData.duration);
					Spawn.data.toolbar.els.totalTime.html(value);
				}
				if (event.detail.currentTime !== undefined) {
					value = Self.format(event.detail.currentTime);
					Spawn.data.toolbar.els.currentTime.html(value);
				}
				if (event.detail.hoverTime) {
					value = Self.format(event.detail.hoverTime);
					Spawn.data.toolbar.els.hoverTime.html(value);
				}
				break;
			case "clear-range":
				["copy", "cut", "silenceSel"]
					.map(key => Spawn.data.toolbar.els[key].addClass("tool-disabled_"));
				break;
			case "update-range":
				["copy", "cut", "silenceSel"]
					.map(key => Spawn.data.toolbar.els[key].removeClass("tool-disabled_"));
				break;
			// custom events
			case "enable-tools":
				["sidebar", "rewind", "forward", "play", "stop", "loop", "settings"]
					.map(key => Spawn.data.toolbar.els[key].removeClass("tool-disabled_"));
				// enable display
				Spawn.data.toolbar.els.display.removeClass("blank-display");
				break;
			case "disable-tools":
				Object.keys(Spawn.data.toolbar.els).map(key =>
					Spawn.data.toolbar.els[key].addClass("tool-disabled_"));
				// disable display
				Spawn.data.toolbar.els.display.addClass("blank-display");
				break;
			// ui events
			case "toggle-sidebar":
				el = Spawn.data.toolbar.els.content;
				isOn = event.value || el.hasClass("show-sidebar");
				el.toggleClass("show-sidebar", isOn);
				return isOn;

			case "rewind-audio":
				file = Spawn.data.tabs.active.file;
				Self.dispatch({ type: "timeupdate", spawn: Spawn, detail: { ws: file._ws } });
				file._ws.seekTo(0);
				break;
			case "forward-audio":
				file = Spawn.data.tabs.active.file;
				Self.dispatch({ type: "timeupdate", spawn: Spawn, detail: { ws: file._ws } });
				file._ws.seekTo(1);
				break;
			case "loop-audio":
				isOn = Spawn.data.toolbar.els.loop.hasClass("tool-active_");
				// store loop reference in file object
				if (!isOn) Spawn.data.tabs.active.file._loop = true;
				else delete Spawn.data.tabs.active.file._loop;
				return !isOn;
			case "record-audio":
				// TODO
				break;
			case "stop-audio":
				file = Spawn.data.tabs.active.file;
				// call appropriate method
				file._ws.stop();
				// auto seek to start of region, if any
				if (file._activeRegion) {
					// seek to start of region
					file._ws.seekTo(file._activeRegion.start / file._activeRegion.totalDuration);
					delete file._activeRegion;
				}
				// emit event
				Spawn.emit("audio-stop");
				break;
			case "reset-play-button":
				Spawn.data.toolbar.els.play.find(".icon-play")
					.removeClass("icon-pause")
					.css({ "background-image": `url("~/icons/icon-play.png")` });
				// emit event
				Spawn.emit("audio-stop");
				break;
			case "play-audio":
				el = event.el.find(".icon-play");
				isOn = el.hasClass("icon-pause");
				el.toggleClass("icon-pause", isOn);
				el.css({ "background-image": `url("~/icons/icon-${!isOn ? "pause" : "play"}.png")` });
				// call appropriate method
				Spawn.data.tabs.active.file._ws[isOn ? "pause" : "play"]();
				// emit event
				if (!isOn) Spawn.emit("audio-play");
				else Spawn.emit("audio-pause");
				break;
		}
	},
	format(time=0) {
		let ts = time >> 0,
			ms = time - ts;
		if (ts < 10) {
			if (time === 0) return '00:00.000';
			ts = `00:0${ts}`;
		} else if (ts < 60) {
			ts = `00:${ts}`;
		} else {
			let m = (ts / 60) >> 0,
				s = (ts % 60);
			ts = `${(m < 10) ? "0" : ""}${m}.${s < 10 ? `0${s}` : s}`;
		}
		if (ms < 0.1) {
			return `${ts}.0${ms < 0.01 ? "0" : ""}${(ms * 1e3) >> 0}`;
		}
		return `${ts}.${(ms * 1e3) >> 0}`;
	}
}
