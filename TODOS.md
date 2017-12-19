# Elements - todos

## Features

### done

- bug - do not allow to create a project with an empty name - _ok_
- stream sensors to osc - _ok_
- stream decoding results [likelihoods, time progression] - _ok_
  => maybe split in 2 different controls?
- preview btn - _ok_
- use intensity to control the cutoff of a filter - _ok_

synths
- Granular synth in SimpleFadeMapping

### todos

- new synths / transitions
  + statistical granular 
  + segment on energy

- `LikeliestMapping`: allow to choose between LoopSynth and GranularSynth from configuration

- configure mapping to choose between LoopSynth and GranularSynth

Vendredi
- alternative autoTrigger with count down - option temps min / max

### later

- import audio files
- create projects and associate audio files

- make the controller a module
- use both intensities
- dynamicaly add and remove modules

## Notes

### RecordingControlModule 

- AutoTrigger - if record has been launched from the controller, auto 
trigger is still in `off` state and thus cannot trigger the `stop` 
callback, define if it is the desired behavior.
