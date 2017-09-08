# COMO - Elements

## Launch the server on port 80 (default)

`npm run como`

> if some source file is changed (to add an audio file, etc.), restart the server.

## Clients

- '/' - simple player
- `/designer` - gesture designer
- `/designer#stream` - stream sensors to `visualizer` and Max
- `/visualizer` - display designer sensors if streamed, and R-ioT from Max

> a minimal example patch is in `/max/comm.maxpat`

## Todos

- 2 alternative login services:
  * simple login, only check unique username
  * online service - use como.ircam.fr/user
    implement REST API for user gestion
