
let Test = {
	init(APP, spawn) {

		// setTimeout(() => spawn.data.toolbar.els.play.trigger("click"), 600);
		// setTimeout(() => spawn.data.toolbar.els.play.trigger("click"), 1000);

		// setTimeout(() => $(".def-desktop_").trigger("mousedown").trigger("mouseup"), 400);
		// return setTimeout(() => spawn.data.tabs.active.file._ws.skip(3), 800);

		// setTimeout(() => APP.dispatch({ type: "close-file", spawn }), 300);
		// setTimeout(() => APP.dispatch({ type: "tab.new", spawn }), 500);
		// setTimeout(() => APP.dispatch({ type: "close-tab", spawn }), 500);
		// setTimeout(() => APP.dispatch({ type: "invert-region", spawn }), 600);

		setTimeout(() => {
			let file = spawn.data.tabs.active.file;
			file._regions.addRegion({
				id: "region-selected",
				start: 1,
				end: 2.15,
			});

			APP.spawn.dispatch({ type: "save-file-as", spawn });
		}, 600);

		// setTimeout(() => APP.dispatch({ type: "open-dialog", arg: "dlgVocoder", spawn }), 700);
		return;

		// setTimeout(() => {
		// 	APP.spawn.dispatch({ type: "mono-left-channel", spawn });
		// 	// APP.spawn.dispatch({ type: "mono-right-channel", spawn });
		// 	// APP.spawn.dispatch({ type: "flip-channels", spawn });
		// }, 600);

		let arg = "dlgParagraphicEq";
		setTimeout(() => APP.dispatch({ type: "open-dialog", arg, spawn }), 700);
		return setTimeout(() => {
			let file = spawn.data.tabs.active.file;
			let dEl = spawn.find(`.dialog-box[data-dlg="${arg}"]`);

			// UI.renderPreset({ dEl, id: 2, name: arg });

			// file._regions.addRegion({
			// 	id: "region-selected",
			// 	start: 1,
			// 	end: 1.75,
			// });

			// setTimeout(() => dEl.find(`.toggler`).trigger("click"), 100);
			// setTimeout(() => dEl.find(`.toggler`).trigger("click"), 1500);
			// setTimeout(() => dEl.find(`.button[data-click="dlg-apply"]`).trigger("click"), 400);
		}, 1000);

		/*
		return setTimeout(() => {
			let file = spawn.data.tabs.active.file;
			file._ws.skip(1.5);

			setTimeout(() => APP.dispatch({ type: "insert-silence", duration: 2, spawn }), 100);

			// let arg = "dlgSilence";
			// setTimeout(() => APP.dispatch({ type: "open-dialog", arg, spawn }), 200);
			// setTimeout(() => Dialogs._active.find(`.button[data-click="dlg-apply"]`).trigger("click"), 300);
		}, 550);
		*/

		let context = new AudioContext();

		// return setTimeout(async () => {
		// 	await context.audioWorklet.addModule("~/js/worklets/gain.js");
		// 	let oscillator = new OscillatorNode(context);
		// 	let bypasser = new AudioWorkletNode(context, "gain-processor");
		// 	oscillator.connect(bypasser).connect(context.destination);
		// 	oscillator.start();

		// 	setTimeout(() => oscillator.stop(), 500);
		// }, 500);

		return setTimeout(() => {
			let file = spawn.data.tabs.active.file;
			// file._ws.skip(1.5);
			// file._ws.zoom(200);
			// file._ws.setVolume(.1);

			file._regions.addRegion({
				id: "region-selected",
				start: 1,
				end: 1.75,
			});


			// setTimeout(() => spawn.find(`.toolbar-tool_[data-click="cut-selection"]`).trigger("click"), 300);
			// setTimeout(() => spawn.find(`.toolbar-tool_[data-click="copy-selection"]`).trigger("click"), 100);
			// setTimeout(() => spawn.find(`.toolbar-tool_[data-click="silence-selection"]`).trigger("click"), 600);
			// setTimeout(() => file.dispatch({ type: "ws-region-collapse-start" }), 900);
			// setTimeout(() => APP.dispatch({ type: "remove-silence", spawn }), 1000);

			// setTimeout(() => APP.dispatch({ type: "fade-in-region", spawn }), 600);
			// setTimeout(() => APP.dispatch({ type: "fade-out-region", spawn }), 600);
			return;


			let name = "dlgSilence";
			setTimeout(() => APP.dispatch({ type: "open-dialog", arg: name, spawn }), 200);
			// setTimeout(() => {
			// 	let dEl = spawn.find(`.dialog-box[data-dlg="${name}"]`);
			// 	UI.renderPreset({ name, dEl, id: 1 });
			// }, 800);

			// setTimeout(() => spawn.find(`.dialog-box[data-dlg="${name}"] .button[data-click="dlg-reset"]`).trigger("click"), 250);

		}, 550);

		// return setTimeout(() => APP.dispatch({ type: "tab.new", spawn }), 500);
		// return setTimeout(() => {
		// 	spawn.find(".sample:nth(1)").trigger("click");

		// }, 500);

		return setTimeout(() => {
			let focusedId = $(`.antwin-focused_`).data("sId");
			if (spawn._sId === focusedId) {
				if (Object.keys(spawn.data.tabs._stack).length) {
					APP.spawn.dispatch({ type: "merge-all-windows", spawn });

					// console.log( "master", spawn._sId );

					// setTimeout(() => spawn.find(".tabbar-next-active_").trigger("click"), 1000);
				}
			}
		}, 1000);
		
	}
};
