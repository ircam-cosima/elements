
#### 'list-project'

```
request {
  type: 'list-project'
  payload: null,
}

dispatch {
  type: 'list-project',
  payload: {
    overview: ProjectCollection.overview(),
    details: ProjectCollection.serialize(),
  },
}
```

#### 'list-project-overview'

```
request: {
  type: 'list-project-overview',
  payload: null,
}

dispatch: {
  type: 'list-project-overview',
  payload: ProjectCollection.overview(),
}
```

### 'add-player-to-project'

```
request {
  type: 'add-player-to-project',
  payload: {
    playerUuid: player.uuid,
    projectUuid: project.uuid,
  }
}

dispatch {
  type: 'add-player-to-project',
  payload: {
    player: player.serialize(),
    project: project.serialize(),
  }
}
```

### 'remove-player-from-project'

```
request {
  type: 'remove-player-from-project',
  payload: {
    playerUuid: player.uuid,
    projectUuid: project.uuid,
  }
}

dispatch {
  player: player.serialize(),
  project: project.serialize(),
}
```


update-client-params (request, dispatch)















