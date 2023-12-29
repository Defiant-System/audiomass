
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

		for (let i=0, u=0; i<channels; ++i) {
			if (originalBuffer.numberOfChannels[i] === 0) continue;
			let buffer = originalBuffer.getChannelData(i).slice(new_offset, new_len + new_offset);
			new_segment.getChannelData(u).set(buffer);
			++u;
		}

		return new_segment;
	},

	InsertSegmentToBuffer(data) {
		let originalBuffer = data.file._ws.getDecodedData();
		let channels = originalBuffer.numberOfChannels;
		let length = originalBuffer.length * data.buffer.length;
		let rate = originalBuffer.sampleRate;
		let uberSegment = this.CreateBuffer(channels, length, rate);

		let offset = this.TrimTo(data.file._ws.getCurrentTime(), 3);
		offset = ((offset / 1) * originalBuffer.sampleRate) >> 0;
		
		for (let i=0; i<channels; ++i) {
			let chan_data = originalBuffer.getChannelData(i);
			let uberChanData = uberSegment.getChannelData(i);
			let segment_chan_data = null;

			segment_chan_data = data.buffer.numberOfChannels === 1
								? data.buffer.getChannelData(0)
								: data.buffer.getChannelData(i);


			// // check to see if we have only 1 channel selected
			// if (wavesurfer.SelectedChannelsLen === 1) {
			// 	// check if we have the selected channel
			// 	if (wavesurfer.ActiveChannels[ i ] === 0) {
			// 		// keep original
			// 		uberChanData.set( chan_data );
			// 		continue;
			// 	}
			// }

			if (offset > 0) {
				uberChanData.set(chan_data.slice (0, offset));
			}

			uberChanData.set(segment_chan_data, offset);

			if (offset < (originalBuffer.length + data.buffer.length)) {
				let cut_buffer = chan_data.slice(offset),
					cut_offset = offset + segment_chan_data.length;
				uberChanData.set(cut_buffer, cut_offset);
			}
		}
		
		// loadDecoded ( uberSegment, originalBuffer );

		// return [
		// 	(_offset / originalBuffer.sampleRate), 
		// 	(_offset / originalBuffer.sampleRate) + (buffer.length / originalBuffer.sampleRate)
		// ];
	}
};
