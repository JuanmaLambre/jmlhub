#!/bin/bash

REPO=$1     # 'https://github.com/JuanmaLambre/ping'
BRANCH=$2   # 'master'
START_CMD=$3    # 'python ping.py'

SLEEP_TIME=60

REPONAME=$(echo $REPO | cut -d/ -f5)
REPO_REGEX='^https?://[a-z_]+\.[a-z]+/[A-Za-z0-9_\-]+/[A-Za-z0-9_\-]+/?$'
SERV_PID='0'


function start_cmd() {
    $START_CMD &
    SERV_PID=$!
    echo PID $SERV_PID
}


if ! [[ $REPO =~ $REPO_REGEX ]]; then
    echo Repository $REPO doesnt match regex $REPO_REGEX
    exit 1
fi

rm -rf $REPONAME

git clone $REPO
cd $REPONAME
start_cmd
cd ..
while sleep $SLEEP_TIME; do
    cd $REPONAME

    if [[ $(git fetch origin; git diff origin/$BRANCH | wc -c) > 0 ]]; then
        git pull origin $BRANCH
        [[ $(ps -eo pid | grep $SERV_PID) ]] && kill -9 $SERV_PID
        start_cmd
    fi

    cd ..
done

