// modules
import AudioTriggerModule from './audio-trigger/AudioTriggerModule';
import AudioRendererModule from './audio-renderer/AudioRendererModule';
import CanvasRendererModule from './canvas-renderer/CanvasRendererModule';
import GestureRecognitionModule from './gesture-recognition/GestureRecognitionModule';
import ProjectParamsControlModule from './project-params-control/ProjectParamsControlModule';
import ProjectManagerModule from './project-manager/ProjectManagerModule';
import StreamSensorsModule from './streams/StreamsModule';
import RecordingControlModule from './recording-control/RecordingControlModule';

// mappings
import LikeliestMapping from './audio-renderer/mappings/LikeliestMapping';
import ProbabilisticMapping from './audio-renderer/mappings/ProbabilisticMapping';

// @note - audio processes are imported in BaseMapping for now
// import EnergyFilter from './audio-renderer/audio-processing/EnergyFilter';
// import FeedbackDelay from './audio-renderer/audio-processing/FeedbackDelay';

