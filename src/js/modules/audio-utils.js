
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
		let peaks = data.file._ws.exportPeaks();

		let newLen    = ((duration/1) * originalBuffer.sampleRate) >> 0;
		let newOffset = ((offset/1)   * originalBuffer.sampleRate) >> 0;

		let channels = originalBuffer.numberOfChannels;
		let sampleRate = originalBuffer.sampleRate;
		let length = duration * sampleRate;
		let emptySegment = this.CreateBuffer(channels, length, sampleRate);

		for (let i=0, u=0; i<peaks.length; ++i) {
			let buffer_array = originalBuffer.getChannelData(i).slice(newOffset, newLen + newOffset);
			emptySegment.getChannelData(u).set(buffer_array);
			++u;
		}

		return emptySegment;
	},

	InsertSegmentToBuffer(data) {
		let originalBuffer = data.file._ws.getDecodedData();
		let channels = originalBuffer.numberOfChannels;
		let length = originalBuffer.length + data.buffer.length;
		let sampleRate = originalBuffer.sampleRate;
		let uberSegment = this.CreateBuffer(channels, length, sampleRate);
		let offset = this.TrimTo(data.file._ws.getCurrentTime(), 3);
		offset = ((offset / 1) * sampleRate) >> 0;
		
		for (let i=0; i<channels; ++i) {
			let chanData = originalBuffer.getChannelData(i);
			let uberChanData = uberSegment.getChannelData(i);
			let segmentChanData = data.buffer.numberOfChannels === 1
									? data.buffer.getChannelData(0)
									: data.buffer.getChannelData(i);

			if (offset > 0) uberChanData.set(chanData.slice(0, offset));
			uberChanData.set(segmentChanData, offset);

			if (offset < (originalBuffer.length + data.buffer.length)) {
				let cut_buffer = chanData.slice(offset),
					cut_offset = offset + segmentChanData.length;
				uberChanData.set(cut_buffer, cut_offset);
			}
		}
		
		this.LoadDecoded(data, uberSegment);

		// let start = offset / sampleRate,
		// 	end = start + (data.buffer.length / sampleRate);
		// return [start, end];
	},

	MakeSilenceBuffer(data) {
		let originalBuffer = data.file._ws.getDecodedData();
		let channels = originalBuffer.numberOfChannels;
		let sampleRate = originalBuffer.sampleRate;
		let length = data.duration * sampleRate;
		let emptySegment = this.CreateBuffer(channels, length, sampleRate);
		return emptySegment;
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

		this.LoadDecoded(data, uberSegment);
	},
};
