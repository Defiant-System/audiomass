
let Vocoder = {
	init(audioContext) {
		this.audioContext = audioContext;
		this.FILTER_QUALITY = 6;

		this.generateBands(55, 7040, 14);
		// Set up the vocoder chains
		this.initBandpassFilters();
	},

	start() {
		this.createCarriersAndPlay(carrierInput);

		this._vocoding = true;

		let modulatorNode = this.audioContext.createBufferSource();
		modulatorNode.buffer = modulatorBuffer;
		let modulatorGain = this.audioContext.createGain();
		modulatorGain.gain.value = modulatorGainValue;
		modulatorNode.connect( modulatorGain );
		modulatorGain.connect( modulatorInput );
		modulatorNode.start(0);

		this.modulatorNode = modulatorNode;
		this.modulatorGain = modulatorGain;
	},

	stop() {
		if (modulatorNode) modulatorNode.stop(0);
		this._vocoding = false;
		liveInput = false;
	},

	// this function will algorithmically re-calculate vocoder bands, distributing evenly
	// from startFreq to endFreq, splitting evenly (logarhythmically) into a given numBands.
	// The function places this info into the global vocoderBands and numVocoderBands variables.
	generateBands(startFreq, endFreq, numBands) {
		// Remember: 1200 cents in octave, 100 cents per semitone
		let totalRangeInCents = 1200 * Math.log( endFreq / startFreq ) / Math.LN2;
		let centsPerBand = totalRangeInCents / numBands;
		let scale = Math.pow( 2, centsPerBand / 1200 );  // This is the scaling for successive bands
		let vocoderBands = new Array();
		let currentFreq = startFreq;

		for (let i=0; i<numBands; i++) {
			vocoderBands[i] = new Object();
			vocoderBands[i].frequency = currentFreq;
			currentFreq = currentFreq * scale;
		}

		numVocoderBands = numBands;
	},

	// When this function is called, the carrierNode and modulatorAnalyser 
	// may not already be created.  Create placeholder nodes for them.
	initBandpassFilters() {
		modulatorInput = this.audioContext.createGain();
		carrierInput = this.audioContext.createGain();

		if (modFilterBands == null) modFilterBands = new Array();
		if (modFilterPostGains == null) modFilterPostGains = new Array();
		if (heterodynes == null) heterodynes = new Array();
		if (powers == null) powers = new Array();
		if (lpFilters == null) lpFilters = new Array();
		if (lpFilterPostGains == null) lpFilterPostGains = new Array();
		if (bandAnalysers == null) bandAnalysers = new Array();
		if (carrierBands == null) carrierBands = new Array();
		if (carrierFilterPostGains == null) carrierFilterPostGains = new Array();
		if (carrierBandGains == null) carrierBandGains = new Array();

		var waveShaperCurve = new Float32Array(65536);
		// Populate with a "curve" that does an abs()
		var n = 65536;
		var n2 = n / 2;
		
		for (var i = 0; i < n2; ++i) {
			x = i / n2;
			waveShaperCurve[n2 + i] = x;
			waveShaperCurve[n2 - i - 1] = x;
		}
		
		// Set up a high-pass filter to add back in the fricatives, etc.
		// (this isn't used by default in the "production" version, as I hid the slider)
		var hpFilter = this.audioContext.createBiquadFilter();
		hpFilter.type = "highpass";
		hpFilter.frequency.value = 8000; // or use vocoderBands[numVocoderBands-1].frequency;
		hpFilter.Q.value = 1; // 	no peaking
		modulatorInput.connect( hpFilter);

		hpFilterGain = this.audioContext.createGain();
		hpFilterGain.gain.value = 0.0;

		hpFilter.connect( hpFilterGain );
		hpFilterGain.connect( this.audioContext.destination );

		//clear the arrays
		modFilterBands.length = 0;
		modFilterPostGains.length = 0;
		heterodynes.length = 0;
		powers.length = 0;
		lpFilters.length = 0;
		lpFilterPostGains.length = 0;
		carrierBands.length = 0;
		carrierFilterPostGains.length = 0;
		carrierBandGains.length = 0;
		bandAnalysers.length = 0;

		var outputGain = this.audioContext.createGain();
		outputGain.connect(this.audioContext.destination);

		var rectifierCurve = new Float32Array(65536);
		for (var i=-32768; i<32768; i++)
			rectifierCurve[i+32768] = ((i>0)?i:-i)/32768;

		for (var i=0; i<numVocoderBands; i++) {
			// CREATE THE MODULATOR CHAIN
			// create the bandpass filter in the modulator chain
			var modulatorFilter = this.audioContext.createBiquadFilter();
			modulatorFilter.type = "bandpass";	// Bandpass filter
			modulatorFilter.frequency.value = vocoderBands[i].frequency;
			modulatorFilter.Q.value = FILTER_QUALITY; // 	initial quality
			modulatorInput.connect( modulatorFilter );
			modFilterBands.push( modulatorFilter );

			// Now, create a second bandpass filter tuned to the same frequency - 
			// this turns our second-order filter into a 4th-order filter,
			// which has a steeper rolloff/octave
			var secondModulatorFilter = this.audioContext.createBiquadFilter();
			secondModulatorFilter.type = "bandpass";	// Bandpass filter
			secondModulatorFilter.frequency.value = vocoderBands[i].frequency;
			secondModulatorFilter.Q.value = FILTER_QUALITY; // 	initial quality
			modulatorFilter.chainedFilter = secondModulatorFilter;
			modulatorFilter.connect( secondModulatorFilter );

			// create a post-filtering gain to bump the levels up.
			var modulatorFilterPostGain = this.audioContext.createGain();
			modulatorFilterPostGain.gain.value = 6;
			secondModulatorFilter.connect( modulatorFilterPostGain );
			modFilterPostGains.push( modulatorFilterPostGain );

			// Create the sine oscillator for the heterodyne
			var heterodyneOscillator = this.audioContext.createOscillator();
			heterodyneOscillator.frequency.value = vocoderBands[i].frequency;

			heterodyneOscillator.start(0);

			// Create the node to multiply the sine by the modulator
			var heterodyne = this.audioContext.createGain();
			modulatorFilterPostGain.connect( heterodyne );
			heterodyne.gain.value = 0.0;	// audio-rate inputs are summed with initial intrinsic value
			heterodyneOscillator.connect( heterodyne.gain );

			var heterodynePostGain = this.audioContext.createGain();
			heterodynePostGain.gain.value = 2.0;		// GUESS:  boost
			heterodyne.connect( heterodynePostGain );
			heterodynes.push( heterodynePostGain );

			// Create the rectifier node
			var rectifier = this.audioContext.createWaveShaper();
			rectifier.curve = rectifierCurve;
			heterodynePostGain.connect( rectifier );

			// Create the lowpass filter to mask off the difference (near zero)
			var lpFilter = this.audioContext.createBiquadFilter();
			lpFilter.type = "lowpass";	// Lowpass filter
			lpFilter.frequency.value = 5.0;	// Guesstimate!  Mask off 20Hz and above.
			lpFilter.Q.value = 1;	// don't need a peak
			lpFilters.push( lpFilter );
			rectifier.connect( lpFilter );

			var lpFilterPostGain = this.audioContext.createGain();
			lpFilterPostGain.gain.value = 1.0; 
			lpFilter.connect( lpFilterPostGain );
			lpFilterPostGains.push( lpFilterPostGain );

			var waveshaper = this.audioContext.createWaveShaper();
			waveshaper.curve = waveShaperCurve;
			lpFilterPostGain.connect( waveshaper );

			// create an analyser to drive the vocoder band drawing
			var analyser = this.audioContext.createAnalyser();
			analyser.fftSize = 128;	//small, shouldn't matter
			waveshaper.connect(analyser);
			bandAnalysers.push( analyser );

			// Create the bandpass filter in the carrier chain
			var carrierFilter = this.audioContext.createBiquadFilter();
			carrierFilter.type = "bandpass";
			carrierFilter.frequency.value = vocoderBands[i].frequency;
			carrierFilter.Q.value = FILTER_QUALITY;
			carrierBands.push( carrierFilter );
			carrierInput.connect( carrierFilter );

			// We want our carrier filters to be 4th-order filter too.
			var secondCarrierFilter = this.audioContext.createBiquadFilter();
			secondCarrierFilter.type = "bandpass";	// Bandpass filter
			secondCarrierFilter.frequency.value = vocoderBands[i].frequency;
			secondCarrierFilter.Q.value = FILTER_QUALITY; // 	initial quality
			carrierFilter.chainedFilter = secondCarrierFilter;
			carrierFilter.connect( secondCarrierFilter );

			var carrierFilterPostGain = this.audioContext.createGain();
			carrierFilterPostGain.gain.value = 10.0;
			secondCarrierFilter.connect( carrierFilterPostGain );
			carrierFilterPostGains.push( carrierFilterPostGain );

			// Create the carrier band gain node
			var bandGain = this.audioContext.createGain();
			carrierBandGains.push( bandGain );
			carrierFilterPostGain.connect( bandGain );
			bandGain.gain.value = 0.0;	// audio-rate inputs are summed with initial intrinsic value
			waveshaper.connect( bandGain.gain );	// connect the lp controller

			bandGain.connect( outputGain );
		}

		// Now set up our wavetable stuff.
		var real = new Float32Array(FOURIER_SIZE);
		var imag = new Float32Array(FOURIER_SIZE);
		real[0] = 0.0;
		imag[0] = 0.0;
		for (var i=1; i<FOURIER_SIZE; i++) {
			real[i]=1.0;
			imag[i]=1.0;
		}

		wavetable = this.audioContext.createPeriodicWave
					? this.audioContext.createPeriodicWave(real, imag)
					: this.audioContext.createWaveTable(real, imag);
		
		// loadNoiseBuffer; create a 5-second buffer of noise
		let lengthInSamples =  5 * this.audioContext.sampleRate;
		noiseBuffer = this.audioContext.createBuffer(1, lengthInSamples, this.audioContext.sampleRate);

		let bufferData = noiseBuffer.getChannelData(0);
		for (let i = 0; i < lengthInSamples; ++i) {
			bufferData[i] = (2*Math.random() - 1);	// -1 to +1
		}
	},

	createCarriersAndPlay(output) {
		carrierSampleNode = this.audioContext.createBufferSource();
		carrierSampleNode.buffer = carrierBuffer;
		carrierSampleNode.loop = true;

		carrierSampleGain = this.audioContext.createGain();
		carrierSampleGain.gain.value = carrierSampleGainValue;
		carrierSampleNode.connect( carrierSampleGain );
		carrierSampleGain.connect( output );

		// The wavetable signal needs a boost.
		wavetableSignalGain = this.audioContext.createGain();

		oscillatorNode = this.audioContext.createOscillator();
		if (oscillatorType = 4)	{ // wavetable
			oscillatorNode.setPeriodicWave ? 
			oscillatorNode.setPeriodicWave(wavetable) :
			oscillatorNode.setWaveTable(wavetable);
			wavetableSignalGain.gain.value = WAVETABLEBOOST;
		} else {
			oscillatorNode.type = oscillatorType;
			wavetableSignalGain.gain.value = SAWTOOTHBOOST;
		}
		oscillatorNode.frequency.value = 110;
		oscillatorNode.detune.value = oscillatorDetuneValue;
		oscillatorNode.connect(wavetableSignalGain);

		oscillatorGain = this.audioContext.createGain();
		oscillatorGain.gain.value = oscillatorGainValue;

		wavetableSignalGain.connect(oscillatorGain);
		oscillatorGain.connect(output);
		
		noiseNode = this.audioContext.createBufferSource();
		noiseNode.buffer = noiseBuffer;
		noiseNode.loop = true;
		noiseGain = this.audioContext.createGain();
		noiseGain.gain.value = noiseGainValue;
		noiseNode.connect(noiseGain);

		noiseGain.connect(output);
		oscillatorNode.start(0);
		noiseNode.start(0);
		carrierSampleNode.start(0);
	}
};
