
let AudioFX = {
	TrimTo: AudioUtils.TrimTo,
	Gain(value) {
		let filter = {
				apply: (audio_ctx, destination, source, duration) => {
					var gain = audio_ctx.createGain ();
					filter.update(gain, audio_ctx, val);
					gain.connect(destination);
					source.connect(gain);
					return gain;
				},
				update: (gain, audio_ctx, val) => {
					for (var k = 0; k < val.length; ++k) {
						var curr = val[k];
						if (curr.length) {
							for (var i = 0; i < curr.length; ++i) {
								gain.gain.linearRampToValueAtTime(curr[i].val, audio_ctx.currentTime + curr[i].time);
							}
						} else {
							gain.gain.setValueAtTime(curr.val, audio_ctx.currentTime);
						}
					}
				}
			};
		return filter;
	}
};
