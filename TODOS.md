# Elements - todos

## Features

- dynamically update soundfiles - ok
  + a trained label is removed from model if the soundfile is deleted
  + lost ability to have several soundfiles per label

- trigger with countdown as only possibility - ok
- update mapping behavior - 

- refactor controller using vue.js
- add second xmm instance on client (two models per project)

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


### Errors

ControllerExperience.js:186 Uncaught TypeError: Cannot read property 'uuid' of null
    at ControllerExperience.dispatch (ControllerExperience.js:186)
    at Socket.Emitter.emit (index.js:133)
    at Socket.onevent (socket.js:270)
    at Socket.onpacket (socket.js:228)
    at Manager.<anonymous> (index.js:21)
    at Manager.Emitter.emit (index.js:133)
    at Manager.ondecoded (manager.js:332)
    at Decoder.<anonymous> (index.js:21)
    at Decoder.Emitter.emit (index.js:134)
    at Decoder.add (index.js:246)
