#!/bin/bash

tmux new-session -d -s ngrok -n ngrok
tmux send-keys -t ngrok 'ngrok tcp 22' Enter
tmux attach -t ngrok
