
let AudioUtils = {
	TrimTo(val, num) {
		let nums = { '0': 1, '1': 10, '2': 100,'3': 1000,'4': 10000,'5': 100000 };
		let dec = nums[num];
		return ((val * dec) >> 0) / dec;
	},

	CreateBuffer(channels, length, rate) {
		return new AudioContext().createBuffer(channels, length, rate);
	},

	CopyBufferSegment(file) {
		let region = file._activeRegion;
		let offset = this.TrimTo(region.start, 3);
		let duration = this.TrimTo(region.end - region.start, 3);
		let originalBuffer = file._ws.getDecodedData();

		let new_len    = ((duration/1) * originalBuffer.sampleRate) >> 0;
		let new_offset = ((offset/1)   * originalBuffer.sampleRate) >> 0;

		let channels = originalBuffer.numberOfChannels;
		let length = duration * originalBuffer.sampleRate;
		let rate = originalBuffer.sampleRate;
		let new_segment = this.CreateBuffer(channels, length, rate);

		for (let i=0, u=0; i<originalBuffer.numberOfChannels.length; ++i) {
			if (originalBuffer.numberOfChannels[i] === 0) continue;
			new_segment.getChannelData(u).set (
				originalBuffer.getChannelData(i).slice (new_offset, new_len + new_offset)
			);
			++u;
		}

		return new_segment;
	},

	InsertSegmentToBuffer(data) {

	}
};
