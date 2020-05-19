#!/bin/bash
set -x
HTTP_PORT=3001 P2P_PORT=6001 npm start &
HTTP_PORT=3002 P2P_PORT=6002 PEERS=ws://localhost:6001 npm start &
sleep(5)
curl -d '{"peerUrl":"http://localhost:6002"}' -H "Content-Type: application/json" -X POST http://localhost:3001/peers/connect