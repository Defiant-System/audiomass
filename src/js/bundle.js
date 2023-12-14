
// https://unpkg.com/wavesurfer.js@7.5.2/

import WaveSurfer from "./modules/wavesurfer/wavesurfer.esm.js";
import RegionsPlugin from "./modules/wavesurfer/plugin-regions.esm.js";
import TimelinePlugin from "./modules/wavesurfer/plugin-timeline.esm.js";
import Minimap from "./modules/wavesurfer/plugin-minimap.esm.js";
import EnvelopePlugin from "./modules/wavesurfer/plugin-envelope.esm.js";
import Spectrogram from "./modules/wavesurfer/plugin-spectrogram.esm.js";
import RecordPlugin from "./modules/wavesurfer/plugin-record.esm.js";
import ZoomPlugin from "./modules/wavesurfer/plugin-zoom.esm.js";

import AudioMotionAnalyzer from "./modules/audio-motion/audio-motion-analyzer.js";

module.exports = {
	WaveSurfer,
	RegionsPlugin,
	TimelinePlugin,
	Minimap,
	EnvelopePlugin,
	Spectrogram,
	RecordPlugin,
	ZoomPlugin,
	AudioMotionAnalyzer,
};
