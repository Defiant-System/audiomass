
// imaudio.spawn

{
	init() {
		// fast references
		this.els = {
			doc: $(document),
			content: window.find("content"),
		};
	},
	dispose(event) {
		let Spawn = event.spawn;
		let cmd = { type: "open.file", files: [] };
		for (let key in Spawn.data.tabs._stack) {
			let tab = Spawn.data.tabs._stack[key];
			if (tab.file.xNode) cmd.files.push(tab.file.path);
		}
		return cmd.files.length ? cmd : {};
	},
	dispatch(event) {
		let APP = imaudio,
			Self = APP.spawn,
			Spawn = event.spawn,
			Tabs = Spawn.data ? Spawn.data.tabs : false,
			file,
			name,
			value,
			data,
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "spawn.open":
				Spawn.data.tabs = new FileTabs(Self, Spawn);
				
				// init all sub-objects
				Object.keys(Self)
					.filter(i => typeof Self[i].init === "function")
					.map(i => Self[i].init(Spawn));

				// auto show "blank view"
				Spawn.data.tabs.dispatch({ ...event, type: "show-blank-view" });

				// DEV-ONLY-START
				Test.init(APP, Spawn);
				// DEV-ONLY-END
				break;

			case "load-samples":
				// opening image file from application package
				event.samples.map(async name => {
					// forward event to app
					let file = await Tabs.openLocal(`~/samples/${name}`);
					Self.dispatch({ ...event, type: "prepare-file", isSample: true, file });
				});
				break;
			case "prepare-file":
				if (!event.isSample) {
					// add file to "recent" list
					Self.blankView.dispatch({ ...event, type: "add-recent-file" });
				}
				// hide blank view
				Tabs.dispatch({ ...event, type: "hide-blank-view" });
				// open file with Files
				Tabs.add(event.file);
				break;

			// from menubar
			case "open-file":
				Spawn.dialog.open({
					ogg: fsItem => Self.dispatch(fsItem),
					wav: fsItem => Self.dispatch(fsItem),
					mp3: fsItem => Self.dispatch(fsItem),
				});
				break;
			
			default:
				if (event.el) {
					let pEl = event.el.parents(`div[data-area]`);
					if (pEl.length) {
						let name = pEl.data("area");
						Self[name].dispatch(event);
					}
				}
		}
	},
	blankView: @import "./blank-view.js",
	toolbar: @import "../areas/toolbar.js",
	sidebar: @import "../areas/sidebar.js",
	waves: @import "../areas/waves.js",
	speaker: @import "../areas/speaker.js",
	frequency: @import "../areas/frequency.js",
	spectrum: @import "../areas/spectrum.js",
}
