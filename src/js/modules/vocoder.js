
let Vocoder = (() => {

	let FILTER_QUALITY = 6;
	let FOURIER_SIZE = 2048;
	let WAVETABLEBOOST = 40;

	let filters = {
			modulatorGain: null,
			carrierSampleGain: null,
			oscillatorGain: null,
			noiseGain: null,
			oscillatorNode: null,
		};

	let audioContext = null;
	let modulatorNode = null;
	let modulatorInput = null;
	let carrierInput = null;

	let modulatorGainValue = 1;

	// noise node added to the carrier signal
	let noiseBuffer = null;
	let noiseNode = null;
	let noiseGainValue = 0.2;

	// Carrier sample gain
	let carrierSampleNode = null;
	let carrierSampleGainValue = 0;

	// Carrier Synth oscillator stuff
	let oscillatorType = 4;		// CUSTOM
	let oscillatorGainValue = 1;
	let oscillatorDetuneValue = 0;
	let wavetable = null;
	let wavetableSignalGain = null;

	let vocoderBands = [];
	let numVocoderBands;
	let hpFilterGain = null;

	// Vocoder
	let Vocoder = {
		init(ctx) {
			// make audio context available locally
			audioContext = ctx;
			// generate neccessary bands
			this.generateBands(55, 7040, 14);
			// Set up the vocoder chains
			this.initBandpassFilters();
		},

		modify(name, value) {
			switch (name) {
				case "oscillatorNode":
					filters.oscillatorNode.detune.value = value * 100;
					break;
				case "modulatorGain":
				case "carrierSampleGain":
				case "oscillatorGain":
				case "noiseGain":
					filters[name].gain.value = value;
					break;
			}
		},

		start(modulatorBuffer) {
			this.createCarriersAndPlay();

			modulatorNode = audioContext.createBufferSource();
			modulatorNode.buffer = modulatorBuffer;
			modulatorNode.loop = true;
			filters.modulatorGain = audioContext.createGain();
			filters.modulatorGain.gain.value = modulatorGainValue;
			modulatorNode.connect(filters.modulatorGain);
			filters.modulatorGain.connect(modulatorInput);
			modulatorNode.start(0);
			// set flag 
			this._started = true;
		},

		stop() {
			modulatorNode.stop(0);
			// set flag 
			this._started = false;
		},

		// this function will algorithmically re-calculate vocoder bands, distributing evenly
		// from startFreq to endFreq, splitting evenly (logarhythmically) into a given numBands.
		// The function places this info into the global vocoderBands and numVocoderBands variables.
		generateBands(startFreq, endFreq, numBands) {
			let totalRangeInCents = 1200 * Math.log(endFreq / startFreq) / Math.LN2;
			let centsPerBand = totalRangeInCents / numBands;
			let scale = Math.pow(2, centsPerBand / 1200);  // This is the scaling for successive bands
			let currentFreq = startFreq;

			for (let i=0; i<numBands; i++) {
				vocoderBands[i] = { frequency: currentFreq };
				currentFreq = currentFreq * scale;
			}

			numVocoderBands = numBands;
		},

		// When this function is called, the carrierNode and modulatorAnalyser 
		// may not already be created.  Create placeholder nodes for them.
		initBandpassFilters() {
			modulatorInput = audioContext.createGain();
			carrierInput = audioContext.createGain();

			// Populate with a "curve" that does an abs()
			let waveShaperCurve = new Float32Array(65536);
			let n = 65536;
			let n2 = n / 2;
			for (let i=0; i<n2; ++i) {
				let x = i / n2;
				waveShaperCurve[n2 + i] = x;
				waveShaperCurve[n2 - i - 1] = x;
			}
		
			// Set up a high-pass filter to add back in the fricatives, etc.
			// (this isn't used by default in the "production" version, as I hid the slider)
			let hpFilter = audioContext.createBiquadFilter();
			hpFilter.type = "highpass";
			hpFilter.frequency.value = 8000;
			hpFilter.Q.value = 1;
			modulatorInput.connect(hpFilter);

			hpFilterGain = audioContext.createGain();
			hpFilterGain.gain.value = 0;
			hpFilter.connect(hpFilterGain);
			hpFilterGain.connect(audioContext.destination);

			let outputGain = audioContext.createGain();
			outputGain.connect(audioContext.destination);

			let rectifierCurve = new Float32Array(65536);
			for (let i=-32768; i<32768; i++) {
				rectifierCurve[i + 32768] = (i > 0 ? i : -i) / 32768;
			}

			// reset arrays
			let modFilterBands = [];
			let modFilterPostGains = [];
			let heterodynes = [];
			let powers = [];
			let lpFilters = [];
			let lpFilterPostGains = [];
			let bandAnalysers = [];
			let carrierBands = [];
			let carrierFilterPostGains = [];
			let carrierBandGains = [];
			
			for (let i=0; i<numVocoderBands; i++) {
				// CREATE THE MODULATOR CHAIN
				// create the bandpass filter in the modulator chain
				let modulatorFilter = audioContext.createBiquadFilter();
				modulatorFilter.type = "bandpass";	// Bandpass filter
				modulatorFilter.frequency.value = vocoderBands[i].frequency;
				modulatorFilter.Q.value = FILTER_QUALITY; // 	initial quality
				modulatorInput.connect(modulatorFilter);
				modFilterBands.push(modulatorFilter);

				// Now, create a second bandpass filter tuned to the same frequency - 
				// this turns our second-order filter into a 4th-order filter,
				// which has a steeper rolloff/octave
				let secondModulatorFilter = audioContext.createBiquadFilter();
				secondModulatorFilter.type = "bandpass";	// Bandpass filter
				secondModulatorFilter.frequency.value = vocoderBands[i].frequency;
				secondModulatorFilter.Q.value = FILTER_QUALITY; // 	initial quality
				modulatorFilter.chainedFilter = secondModulatorFilter;
				modulatorFilter.connect(secondModulatorFilter);

				// create a post-filtering gain to bump the levels up.
				let modulatorFilterPostGain = audioContext.createGain();
				modulatorFilterPostGain.gain.value = 6;
				secondModulatorFilter.connect(modulatorFilterPostGain);
				modFilterPostGains.push(modulatorFilterPostGain);

				// Create the sine oscillator for the heterodyne
				let heterodyneOscillator = audioContext.createOscillator();
				heterodyneOscillator.frequency.value = vocoderBands[i].frequency;
				heterodyneOscillator.start(0);

				// Create the node to multiply the sine by the modulator
				let heterodyne = audioContext.createGain();
				modulatorFilterPostGain.connect(heterodyne);
				heterodyne.gain.value = 0;	// audio-rate inputs are summed with initial intrinsic value
				heterodyneOscillator.connect(heterodyne.gain);

				let heterodynePostGain = audioContext.createGain();
				heterodynePostGain.gain.value = 2;		// GUESS:  boost
				heterodyne.connect(heterodynePostGain);
				heterodynes.push(heterodynePostGain);

				// Create the rectifier node
				let rectifier = audioContext.createWaveShaper();
				rectifier.curve = rectifierCurve;
				heterodynePostGain.connect(rectifier);

				// Create the lowpass filter to mask off the difference (near zero)
				let lpFilter = audioContext.createBiquadFilter();
				lpFilter.type = "lowpass";	// Lowpass filter
				lpFilter.frequency.value = 5;	// Guesstimate!  Mask off 20Hz and above.
				lpFilter.Q.value = 1;	// don't need a peak
				lpFilters.push(lpFilter);
				rectifier.connect(lpFilter);

				let lpFilterPostGain = audioContext.createGain();
				lpFilterPostGain.gain.value = 1; 
				lpFilter.connect(lpFilterPostGain);
				lpFilterPostGains.push(lpFilterPostGain);

				let waveshaper = audioContext.createWaveShaper();
				waveshaper.curve = waveShaperCurve;
				lpFilterPostGain.connect(waveshaper);

				// create an analyser to drive the vocoder band drawing
				let analyser = audioContext.createAnalyser();
				analyser.fftSize = 128;	//small, shouldn't matter
				waveshaper.connect(analyser);
				bandAnalysers.push(analyser);

				// Create the bandpass filter in the carrier chain
				let carrierFilter = audioContext.createBiquadFilter();
				carrierFilter.type = "bandpass";
				carrierFilter.frequency.value = vocoderBands[i].frequency;
				carrierFilter.Q.value = FILTER_QUALITY;
				carrierBands.push(carrierFilter);
				carrierInput.connect(carrierFilter);

				// We want our carrier filters to be 4th-order filter too.
				let secondCarrierFilter = audioContext.createBiquadFilter();
				secondCarrierFilter.type = "bandpass";	// Bandpass filter
				secondCarrierFilter.frequency.value = vocoderBands[i].frequency;
				secondCarrierFilter.Q.value = FILTER_QUALITY; // 	initial quality
				carrierFilter.chainedFilter = secondCarrierFilter;
				carrierFilter.connect(secondCarrierFilter);

				let carrierFilterPostGain = audioContext.createGain();
				carrierFilterPostGain.gain.value = 10;
				secondCarrierFilter.connect(carrierFilterPostGain);
				carrierFilterPostGains.push(carrierFilterPostGain);

				// Create the carrier band gain node
				let bandGain = audioContext.createGain();
				carrierBandGains.push(bandGain);
				carrierFilterPostGain.connect(bandGain);
				bandGain.gain.value = 0;	// audio-rate inputs are summed with initial intrinsic value
				waveshaper.connect(bandGain.gain);	// connect the lp controller

				bandGain.connect(outputGain);
			}

			// Now set up our wavetable stuff.
			let real = new Float32Array(FOURIER_SIZE);
			let imag = new Float32Array(FOURIER_SIZE);
			real[0] = 0;
			imag[0] = 0;
			for (let i=1; i<FOURIER_SIZE; i++) {
				real[i] = 1;
				imag[i] = 1;
			}

			wavetable = audioContext.createPeriodicWave(real, imag);
			
			// loadNoiseBuffer; create a 5-second buffer of noise
			let lengthInSamples =  5 * audioContext.sampleRate;
			noiseBuffer = audioContext.createBuffer(1, lengthInSamples, audioContext.sampleRate);

			let bufferData = noiseBuffer.getChannelData(0);
			for (let i=0; i<lengthInSamples; ++i) {
				bufferData[i] = 2 * Math.random() - 1;	// -1 to +1
			}
		},

		createCarriersAndPlay(carrierBuffer) {
			carrierSampleNode = audioContext.createBufferSource();
			carrierSampleNode.buffer = carrierBuffer;
			carrierSampleNode.loop = true;

			filters.carrierSampleGain = audioContext.createGain();
			filters.carrierSampleGain.gain.value = carrierSampleGainValue;
			carrierSampleNode.connect(filters.carrierSampleGain);
			filters.carrierSampleGain.connect(carrierInput);

			// The wavetable signal needs a boost.
			wavetableSignalGain = audioContext.createGain();

			filters.oscillatorNode = audioContext.createOscillator();
			filters.oscillatorNode.setPeriodicWave(wavetable);
			wavetableSignalGain.gain.value = WAVETABLEBOOST;

			filters.oscillatorNode.frequency.value = 110;
			filters.oscillatorNode.detune.value = oscillatorDetuneValue;
			filters.oscillatorNode.connect(wavetableSignalGain);

			filters.oscillatorGain = audioContext.createGain();
			filters.oscillatorGain.gain.value = oscillatorGainValue;

			wavetableSignalGain.connect(filters.oscillatorGain);
			filters.oscillatorGain.connect(carrierInput);
			
			noiseNode = audioContext.createBufferSource();
			noiseNode.buffer = noiseBuffer;
			noiseNode.loop = true;
			filters.noiseGain = audioContext.createGain();
			filters.noiseGain.gain.value = noiseGainValue;
			noiseNode.connect(filters.noiseGain);

			filters.noiseGain.connect(carrierInput);
			filters.oscillatorNode.start(0);
			noiseNode.start(0);
			carrierSampleNode.start(0);
		}
	};

	return Vocoder;
})();
