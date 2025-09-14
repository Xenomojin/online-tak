#!/bin/bash

echo "const GAME_LOGIC = \`$(tar -c Tak.py TakController.py Team.py | base64)\`;" > game_logic.js
