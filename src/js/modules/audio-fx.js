
let AudioFX = {
	TrimTo: AudioUtils.TrimTo,
	
	CreateOfflineAudioContext(data) {
		let originalBuffer = data.file._ws.getDecodedData();
		let region = data.file._activeRegion;
		let start = region ? region.start : 0;
		let end = region ? region.end : originalBuffer.duration;
		let offset = this.TrimTo(start, 3);
		let duration = this.TrimTo(end - start, 3);

		// create offline audio context
		let channels = originalBuffer.numberOfChannels;
		let sampleRate = originalBuffer.sampleRate;
		let length = duration * sampleRate;
		let context = AudioUtils.CreateOfflineAudioContext(channels, length, sampleRate);

		return context;
	},

	ApplyFilter(data) {
		// create source and connect to filter
		data.filter.equalizer.connect(data.context.destination);

		// offline render source
		data.context.startRendering()
			.then(buffer => {
				// copy rendered segment into wavesurfer
				AudioUtils.LoadDecoded(data, buffer);
			});
	}
};
