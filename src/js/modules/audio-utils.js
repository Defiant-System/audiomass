
let AudioUtils = {
	TrimTo(val, num) {
		let nums = { "0": 1, "1": 10, "2": 100,"3": 1000,"4": 10000,"5": 100000 };
		let dec = nums[num];
		return ((val * dec) >> 0) / dec;
	},

	LoadDecoded(file, buffer) {
		let [left, right] = [buffer.getChannelData(0), buffer.getChannelData(1)];
		let interleaved = new Float32Array(left.length + right.length);

		for (let src=0, dst=0; src < left.length; src++, dst+=2) {
			interleaved[dst] = left[src];
			interleaved[dst+1] = right[src];
		}

		// get WAV file bytes and audio params of your audio source
		let wavBytes = this.getWavBytes(interleaved.buffer, {
			isFloat: true,
			numChannels: 2,
			sampleRate: buffer.sampleRate,
		});

		let blob = new Blob([wavBytes], { type: "audio/wav" });
		file._ws.loadBlob(blob);
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
			// if (wavesurfer.ActiveChannels[ i ] === 0) continue;
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
			let segment_chan_data = null;

			segment_chan_data = data.buffer.numberOfChannels === 1
								? data.buffer.getChannelData(0)
								: data.buffer.getChannelData(i);

			// check to see if we have only 1 channel selected
			if (channels === 1) {
				// check if we have the selected channel
				if (wavesurfer.ActiveChannels[i] === 0) {
					// keep original
					uberChanData.set(chan_data);
					continue;
				}
			}

			if (offset > 0) {
				uberChanData.set(chan_data.slice(0, offset));
			}

			uberChanData.set(segment_chan_data, offset);

			if (offset < (originalBuffer.length + data.buffer.length)) {
				let cut_buffer = chan_data.slice(offset),
					cut_offset = offset + segment_chan_data.length;
				uberChanData.set(cut_buffer, cut_offset);
			}
		}
		
		this.LoadDecoded(data.file, uberSegment);
		
		// let start = offset / sampleRate,
		// 	end = start + (data.buffer.length / sampleRate);
		// return [start, end];
	},

	// Returns Uint8Array of WAV bytes
	getWavBytes(buffer, options) {
		let type = options.isFloat ? Float32Array : Uint16Array;
		let numFrames = buffer.byteLength / type.BYTES_PER_ELEMENT;
		let headerBytes = this.getWavHeader(Object.assign({}, options, { numFrames }));
		let wavBytes = new Uint8Array(headerBytes.length + buffer.byteLength);
		// prepend header, then add pcmBytes
		wavBytes.set(headerBytes, 0);
		wavBytes.set(new Uint8Array(buffer), headerBytes.length);
		return wavBytes;
	},

	// adapted from https://gist.github.com/also/900023
	// returns Uint8Array of WAV header bytes
	getWavHeader(options) {
		let numFrames      = options.numFrames;
		let numChannels    = options.numChannels || 2;
		let sampleRate     = options.sampleRate || 44100;
		let bytesPerSample = options.isFloat? 4 : 2;
		let format         = options.isFloat? 3 : 1;
		let blockAlign     = numChannels * bytesPerSample;
		let byteRate       = sampleRate * blockAlign;
		let dataSize       = numFrames * blockAlign;
		let buffer         = new ArrayBuffer(44);
		let dataView       = new DataView(buffer);
		let p = 0;

		let writeString = s => {
			for (let i = 0; i < s.length; i++) {
				dataView.setUint8(p + i, s.charCodeAt(i));
			}
			p += s.length;
		};

		let writeUint32 = d => {
			dataView.setUint32(p, d, true);
			p += 4;
		};

		let writeUint16 = d => {
			dataView.setUint16(p, d, true);
			p += 2;
		};

		writeString("RIFF");              // ChunkID
		writeUint32(dataSize + 36);       // ChunkSize
		writeString("WAVE");              // Format
		writeString("fmt ");              // Subchunk1ID
		writeUint32(16);                  // Subchunk1Size
		writeUint16(format);              // AudioFormat https://i.stack.imgur.com/BuSmb.png
		writeUint16(numChannels);         // NumChannels
		writeUint32(sampleRate);          // SampleRate
		writeUint32(byteRate);            // ByteRate
		writeUint16(blockAlign);          // BlockAlign
		writeUint16(bytesPerSample * 8);  // BitsPerSample
		writeString("data");              // Subchunk2ID
		writeUint32(dataSize);            // Subchunk2Size

		return new Uint8Array(buffer);
	}
};
