#!/bin/sh

ignore=$(dirname $0)/.rsyncignore
path=$(dirname $0)/..

rsync -avz --exclude-from $ignore $path "$1"@como.ircam.fr:/srv/como/elements