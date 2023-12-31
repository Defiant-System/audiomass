
let AudioUtils = {
	TrimTo(val, num) {
		let nums = { "0": 1, "1": 10, "2": 100,"3": 1000,"4": 10000,"5": 100000 };
		let dec = nums[num];
		return ((val * dec) >> 0) / dec;
	},

	LoadDecoded(data, buffer) {
		let args = {
				numberOfChannels: buffer.numberOfChannels,
				left: buffer.getChannelData(0),
				right: buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : null,
				sampleRate: buffer.sampleRate,
				duration: buffer.duration,
				type: data.file._file.blob.type,
			};
		// engage worker
		imaudio.workers.wav
			.send(args)
			.on("message", event => {
				switch (event.type) {
					case "progress":
						// proxy event to sidebar
						data.sidebar.dispatch({ ...event, spawn: data.spawn });
						// replace blob in view
						if (event.value === 100) data.file._ws.loadBlob(event.blob);
						break;
				}
			});
	},

	CreateBuffer(channels, length, sampleRate) {
		return new AudioContext().createBuffer(channels, length, sampleRate);
	},

	CopyBufferSegment(data) {
		let region = data.file._activeRegion;
		let offset = this.TrimTo(region.start, 3);
		let duration = this.TrimTo(region.end - region.start, 3);
		let originalBuffer = data.file._ws.getDecodedData();

		let newLen    = ((duration/1) * originalBuffer.sampleRate) >> 0;
		let newOffset = ((offset/1)   * originalBuffer.sampleRate) >> 0;

		let channels = originalBuffer.numberOfChannels;
		let sampleRate = originalBuffer.sampleRate;
		let length = duration * sampleRate;
		let copySegment = this.CreateBuffer(channels, length, sampleRate);

		for (let i=0; i<channels; ++i) {
			let chanData = originalBuffer.getChannelData(i);
			let copyChanData = copySegment.getChannelData(i);
			copyChanData.set(chanData.slice(newOffset, newLen + newOffset));
		}

		return copySegment;
	},

	InsertSegmentToBuffer(data) {
		let originalBuffer = data.file._ws.getDecodedData();
		let sampleRate = originalBuffer.sampleRate;
		let channels = originalBuffer.numberOfChannels;
		let length = originalBuffer.length;

		let region = data.file._activeRegion;
		let offset = region ? region.start : data.file._ws.getCurrentTime();
		let duration = region ? region.end - region.start : 0;

		offset = (this.TrimTo(offset, 3) * sampleRate) >> 0;
		duration = (this.TrimTo(duration, 3) * sampleRate) >> 0;

		let pasteSegment = data.segment;
		let newLength = length - duration + pasteSegment.length;
		let uberSegment = this.CreateBuffer(channels, newLength, sampleRate);
		
		for (let i=0; i<channels; ++i) {
			let chanData = originalBuffer.getChannelData(i);
			let uberChanData = uberSegment.getChannelData(i);
			let pasteChanData = pasteSegment.getChannelData(i);
			let durOffset = offset + duration;

			uberChanData.set(chanData.slice(0, offset));
			uberChanData.set(pasteChanData, offset);
			uberChanData.set(chanData.slice(durOffset, length), offset + pasteSegment.length);
		}

		this.LoadDecoded(data, uberSegment);
	},

	MakeSilenceBuffer(data) {
		let originalBuffer = data.file._ws.getDecodedData();
		let channels = originalBuffer.numberOfChannels;
		let sampleRate = originalBuffer.sampleRate;
		let length = data.duration * sampleRate;
		let emptySegment = this.CreateBuffer(channels, length, sampleRate);
		return emptySegment;
	},

	OverwriteBufferWithSilence(data) {
		let region = data.file._activeRegion;
		let offset = this.TrimTo(region.start, 3);
		let duration = this.TrimTo(region.end - region.start, 3);

		let originalBuffer = data.file._ws.getDecodedData();
		let channels = originalBuffer.numberOfChannels;
		let length = originalBuffer.length;
		let sampleRate = originalBuffer.sampleRate;

		let uberSegment = this.CreateBuffer(channels, length, sampleRate);
		let silentSegment = this.MakeSilenceBuffer({ ...data, duration });

		offset = (offset * sampleRate) >> 0;
		duration = (duration * sampleRate) >> 0;

		for (let i=0; i<channels; ++i) {
			let chanData = originalBuffer.getChannelData(i);
			let uberChanData = uberSegment.getChannelData(i);
			let durOffset = offset + duration;

			uberChanData.set(chanData.slice(0, offset));
			uberChanData.set(silentSegment, offset);
			uberChanData.set(chanData.slice(durOffset, length), durOffset);
		}

		this.LoadDecoded(data, uberSegment);
	},

	TrimBuffer(data) {
		let originalBuffer = data.file._ws.getDecodedData();
		let channels = originalBuffer.numberOfChannels;
		let sampleRate = originalBuffer.sampleRate;

		let region = data.file._activeRegion;
		let offset = region.start;
		let duration = region.end - region.start;
		var newLen    = ((duration/1) * sampleRate) >> 0;
		var newOffset = ((offset/1)   * sampleRate) >> 0;

		let length = originalBuffer.length - newLen;
		let uberSegment = this.CreateBuffer(channels, length, sampleRate);
		let emptySegment = this.CreateBuffer(channels, newLen, sampleRate);

		for (var i=0; i<channels; ++i) {
			var chanData = originalBuffer.getChannelData(i);
			var segmentChanData = emptySegment.getChannelData(i);
			var uberChanData = uberSegment.getChannelData(i);

			segmentChanData.set(chanData.slice(newOffset, newOffset + newLen));
			uberChanData.set(chanData.slice(0, newOffset));
			uberChanData.set(chanData.slice(newOffset + newLen), newOffset);
		}

		// if (data.skipLoad) return;
		this.LoadDecoded(data, uberSegment);
	},
};
