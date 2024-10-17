#!/bin/bash

tmux new-session -d -s pokemon /bin/bash
tmux send-keys -t pokemon 'cd $HOME' Enter
tmux send-keys -t pokemon 'cd pokemon-go-forecast-worker' Enter
tmux send-keys -t pokemon 'npm run start' Enter
tmux attach -t pokemon
