# COMO - Elements

## Launch the server on port 80 (default)

`npm run como`

> if some source file is changed (to add an audio file, etc.), restart the server.

## data structures

### Entities

Player {
  uuid: soundworks.client.uuid
  index: soundworks.client.index
  client: soundworks.client
  params: {
    audio: {
      mute: Boolean,
      intensity: Boolean,
      // preview: Boolean,
    }
    record: {
      state: Enum('idle', 'armed', 'recording', 'pending', 'cancelled', 'confirmed'),
      label: String, // current audio file + ml label
    }
    sensors: {
      stream: Boolean,
    }
    <!-- ui: {
      // to be defined
    } -->
  }
}

Project {
  name: String,
  uuid: String,
  params: {
    clientDefaults: {
      // override and default of `clientParams`
    },
    audio: Object<String, Array>  // audio files of the project
    learning: {
      config: RapidMix JSON Config
      trainingSet: RapidMix JSON TrainingSet
      model: RapidMix JSON Model
    },
    sensorPreprocesssing: {
      <!-- tbd -->

    },
  },

  trainingData: mano.TrainingData
  processor: mano.XmmProcessor
}

## Player Modules

common views
  - project name
  - switch project

modules

ProjectControl
  - create project
  - machine-learning config
  - preprocessing config
 
RecordingControl
  - record
  - label
  - clear (label, model)

AudioControl
  - mute
  - intensity
  - preview

GUIs
  - background-color renderer
  - likelihoods renderer
  - 

## notes

- remove designer
  use 127.0.0.1/#designer and a set of clients presets

- remove ProjectManager service
