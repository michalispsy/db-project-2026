#!/bin/bash
cd "$(dirname "$0")"

if [[ $EUID -ne 0 ]]; then
    echo "Running server requires sudo to access the MariaDB root unix socket."
    echo "Please enter your password:"
    exec sudo "$0" "$@"
fi

echo "Starting Ygeiopolis UI Server on http://localhost:5000"
venv/bin/python3 app.py
