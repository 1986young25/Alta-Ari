#!/usr/bin/env bash

# Kill any existing instances running on ports 5000-5005 & 8080
fuser -k 5000/tcp 5001/tcp 5002/tcp 5003/tcp 5004/tcp 5005/tcp 8080/tcp >/dev/null 2>&1

# 1. Port 5000: Web Audio HUD Visualizer
python3 -c '
from flask import Flask, render_template_string
app = Flask("hud")
@app.route("/")
def index(): return "<h2>AURA HUD Active [Port 5000]</h2>"
app.run(host="0.0.0.0", port=5000)
' &

# 2. Port 5001: RIR Telemetry Engine
python3 -c '
from flask import Flask, jsonify
app = Flask("rir")
@app.route("/stream")
def stream(): return jsonify({"status": "RIR_ACTIVE", "port": 5001})
app.run(host="127.0.0.1", port=5001)
' &

# 3. Port 5002: Spatial DSP Controller
python3 -c '
from flask import Flask, jsonify
app = Flask("dsp")
@app.route("/dsp")
def dsp(): return jsonify({"sub_boost_db": 4.9, "port": 5002})
app.run(host="127.0.0.1", port=5002)
' &

# 4. Port 5003: Ledger Sync Daemon
python3 -c '
from flask import Flask, jsonify
app = Flask("ledger")
@app.route("/ledger")
def ledger(): return jsonify({"ledger_state": "LOCKED", "port": 5003})
app.run(host="127.0.0.1", port=5003)
' &

# 5. Port 5004: Neural Matrix Processing Engine
python3 -c '
from flask import Flask, jsonify
import random
app = Flask("matrix")
@app.route("/api/v2/matrix/state")
def state(): return jsonify({"engine_status": "NEURAL_MATRIX_LOCK_OK", "charge_pC": 21632.78, "port": 5004})
app.run(host="127.0.0.1", port=5004)
' &

# 6. Port 5005: Expanded Acoustic Telemetry Relay
python3 -c '
from flask import Flask, jsonify
app = Flask("relay")
@app.route("/relay")
def relay(): return jsonify({"status": "RELAY_OK", "port": 5005})
app.run(host="127.0.0.1", port=5005)
' &

# Public Gateway: Port 8080
python3 -c '
from flask import Flask, jsonify
app = Flask("gateway")
@app.route("/v1/public/telemetry")
def pub(): return jsonify({"gateway": "ONLINE", "routed_ports": [5000,5001,5002,5003,5004,5005]})
app.run(host="0.0.0.0", port=8080)
' &

sleep 2
echo "=================================================="
echo "[+] ALL SERVICES LAUNCHED ACROSS PORTS 5000-5005"
echo "=================================================="
curl -s http://127.0.0.1:5004/api/v2/matrix/state
echo ""
