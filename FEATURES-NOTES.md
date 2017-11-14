# Elements - notes / features

## CSS Radios and checkboxes

- https://codepen.io/AngelaVelasquez/pen/Eypnq
- https://codepen.io/bbodine1/pen/novBm

## Features

- mute / sensors at project level (ok)
- slider volume per projet / client (`project.params.clientParams`) - ok
- trigger audio - ok (noise)
- import / export project - 

===================================================================

- alternative autoTrigger with count down
- import audio file
- create projects and associate audio files
- make the controller a module
- new synths / transition
- use both intensities
- dynamic modules



## NOTES - TBD

### RecordingControlModule 

- AutoTrigger - if record has been launched from the controller, auto 
trigger is still in `off` state and thus cannot trigger the `stop` 
callback, define if it is the desired behavior.

- Should have controller controls on record only if "can record" client
