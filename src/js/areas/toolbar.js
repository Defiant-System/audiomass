
// audiomass.toolbar

{
	init() {
		let el = window.find(`> div[data-area="toolbar"]`);
		// fast references
		this.els = {
			sidebar: el.find(`.toolbar-tool_[data-click="toggle-sidebar"]`),
			undo: el.find(`.toolbar-tool_[data-click="file-undo"]`),
			redo: el.find(`.toolbar-tool_[data-click="file-redo"]`),
			rewind: el.find(`.toolbar-tool_[data-click="rewind-audio"]`),
			forward: el.find(`.toolbar-tool_[data-click="forward-audio"]`),
			stop: el.find(`.toolbar-tool_[data-click="stop-audio"]`),
			play: el.find(`.toolbar-tool_[data-click="play-audio"]`),
			record: el.find(`.toolbar-tool_[data-click="record-audio"]`),
			loop: el.find(`.toolbar-tool_[data-click="loop-audio"]`),
			copy: el.find(`.toolbar-tool_[data-click="copy-selection"]`),
			paste: el.find(`.toolbar-tool_[data-click="paste-selection"]`),
			cut: el.find(`.toolbar-tool_[data-click="cut-selection"]`),
			silence: el.find(`.toolbar-tool_[data-click="silence-selection"]`),
			settings: el.find(`.toolbar-tool_[data-menu="view-settings"]`),
		};
	},
	dispatch(event) {
		let APP = audiomass,
			Self = APP.toolbar,
			isOn,
			el;
		// console.log( event );
		switch (event.type) {
			// custom events
			case "enable-tools":
				Self.els.sidebar.removeClass("tool-disabled_");
				Self.els.rewind.removeClass("tool-disabled_");
				Self.els.play.removeClass("tool-disabled_");
				Self.els.settings.removeClass("tool-disabled_");
				break;
			case "disable-tools":
				Object.keys(Self.els).map(key => Self.els[key].addClass("tool-disabled_"));
				break;
			case "toggle-sidebar":
				isOn = event.value || APP.els.content.hasClass("show-sidebar");
				APP.els.content.toggleClass("show-sidebar", isOn);
				return !isOn;
			case "toggle-dock":
				isOn = event.value || APP.els.content.hasClass("show-dock");
				APP.els.content.toggleClass("show-dock", isOn);
				return !isOn;

			case "rewind-audio":
				APP.data.tabs.active.file._ws.seekTo(0);
				break;
			case "reset-play-button":
				Self.els.play.find(".icon-play")
					.removeClass("icon-pause")
					.css({ "background-image": `url("~/icons/icon-play.png")` });
				break;
			case "play-audio":
				el = event.el.find(".icon-play");
				isOn = el.hasClass("icon-pause");
				el.toggleClass("icon-pause", isOn);
				el.css({ "background-image": `url("~/icons/icon-${!isOn ? "pause" : "play"}.png")` });
				// call appropriate method
				APP.data.tabs.active.file._ws[isOn ? "pause" : "play"]();
				break;
		}
	}
}
