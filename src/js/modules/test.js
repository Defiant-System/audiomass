
let Test = {
	init(APP) {

		return;
		setTimeout(() => {
			let file = APP.data.tabs.active.file;
			
			// file._ws.skip(4.5);
			// file._ws.zoom(200);

			file._regions.addRegion({
				id: "region-selected",
				start: 1.5,
				end: 3,
			});

			setTimeout(() => APP.toolbar.els.loop.trigger("click"), 100);

		}, 300);

		// setTimeout(() => window.find(`.channel-btn[data-click="toggle-channel"]`).trigger("click"), 500);

		return;
		setTimeout(() => {
			APP.data.tabs.active.file._ws.skip(3.5);
			APP.toolbar.els.play.trigger("click");
		}, 200);
		// setTimeout(() => APP.toolbar.els.play.trigger("click"), 1500);

	}
};
