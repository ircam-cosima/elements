# xmm-soundworks-template

#### about

This project is based on the [soundworks-template](https://github.com/collective-soundworks/soundworks-template)
It is a starting point for the creation of soundworks based projects that use gesture recognition.
The gesture recognition is performed by the [XMM](https://github.com/Ircam-RnD/xmm) library (more specifically
by the [xmm-node](https://github.com/Ircam-RnD/xmm-node) Node.js addon server-side, and by the
[xmm-client](https://github.com/Ircam-RnD/xmm-client) JavaScript library client-side).

##### designer

It features a special page, designer, which provides a simple interface allowing to record gestures
(streams of devicemotion data received from the smartphone's sensors) and train a model in real-time.
A visualization and a sonification of the results help the (human) gesture designer during the training process.
On each operation, the training set used to train the model, and the model itself are updated in real-time, serialized
and saved locally as json files for later reuse.

##### template

The real template (the main page) shows a simple way of reusing the statistical models trained in the designer page.
It includes the same sonification system as in the designer page to show a simple audio example, and allows to send the
classification results as an OpenSoundControl stream.
A Max and a pure-data patches show basic examples of how to use these OSC streams.

#### getting started

When you start with the designer, it first takes you to a login page.
The login you choose will be used as the prefix of your training set and your model's filenames.
Once you're logged in, you are taken to the main designer page.
There, you can notice a dropdown menu that lets you select a label.
Below, a record button allows you to record streams of data.
The send button adds the latest recording to the training set, labelled with the currently
selected label.
If something went wrong with recordings of a certain label, it is possible to delete all the data
related to this label in the training set and the model with the clear model button.
It is also possible to clear everything with the clear model button.

The play sounds button activates the audio players that sonify the classification results.
Each label is associated with a sound file.
One can change the labels and associated sounds in the "src/client/shared/config.js" file.
