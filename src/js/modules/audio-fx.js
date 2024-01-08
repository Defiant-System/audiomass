
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
		let offlineCtx = AudioUtils.CreateOfflineAudioContext(channels, length, sampleRate);

		return offlineCtx;
	},

	ApplyFilter(data) {
		// offline render source
		data.offlineCtx.startRendering();

		data.offlineCtx.oncomplete = event => {
			let region = data.file._activeRegion;
			let start = region ? region.start : 0;
			let end = region ? region.end : originalBuffer.duration;

			let renderedBuffer = event.renderedBuffer;
			let originalBuffer = data.file._ws.getDecodedData();
			let channels = originalBuffer.numberOfChannels;
			let sampleRate = originalBuffer.sampleRate;
			let length = originalBuffer.length;
			let newSegment = AudioUtils.CreateBuffer(channels, length, sampleRate);

			let offset = (this.TrimTo(start, 3) * sampleRate) >> 0;
			let duration = (this.TrimTo(end - start, 3) * sampleRate) >> 0;
			let durOffset = offset + duration;
			
			for (let i=0; i<channels; ++i) {
				let chanData = originalBuffer.getChannelData(i);
				let fxChanData = renderedBuffer.getChannelData(i);
				let uberChanData = newSegment.getChannelData(i);

				uberChanData.set(chanData.slice(0, offset));
				uberChanData.set(fxChanData, offset);
				uberChanData.set(chanData.slice(durOffset, length), durOffset);
			}

			AudioUtils.LoadDecoded(data, newSegment);
		};
	}
};
