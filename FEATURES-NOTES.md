# Elements - notes / features

- handle several modules that subscribe to the same channels doesn't multiply network traffic
- make the controller a module

## CSS Radios and checkboxes

- https://codepen.io/AngelaVelasquez/pen/Eypnq
- https://codepen.io/bbodine1/pen/novBm

## Feedback from AAD workshop



- import / export project
- import audio file
- create projects
- slider volume par projet / client (`project.params.clientParams`)
- new synths / transition
- use both intensities
- dynamic modules



## NOTES - TBD

### RecordingControlModule 

- AutoTrigger - if record has been launched from the controller, auto 
trigger is still in `off` state and thus cannot trigger the `stop` 
callback, define if it is the desired behavior.

- Should have controller controls on record only if "can record" client
