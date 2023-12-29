
function getWavHeader(options) {
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

function getWavBytes(buffer, options) {
	let type = options.isFloat ? Float32Array : Uint16Array;
	let numFrames = buffer.byteLength / type.BYTES_PER_ELEMENT;
	let headerBytes = getWavHeader(Object.assign({}, options, { numFrames }));
	let wavBytes = new Uint8Array(headerBytes.length + buffer.byteLength);
	// prepend header, then add pcmBytes
	wavBytes.set(headerBytes, 0);
	wavBytes.set(new Uint8Array(buffer), headerBytes.length);
	return wavBytes;
}


onmessage = function( ev ) {
	let isFloat= true;
    let channels = ev.data.numberOfChannels;
    let sampleRate = ev.data.sampleRate;
    let left = ev.data.left;
    let right = ev.data.right;
	let interleaved = new Float32Array(left.length + right.length);

	for (let src=0, dst=0; src<left.length; src++, dst+=2) {
		interleaved[dst] = left[src];
		interleaved[dst+1] = right[src];
	}

	let wavBytes = getWavBytes(interleaved.buffer, { isFloat, channels, sampleRate });
	let blob = new Blob([wavBytes], { type: "audio/wav" });

    postMessage(blob);
}
