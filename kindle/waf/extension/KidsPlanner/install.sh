#!/bin/sh

set -e

APP_ID="com.ivailo.kidsplanner"
WAF_VERSION="1.0.3"
SOURCE="/mnt/us/extensions/KidsPlanner/waf"
DEST="/var/local/mesquite/kidsplanner"
DB="/var/local/appreg.db"
BACKUP="/mnt/us/kidsplanner-appreg.db.backup"
LOG="/mnt/us/kidsplanner-install.log"
INSTALLED="/mnt/us/kidsplanner-install-ok"

if [ "$1" = "install" ]; then
    : > "$LOG"
    rm -f "$INSTALLED"
fi
exec >> "$LOG" 2>&1
echo "Invoked Kids Planner installer: $*"

trap 'mount -o ro,remount / 2>/dev/null || true' EXIT

log() {
    echo "$1"
}

install_waf() {
    log "Starting Kids Planner WAF $WAF_VERSION install"
    [ -f "$SOURCE/config.xml" ] || { log "ERROR: Missing WAF files at $SOURCE"; exit 1; }
    [ -f "$SOURCE/index.html" ] || { log "ERROR: Missing WAF page at $SOURCE/index.html"; exit 1; }
    [ -f "$DB" ] || { log "ERROR: Kindle app registry not found: $DB"; exit 1; }
    [ -x /usr/bin/sqlite3 ] || { log "ERROR: sqlite3 is missing"; exit 1; }

    if [ ! -f "$BACKUP" ]; then
        cp -p "$DB" "$BACKUP"
    fi

    lipc-set-prop com.lab126.appmgrd stop "app://$APP_ID" >/dev/null 2>&1 || true
    mount -o rw,remount / || { echo "Could not remount Kindle system storage read/write"; exit 1; }
    log "Copying WAF files to $DEST"
    mkdir -p "$DEST"
    cp -f "$SOURCE/config.xml" "$DEST/config.xml"
    cp -f "$SOURCE/index.html" "$DEST/index.html"
    chmod 644 "$DEST/config.xml" "$DEST/index.html"

    /usr/bin/sqlite3 "$DB" <<SQL
INSERT OR IGNORE INTO handlerIds (handlerId) VALUES ('$APP_ID');
INSERT OR IGNORE INTO interfaces (interface) VALUES ('application');
INSERT OR REPLACE INTO properties (handlerId, name, value)
    VALUES ('$APP_ID', 'lipcId', '$APP_ID');
INSERT OR REPLACE INTO properties (handlerId, name, value)
    VALUES ('$APP_ID', 'command', '/usr/bin/mesquite -l $APP_ID -c file://$DEST/');
INSERT OR REPLACE INTO properties (handlerId, name, value)
    VALUES ('$APP_ID', 'supportedOrientation', 'URL');
INSERT OR REPLACE INTO associations (handlerId, interface, contentId, defaultAssoc)
    VALUES ('$APP_ID', 'application', 'none', 'false');
SQL
    [ -f "$DEST/index.html" ] || { log "ERROR: WAF page was not copied"; exit 1; }
    REGISTERED_COMMAND=$(/usr/bin/sqlite3 "$DB" "SELECT value FROM properties WHERE handlerId='$APP_ID' AND name='command';")
    [ "$REGISTERED_COMMAND" = "/usr/bin/mesquite -l $APP_ID -c file://$DEST/" ] || { log "ERROR: WAF app registration did not persist"; exit 1; }
    mount -o ro,remount / || true
    echo "$APP_ID $WAF_VERSION" > "$INSTALLED"
    log "SUCCESS: Kids Planner WAF $WAF_VERSION installed; landscape/fullscreen requested. Use Launch Kids Planner to open it."
}

launch_waf() {
    if [ ! -f "$DEST/config.xml" ]; then
        install_waf
    fi
    lipc-set-prop com.lab126.winmgr orientationLock L
    lipc-set-prop com.lab126.appmgrd start "app://$APP_ID"
    log "Launch requested for Kids Planner WAF $WAF_VERSION in landscape/fullscreen mode"
}

case "$1" in
    install) install_waf ;;
    launch) launch_waf ;;
    *) echo "Usage: $0 {install|launch}"; exit 2 ;;
esac
