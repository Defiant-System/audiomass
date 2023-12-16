
let Test = {
	init(APP) {

		// return;
		
		setTimeout(() => APP.toolbar.els.loop.trigger("click"), 300);
		
		setTimeout(() => {
			let file = APP.data.tabs.active.file;
			// file._ws.skip(2.5);
			// file._ws.zoom(200);
			file._ws.setVolume(.1);

			// file._regions.addRegion({
			// 	id: "region-selected",
			// 	start: 1.5,
			// 	end: 2,
			// });

			// setTimeout(() => APP.toolbar.els.play.trigger("click"), 200);
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
