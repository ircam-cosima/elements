autowatch = 1;

var projects = [];
var players = [];
var vbox;

function setProjects(json) {
  projects = JSON.parse(json);
}

function setPlayers(json) {
  players = JSON.parse(json);
  // _createGui(this.patcher, vbox);

  post(vbox);

  if (vbox) {
    post('remove');
    this.patcher.remove(vbox);
  }

  vbox = this.patcher.newdefault([10, 10, 'patcher']);
  var patcher = vbox.subpatcher();

  var sendOsc = patcher.newdefault([0, 1000, 'send', 'osc']);

  var x = 10;

  for (var i = 0; i < players.length; i++) {
    var player = players[i];
    var y = 10;

    var playerComment = patcher.newdefault([x, y, 'comment']);
    playerComment.set('player: ' + player.index);

    y += 25;

    // mute
    var mute = patcher.newdefault([x, y, 'toggle']);
    var muteComment = patcher.newdefault([x + 50, y, 'comment']);
    muteComment.set('mute');

    var muteOscMsg = patcher.newdefault([x, 1000, 'prepend', '/update-player-param', player.uuid, 'audioRendering.mute']);

    patcher.hiddenconnect(mute, 0, muteOscMsg, 0);
    patcher.hiddenconnect(muteOscMsg, 0, sendOsc, 0);

    y += 25;

    var volume = patcher.newdefault([x, y, 'number']);
    var volumeComment = patcher.newdefault([x + 50, y, 'comment']);
    volumeComment.set('volume');

    var volumeOscMsg = patcher.newdefault([x, 1000, 'prepend', '/update-player-param', player.uuid, 'audioRendering.volume']);

    patcher.hiddenconnect(volume, 0, volumeOscMsg, 0);
    patcher.hiddenconnect(volumeOscMsg, 0, sendOsc, 0);

    y += 25;

    // volume

    for (var j = 0; j < projects.length; j++) {
      var project = projects[j];

      var comment = patcher.newdefault([x + 50, y, 'comment']);
      comment.set('project: ' + project.name);

      var bang = patcher.newdefault([x, y, 'button']);
      y += 25;

      var oscMsg = patcher.newdefault([x, 1000, 'prepend', '/add-player-to-project', player.uuid, project.uuid]);

      patcher.hiddenconnect(bang, 0, oscMsg, 0);
      patcher.connect(oscMsg, 0, sendOsc, 0);
    }

    x += 240;
  }

  // all players to project
  var y = 10;

  for (var j = 0; j < projects.length; j++) {
      var project = projects[j];

      var comment = patcher.newdefault([x + 50, y, 'comment']);
      comment.set('project: ' + project.name);

      var bang = patcher.newdefault([x, y, 'button']);
      y += 25;

      var oscMsg = patcher.newdefault([x, 1000, 'prepend', '/move-all-players-to-project', project.uuid]);

      patcher.hiddenconnect(bang, 0, oscMsg, 0);
      patcher.connect(oscMsg, 0, sendOsc, 0);
    }
}
