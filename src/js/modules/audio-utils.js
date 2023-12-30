
let AudioUtils = {
	TrimTo(val, num) {
		let nums = { "0": 1, "1": 10, "2": 100,"3": 1000,"4": 10000,"5": 100000 };
		let dec = nums[num];
		return ((val * dec) >> 0) / dec;
	},

	LoadDecoded(file, buffer) {
		let data = {
				numberOfChannels: buffer.numberOfChannels,
				left: buffer.getChannelData(0),
				right: buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : null,
				sampleRate: buffer.sampleRate,
				duration: buffer.duration,
				type: file._file.blob.type,
			};
		imaudio.workers.wav
			.send(data)
			.then(message => file._ws.loadBlob(message.data));
	},

	CreateBuffer(channels, length, sampleRate) {
		return new AudioContext().createBuffer(channels, length, sampleRate);
	},

	CopyBufferSegment(file) {
		let region = file._activeRegion;
		let offset = this.TrimTo(region.start, 3);
		let duration = this.TrimTo(region.end - region.start, 3);
		let original_buffer = file._ws.getDecodedData();
		let peaks = file._ws.exportPeaks();

		let new_len    = ((duration/1) * original_buffer.sampleRate) >> 0;
		let new_offset = ((offset/1)   * original_buffer.sampleRate) >> 0;

		let channels = original_buffer.numberOfChannels;
		let length = duration * original_buffer.sampleRate;
		let sampleRate = original_buffer.sampleRate;
		let empty_segment = this.CreateBuffer(channels, length, sampleRate);

		for (let i=0, u=0; i<peaks.length; ++i) {
			let buffer_array = original_buffer.getChannelData(i).slice(new_offset, new_len + new_offset);
			empty_segment.getChannelData(u).set(buffer_array);
			++u;
		}

		return empty_segment;
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
			let chan_data = originalBuffer.getChannelData(i);
			let uberChanData = uberSegment.getChannelData(i);
			let segment_chan_data = data.buffer.numberOfChannels === 1
									? data.buffer.getChannelData(0)
									: data.buffer.getChannelData(i);

			if (offset > 0) uberChanData.set(chan_data.slice(0, offset));
			uberChanData.set(segment_chan_data, offset);

			if (offset < (originalBuffer.length + data.buffer.length)) {
				let cut_buffer = chan_data.slice(offset),
					cut_offset = offset + segment_chan_data.length;
				uberChanData.set(cut_buffer, cut_offset);
			}
		}
		
		this.LoadDecoded(data.file, uberSegment);

		let start = offset / sampleRate,
			end = start + (data.buffer.length / sampleRate);
		return [start, end];
	},
};
