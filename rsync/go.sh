#!/bin/sh

gitignore=$(dirname $0)/.rsyncignore
comopath=$(dirname $0)/..

rsync -avz --exclude-from $gitignore $comopath "$1"@como.ircam.fr:/srv/como/elements