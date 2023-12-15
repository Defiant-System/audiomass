
let Test = {
	init(APP) {

		// setTimeout(() => {
		// 	window.find(`.workarea .channel-btn[data-click="toggle-channel"]`).trigger("click");
		// }, 500);

		return;
		setTimeout(() => {
			APP.data.tabs.active.file._ws.skip(3.5);
			APP.toolbar.els.play.trigger("click");
		}, 200);
		// setTimeout(() => APP.toolbar.els.play.trigger("click"), 1500);

	}
};
