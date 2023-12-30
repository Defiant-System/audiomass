
function encodeWAV(samples, channels, sampleRate) {
	let buffer = new ArrayBuffer(44 + samples.length * 2);
	let view = new DataView(buffer);
	writeString(view, 0, "RIFF");
	view.setUint32(4, 36 + samples.length * 2, true);
	writeString(view, 8, "WAVE");
	writeString(view, 12, "fmt ");
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	view.setUint16(22, channels, true);
	view.setUint32(24, sampleRate, true);
	view.setUint32(28, sampleRate * channels * 2, true);
	view.setUint16(32, channels * 2, true);
	view.setUint16(34, 16, true);
	writeString(view, 36, "data");
	view.setUint32(40, samples.length * 2, true);
	floatTo16BitPCM(view, 44, samples);
	return view;
}

function floatTo16BitPCM(output, offset, input) {
	for (let i=0, il=input.length; i<il; i++, offset += 2) {
		let s = Math.max(-1, Math.min(1, input[i]));
		output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
	}
}

function writeString(view, offset, string) {
	for (let i=0, il=string.length; i<il; i++) {
		view.setUint8(offset + i, string.charCodeAt(i));
	}
}

let Self = self;

Self.onmessage = event => {
	let numberOfChannels = event.data.numberOfChannels;
	let sampleRate = event.data.sampleRate;
	let type = event.data.type;
	let data = [event.data.left, event.data.right];
	let interleaved = new Float32Array(data[0].length * numberOfChannels);
	// signal work starting
	postMessage({ type: "progress", value: 0 });

	for (let channel=0; channel<numberOfChannels; channel++) {
		let channelData = data[channel];
		for (let i=0, il=channelData.length; i<il; i++) {
			interleaved[i * numberOfChannels + channel] = channelData[i];
		}
	}

	let dataView = encodeWAV(interleaved, numberOfChannels, sampleRate);
	let blob = new Blob([dataView], { type: "audio/wav" });
	// signal work done
	postMessage({ type: "progress", value: 100, blob });
};
