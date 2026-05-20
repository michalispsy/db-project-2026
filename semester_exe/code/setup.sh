#!/usr/bin/env bash

TARGET_DIR="/usr/local/bin"
TARGET_PATH="$TARGET_DIR/db"

if [[ "$0" != "$TARGET_DIR/db" ]]; then

    SUDO_PREFIX=""
    if [[ $EUID -ne 0 ]]; then
        echo " * User is not root. entering sudo mode"
        sudo -v || exit 1
        SUDO_PREFIX="sudo"
    fi

    echo " * Setup file detected. Preparing environment"
    install_pkg() {
        local pkg=$1
        local cmd=${2:-$1}
        if [ -z "$pkg" ]; then
            echo " * Error: No command or package name provided"
            return 1
        fi
        if ! command -v "$cmd" &> /dev/null; then
            echo " * Installing $pkg"
            if command -v apt &> /dev/null; then
                $SUDO_PREFIX apt update && $SUDO_PREFIX apt install -y "$pkg"
            elif command -v dnf &> /dev/null; then
                $SUDO_PREFIX dnf install -y "$pkg"
            elif command -v pacman &> /dev/null; then
                yay -S --noconfirm "$pkg"
            else
                echo " * Error: Package manager not found" && return 1
            fi
            # else
            #     echo " * $cmd is already installed (via $pkg)"
        fi
    }

    if [[ -f "$TARGET_PATH" ]]; then
        echo -n " * Warning:  already exists. Overwrite? (Y/n): "
        read -r response
        if [[ "$response" =~ [Nn]$ ]]; then
            echo " * Aborting setup"
            exit 0
        fi
    fi

    install_pkg mariadb-server mariadb && \
    {
        echo " * Registering db command to $TARGET_DIR" && \
        $SUDO_PREFIX mkdir -p "$TARGET_DIR" && \
        $SUDO_PREFIX cp "$0" "$TARGET_DIR/db" && \
        $SUDO_PREFIX chmod +x "$TARGET_DIR/db"
    } || {
        echo " * Error: Setup failed. Aborting"
        exit 1
    }

    echo " * Setup complete! You can now use the db command"
    exit 0
fi

# --- SETUP_END ---
# --- EXECUTION_START ---

if [ -z "$SUDO_PREFIX" ]; then
    if command -v sudo >/dev/null 2>&1; then
        SUDO_PREFIX="sudo"
    else
        SUDO_PREFIX=""
    fi
fi

if [ ! -d "/run/mysqld" ]; then
    $SUDO_PREFIX mkdir -p /run/mysqld
    $SUDO_PREFIX chown mysql:mysql /run/mysqld >/dev/null 2>&1 || true
fi

if [ -d /run/systemd/system ]; then
    if ! systemctl is-active --quiet mariadb; then
        if $SUDO_PREFIX systemctl start mariadb; then
            echo " * Started mariadb via systemctl"
        else
            echo " * Error: systemctl failed to start mariadb"
            exit 1
        fi
    fi
else
    if ! $SUDO_PREFIX service mariadb status >/dev/null 2>&1; then
        if $SUDO_PREFIX service mariadb start >/dev/null 2>&1; then
            echo " * Started mariadb via service"
        else
            echo " * Error: Could not start DB via service fallback"
            exit 1
        fi
    fi
fi

PROJECT_ROOT=$(find "$HOME" -name ".*" -prune -o -type d -path "*/db-project-2026/semester_exe" -printf '%h\n' -quit 2>/dev/null)

cd "$PROJECT_ROOT/semester_exe" || { echo "Dir not found"; exit 1; }

cmd_prefix=""
if [[ -z "$MY_CNF" || ! -f "$MY_CNF" ]]; then
    if [[ $EUID -ne 0 ]]; then
        sudo -v || exit 1
        cmd_prefix="sudo -E"
    fi
fi

[[ -n "$MY_CNF" ]] && args+=(--defaults-file="$MY_CNF")

$cmd_prefix mariadb "${args[@]}" < "sql/install.sql"
$cmd_prefix mariadb "${args[@]}" < "sql/load.sql"
$cmd_prefix mariadb "${args[@]}" ygeiopolis
