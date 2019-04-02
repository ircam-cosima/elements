# COMO - Elements

##  CoMo Elements allows for creating sound-movement relationshiops using mobiles.

CoMo can be seen as a distributed and interactive machine learning system, using web technologies. It is based on a software ecosystem developed at IRCAM-STMS, using `XMM`, `soundworks`, `waves.js`. The client side allows for recording gestures, recognition, and plays related sounds. The server side performs the training and stores the statistical models.

The server also output the data using OSC (OpenSoundControl), which allows to connect the CoMo-Elements to Max, Pd, Processing, openFrameworks, etc. on the local server.

## Credits

The CoMo ecosystem is developed within the framework of the RAPID-MIX project, an Innovation Action funded by the European Commision (H2020-ICT-2014-1 Project ID 644862). Collective Soundworks is developed in the framework on the CoSiMa project, funded by the French National Research Agency (ANR)

Developers&Researchers: ISMM team @ UMR STMS Ircam - CNRS - UPMC
Benjamin Matuszewski, Joseph Larralde, Norbert Schnell, Frederic Bevilacqua (coordination)
XMM has been developed by Jules Françoise
Thanks to Roland Cahen, Xavier Boissarie, Marion Voillot, Olivier Houix, Anne Dubos, Jan Schacher, Joël Chevrier, Jean-François Jégo, Andrea Cera, Michelle Agnes Magalheas, Bertha Bermudez

## Installation and running

Install Node.js https://nodejs.org/en/

On a terminal, in the Elements folder

`npm install`

Then launch the server on port 80 (default)

`npm run como`

> if some source file is changed (to add an audio file, etc.), restart the server.

## data structures

### Entities

```
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
```

## Player Modules

ProjectChooser
  - switch project

ProjectControl
  - create project
  - machine-learning config
  - preprocessing config
 
RecordingControl
  - record
  - label choice
  - clear (label, model)

AudioControl
  - mute
  - intensity
  - preview

GUIs
  - background-color renderer
  - likelihoods renderer
