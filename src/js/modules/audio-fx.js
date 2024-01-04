
let AudioFX = {
	TrimTo: AudioUtils.TrimTo,
	Gain(options) {
		let filter = {
				apply: () => {
					options.gain = options.audioCtx.createGain();
					filter.update(options.value);
					options.gain.connect(options.audioCtx.destination);
					options.source.connect(options.gain);
				},
				update: value => {
					options.gain.gain.setValueAtTime(value, options.audioCtx.currentTime);
				}
			};
		return filter;
	}
};
