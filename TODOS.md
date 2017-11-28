# Elements - todos

## Features

- stream sensors to osc 
- preview btn
- alternative autoTrigger with count down
- import audio file
- create projects and associate audio files
- make the controller a module
- new synths / transitions
- use both intensities
- dynamicaly add and remove modules

## Notes

### RecordingControlModule 

- AutoTrigger - if record has been launched from the controller, auto 
trigger is still in `off` state and thus cannot trigger the `stop` 
callback, define if it is the desired behavior.
