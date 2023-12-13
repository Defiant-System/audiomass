
let WaveSurfer = (function() {
	@import "./modules/ext/wavesurfer-2.0.5.js"

	let test123 = 1212;

	return module.exports;
})();

WaveSurfer.regions = (function() {
	@import "./modules/ext/wavesurfer.regions-2.0.5.js"
	return module.exports;
})();


module.exports = {
	WaveSurfer,
};
