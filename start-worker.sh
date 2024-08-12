#!/bin/bash

tmux new-session -d -s pokemon
tmux send-keys -t pokemon 'cd /home/pi' Enter
tmux send-keys -t pokemon 'cd pokemon-go-forecast-worker' Enter
tmux send-keys -t pokemon 'npm run start' Enter
tmux attach -t pokemon
