
// imaudio.spawn.speaker

{
	init(Spawn) {
		// fast references for this spawn
		Spawn.data.speaker = {
			els: {
				left: Spawn.find(".volume-bar.left .volume"),
				right: Spawn.find(".volume-bar.right .volume"),
			}
		};
		// subscribe to events
		Spawn.on("audio-play", this.dispatch);
		Spawn.on("audio-pause", this.dispatch);
		Spawn.on("audio-stop", this.dispatch);
	},
	dispatch(event) {
		let APP = imaudio,
			Spawn = event.spawn,
			Self = APP.spawn.speaker,
			Data = Spawn.data.speaker,
			el;
		switch (event.type) {
			// subscribed events
			case "audio-play":
				// turn on flag
				Spawn.data._playing = true;
				if (Data.volumeAnalyser) Self.draw(Spawn);
				break;
			case "audio-pause":
			case "audio-stop":
				// reset flag
				delete Spawn.data._playing;
				cancelAnimationFrame(Spawn.data._rafId);
				// reset DOM elements
				Spawn.data.speaker.els.left.css({ "transform": `translateY(0%)` });
				Spawn.data.speaker.els.right.css({ "transform": `translateY(0%)` });
				break;
			// custom events
			case "connect-file-output":
				let freqAnalyser = Spawn.data.frequency.analyzer,
					volumeAnalyser = freqAnalyser.audioCtx.createAnalyser();
				volumeAnalyser.fftSize = 2048;

				Data.volumeData = new Uint8Array(volumeAnalyser.frequencyBinCount);
				Data.pcmData = new Float32Array(volumeAnalyser.fftSize);
				Data.volumeAnalyser = volumeAnalyser;
				// connect to output of frequency analyzer
				freqAnalyser.connectOutput(volumeAnalyser);
				break;
		}
	},
	draw(Spawn) {
		if (!Spawn.data._playing) return;
		Spawn.data._rafId = requestAnimationFrame(() => this.draw(Spawn));

		let Data = Spawn.data.speaker;

		// Data.volumeAnalyser.getByteFrequencyData(Data.volumeData);
		// let data = Data.volumeData;
		
		Data.volumeAnalyser.getFloatTimeDomainData(Data.pcmData);

		let peakInstantaneousPower = 0;
		for (let i=0; i<Data.pcmData.length; i++) {
			let power = Data.pcmData[i] ** 2;
			peakInstantaneousPower = Math.max(power, peakInstantaneousPower);
		}
		let v = 10 * Math.log10(peakInstantaneousPower) | 0;
		Spawn.data.speaker.els.left.css({ "transform": `translateY(${v}%)` });
	}
}
