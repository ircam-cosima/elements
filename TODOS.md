# Elements - todos

## Features

- bug - do not allow to create a project with an empty name
- stream results [likelihoods, time progression]
- stream sensors and likelihoods to osc 
- preview btn
- new synths / transitions
  + statistical granular 
  + segment on energy
- use intensity to control the cutoff of a filter
- alternative autoTrigger with count down - option temps min / max

- import audio file
- create projects and associate audio files

- make the controller a module
- use both intensities
- dynamicaly add and remove modules

## Notes

### RecordingControlModule 

- AutoTrigger - if record has been launched from the controller, auto 
trigger is still in `off` state and thus cannot trigger the `stop` 
callback, define if it is the desired behavior.
