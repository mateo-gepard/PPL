#!/bin/bash
# SkyLab — PPL Aerodynamik. Doppelklick startet den lokalen Server + Browser.
cd "$(dirname "$0")"
PORT=8755
# Falls Port belegt: vorhandenen Server beenden
lsof -ti tcp:$PORT | xargs kill -9 2>/dev/null
echo "Starte SkyLab auf http://localhost:$PORT ..."
( sleep 1; open "http://localhost:$PORT" ) &
python3 -m http.server $PORT
