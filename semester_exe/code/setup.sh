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

    install_pkg git && \
    install_pkg mariadb-server mariadb && \
    install_pkg mycli && \
    {
        echo " * Registering db command to $TARGET_DIR" && \
        $SUDO_PREFIX mkdir -p "$TARGET_DIR" && \
        $SUDO_PREFIX cp "$0" "$TARGET_DIR/db" && \
        # echo "#!/usr/bin/env bash" | $SUDO_PREFIX tee "$TARGET_DIR/db" > /dev/null && \
        # sed -n /# --- EXECUTION_[S]TART ---/,/# --- EXECUTION_[E]ND ---/p "$0" | $SUDO_PREFIX tee -a "$TARGET_DIR/db" > /dev/null && \
        $SUDO_PREFIX chmod +x "$TARGET_DIR/db"
    } || {
        echo " * Error: Setup failed. Aborting"
        exit 1
    }

    echo " * Setup complete! You can now use the db command"
    echo " * You may delete this setup file now"
    exit 0
fi

# --- SETUP_END ---
# --- EXECUTION_START ---

SUDO_PREFIX=""
[[ $EUID -ne 0 ]] && SUDO_PREFIX="sudo"

if command -v systemctl &> /dev/null && systemctl is-system-running &> /dev/null; then
    if ! systemctl is-active --quiet mariadb; then
        if $SUDO_PREFIX systemctl start mariadb 2>/dev/null; then
            echo " * Started mariadb via systemctl"
        else
            echo " * Warning: Could not start DB"
        fi
    fi
else
    if ! $SUDO_PREFIX service mariadb status &> /dev/null; then
        if $SUDO_PREFIX service mariadb start &> /dev/null; then
            echo " * Started mariadb via service"
        else
            echo " * Warning: Could not start DB"
            exit 1
        fi
    fi
fi

PROJECT_ROOT=$(find "$HOME" -name ".*" -prune -o -type d -path "*/db-project-2026/semester_exe" -printf '%h\n' -quit 2>/dev/null)

if [ ! -d "$PROJECT_ROOT" ]; then
    echo " * Project not found. Cloning"
    git clone https://github.com/michalispsy/db-project-2026 || exit 1
    PROJECT_ROOT="$(pwd)/db-project-2026"
fi

cd "$PROJECT_ROOT/semester_exe/sql" || { echo "Dir not found"; exit 1; }

cmd_prefix=""
if [[ -z "$MY_CNF" || ! -f "$MY_CNF" ]]; then
    if [[ $EUID -ne 0 ]]; then
        sudo -v || exit 1
        cmd_prefix2="sudo -E"
    fi
fi

args1=()
args2=()
[[ -n "$MY_CNF" ]] && args1+=(--defaults-file="$MY_CNF")
[[ -n "$MY_CNF" ]] && args2+=(--defaults-file="$MY_CNF")
[[ -n "$MYCLIRC" ]] && args2+=(--myclirc="$MYCLIRC")

$cmd_prefix mariadb "${args1[@]}" < "install.sql"
$cmd_prefix mariadb "${args1[@]}" < "load.sql"
$cmd_prefix mycli "${args2[@]}" ygeiopolis
