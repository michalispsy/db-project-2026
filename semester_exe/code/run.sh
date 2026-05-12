#!/bin/bash
SCRIPT_PATH=$(realpath "$0")
cd "$(dirname "$SCRIPT_PATH")"

if [[ $EUID -ne 0 ]]; then
    echo "Running server requires sudo to access the MariaDB root unix socket."
    echo "Please enter your password:"
    # Call sudo using the absolute path
    exec sudo "$SCRIPT_PATH" "$@"
fi

echo "Starting Ygeiopolis UI Server on http://localhost:5000"
venv/bin/python3 app.py
