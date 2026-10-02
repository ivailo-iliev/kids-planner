#!/bin/sh

set -e

APP_ID="com.ivailo.kidsplanner"
SOURCE="/mnt/us/extensions/KidsPlanner/waf"
DEST="/var/local/mesquite/kidsplanner"
DB="/var/local/appreg.db"
BACKUP="/mnt/us/kidsplanner-appreg.db.backup"

trap 'mount -o ro,remount / 2>/dev/null || true' EXIT

install_waf() {
    [ -f "$SOURCE/config.xml" ] || { echo "Missing WAF files at $SOURCE"; exit 1; }
    [ -f "$DB" ] || { echo "Kindle app registry not found: $DB"; exit 1; }
    [ -x /usr/bin/sqlite3 ] || { echo "sqlite3 is missing"; exit 1; }

    if [ ! -f "$BACKUP" ]; then
        cp -p "$DB" "$BACKUP"
    fi

    mount -o rw,remount / || { echo "Could not remount Kindle system storage read/write"; exit 1; }
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
    VALUES ('$APP_ID', 'supportedOrientation', 'U');
INSERT OR REPLACE INTO associations (handlerId, interface, contentId, defaultAssoc)
    VALUES ('$APP_ID', 'application', 'none', 'false');
SQL
    mount -o ro,remount / || true
    echo "Kids Planner WAF installed. Use Launch Kids Planner to open it."
}

launch_waf() {
    if [ ! -f "$DEST/config.xml" ]; then
        install_waf
    fi
    lipc-set-prop com.lab126.appmgrd start "app://$APP_ID"
}

case "$1" in
    install) install_waf ;;
    launch) launch_waf ;;
    *) echo "Usage: $0 {install|launch}"; exit 2 ;;
esac
