
// imaudio.spawn

{
	init() {

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
				
				// fast references
				Spawn.data.els = {
					content: Spawn.find("content"),
				};

				// init all sub-objects
				Object.keys(Self)
					.filter(i => typeof Self[i].init === "function")
					.map(i => Self[i].init(Spawn));

				// init global UI handler
				UI.init(Spawn);

				// auto show "blank view"
				Spawn.data.tabs.dispatch({ ...event, type: "show-blank-view" });

				// DEV-ONLY-START
				Test.init(APP, Spawn);
				// DEV-ONLY-END
				break;
			case "spawn.resize":
				// proxy event spawn -> tabs -> file
				Spawn.data.tabs.dispatch(event);
				Self.frequency.dispatch(event);
				Self.spectrum.dispatch(event);
				break;

			// tab related events
			case "tab.new":
				if (event.file) Tabs.add(event.file);
				else Tabs.add({ new: "Blank" });
				break;
			case "tab.clicked":
				Tabs.focus(event.el.data("id"));
				break;
			case "tab.close":
				Tabs.remove(event.el.data("id"));
				break;

			case "open-url":
				// opening image file from application package
				event.url.map(async path => {
					// forward event to app
					let file = await Tabs.openCdn(path);
					Self.dispatch({ ...event, type: "prepare-file", isSample: true, file });
				});
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
			case "save-file":
				break;
			case "save-file-as":
				break;
			case "new-spawn":
				APP.dispatch({ type: "new-spawn" });
				break;
			case "merge-all-windows":
				Spawn.siblings.map(oSpawn => {
					for (let key in oSpawn.data.tabs._stack) {
						let ref = oSpawn.data.tabs._stack[key];
						Spawn.data.tabs.merge(ref);
					}
					// destroy old analyzer
					oSpawn.data.frequency.analyzer.destroy();
					// close sibling spawn
					oSpawn.close();
				});
				break;
			case "close-file":
				if (Tabs.length > 1) {
					// close tab
					Tabs.remove();
				} else {
					Tabs.removeDelayed();
					Tabs.add({ new: "Blank" });
				}
				break;
			case "close-tab":
				value = Tabs.length;
				if (event.delayed) {
					Tabs.removeDelayed();
				} else if (value > 1) {
					Tabs.active.tabEl.find(`[sys-click]`).trigger("click");
				} else if (value === 1) {
					Self.dispatch({ ...event, type: "close-spawn" });
				}
				break;
			case "close-spawn":
				// system close window / spawn
				karaqu.shell("win -c");
				break;
			case "open-dialog":
				// forward event
				UI.doDialog({ type: "dlg-open", name: event.arg, spawn: Spawn });
				break;

			/* FX: START */
			case "remove-silence":
				file = Spawn.data.tabs.active.file;
				AudioUtils.TrimSilence({ file, edgesOnly: false, spawn: Spawn, sidebar: APP.spawn.sidebar });
				break;
			case "trim-start-end":
				file = Spawn.data.tabs.active.file;
				AudioUtils.TrimSilence({ file, edgesOnly: true, spawn: Spawn, sidebar: APP.spawn.sidebar });
				break;
			case "insert-silence":
				file = Spawn.data.tabs.active.file;
				AudioUtils.InsertSilence({ file, duration: event.duration || 1, spawn: Spawn, sidebar: APP.spawn.sidebar });
				break;
			case "invert-region":
				file = Spawn.data.tabs.active.file;
				AudioUtils.Invert({ file, spawn: Spawn, sidebar: APP.spawn.sidebar });
				break;
			case "crop-region":
				file = Spawn.data.tabs.active.file;
				AudioUtils.Crop({ file, spawn: Spawn, sidebar: APP.spawn.sidebar });
				break;
			case "reverse-region":
				file = Spawn.data.tabs.active.file;
				AudioUtils.Reverse({ file, spawn: Spawn, sidebar: APP.spawn.sidebar });
				break;
			case "fade-in-region":
			case "fade-out-region":
				file = Spawn.data.tabs.active.file;
				value = event.type.split("-")[1] === "out";
				AudioUtils.Fade({ file, spawn: Spawn, sidebar: APP.spawn.sidebar, out: value });
				break;
			/* FX: END */

			case "mono-left-channel":
			case "mono-right-channel":
				console.log(event);
				break;
			case "flip-channels":
				file = Spawn.data.tabs.active.file;
				AudioUtils.Flip({ file, spawn: Spawn, sidebar: APP.spawn.sidebar });
				break;

			case "toggle-follow-cursor":
				file = Spawn.data.tabs.active.file;
				value = !!event.xMenu.getAttribute("is-checked");
				file._ws.setOptions({ autoScroll: value });
				// update menu xml
				if (value) event.xMenu.removeAttribute("is-checked");
				else event.xMenu.setAttribute("is-checked", 1);
				break;
			case "center-to-cursor":
				file = Spawn.data.tabs.active.file;
				value = !!event.xMenu.getAttribute("is-checked");
				file._ws.setOptions({ autoCenter: !value });
				// update menu xml
				if (value) event.xMenu.removeAttribute("is-checked");
				else event.xMenu.setAttribute("is-checked", 1);
				break;

			case "deselect-region":
				file = Spawn.data.tabs.active.file;
				file.dispatch({ type: "ws-region-reset" });
				break;
			case "toggle-dock":
				el = Spawn.data.els.content;
				value = el.hasClass("show-dock");

				name = "show-dock";
				if (value) name = "!"+ name;
				el.cssSequence(name, "transitionend", el => {
					if (el.nodeName() !== "content") return;
					// proxy event spawn -> tabs -> file
					Spawn.data.tabs.dispatch({ type: "spawn.resize" });
				});

				// menu update
				if (value) event.xMenu.removeAttribute("is-checked");
				else event.xMenu.setAttribute("is-checked", "1");
				break;
			default:
				if (event.el) {
					let pEl = event.el.parents(`div[data-area]`);
					if (pEl.length) {
						let name = pEl.data("area");
						return Self[name].dispatch(event);
					}
					pEl = event.el.parents(".dialog-box");
					if (pEl.length) {
						let name = pEl.data("dlg");
						return Dialogs[name](event);
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
