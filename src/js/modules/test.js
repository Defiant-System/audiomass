
let Test = {
	init(APP) {

		// ws.zoom(200);
		// ws.skip(4.5);
		// this._regions.addRegion({
		// 	id: "region-selected",
		// 	start: 2,
		// 	end: 4,
		// });

		// setTimeout(() => window.find(`.channel-btn[data-click="toggle-channel"]`).trigger("click"), 500);

		return;
		setTimeout(() => {
			APP.data.tabs.active.file._ws.skip(3.5);
			APP.toolbar.els.play.trigger("click");
		}, 200);
		// setTimeout(() => APP.toolbar.els.play.trigger("click"), 1500);

	}
};
