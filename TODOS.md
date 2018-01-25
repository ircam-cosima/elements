# Elements - todos

## Features

### todos

- mappings and synth configuration
- new synths / transitions
  + segment on energy
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
