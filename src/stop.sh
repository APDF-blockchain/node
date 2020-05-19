#!/bin/bash
set -x
curl  -H "Content-Type: application/json" -X POST http://localhost:3001/stop
sleep 5
curl  -H "Content-Type: application/json" -X POST http://localhost:3002/stop