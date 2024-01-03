
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
				if (Data.splitter) Self.draw(Spawn);
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
				let freqAnalyser = Spawn.data.frequency.analyzer;

				Data.splitter = freqAnalyser.audioCtx.createChannelSplitter(2);
				Data.analyserL = freqAnalyser.audioCtx.createAnalyser();
				Data.analyserR = freqAnalyser.audioCtx.createAnalyser();
				
				Data.splitter.connect(Data.analyserL, 1);
				Data.splitter.connect(Data.analyserR, 0);
				// volumeAnalyser.fftSize = 32;

				Data.pcmDataL = new Float32Array(Data.analyserL.fftSize);
				Data.pcmDataR = new Float32Array(Data.analyserR.fftSize);
				// connect to output of frequency analyzer
				freqAnalyser.connectOutput(Data.splitter);
				break;
		}
	},
	draw(Spawn) {
		let Data = Spawn.data;
		if (!Data._playing) return;
		Data._rafId = requestAnimationFrame(() => this.draw(Spawn));

		Data.speaker.analyserL.getFloatTimeDomainData(Data.speaker.pcmDataL);
		Data.speaker.analyserR.getFloatTimeDomainData(Data.speaker.pcmDataR);
		let sumL = 0;
		let sumR = 0;
		for (let amplitude of Data.speaker.pcmDataL) { sumL += amplitude ** 2; }
		for (let amplitude of Data.speaker.pcmDataR) { sumR += amplitude ** 2; }
		let valueL = Math.min(Math.sqrt(sumL / Data.speaker.pcmDataL.length) * 600, 96);
		let valueR = Math.min(Math.sqrt(sumR / Data.speaker.pcmDataR.length) * 600, 96);
		Data.speaker.els.left.css({ "transform": `translateY(-${valueL}%)` });
		Data.speaker.els.right.css({ "transform": `translateY(-${valueR}%)` });
	}
}
