#!/usr/bin/env bash
set -euo pipefail

bundle_root="${1:-desktop/src-tauri/target/release/bundle}"
appimage="$(find "$bundle_root/appimage" -maxdepth 1 -type f -name '*.AppImage' -print -quit)"
deb="$(find "$bundle_root/deb" -maxdepth 1 -type f -name '*.deb' -print -quit)"

if [[ -z "$appimage" || -z "$deb" ]]; then
  echo "Expected one AppImage and one Debian package under $bundle_root" >&2
  exit 1
fi

run_gui_smoke() {
  local log_path="$1"
  shift
  set +e
  xvfb-run -a timeout 8s "$@" >"$log_path" 2>&1
  local status=$?
  set -e
  if [[ "$status" -ne 124 ]]; then
    cat "$log_path"
    echo "Packaged desktop application did not remain open for the smoke-test window." >&2
    exit 1
  fi
  cat "$log_path" || true
}

find_database() {
  local data_home="$1"
  local database
  database="$(find "$data_home" -type f -name zcvios.sqlite3 -print -quit)"
  if [[ -z "$database" ]]; then
    echo "No zcvios.sqlite3 database was created under $data_home" >&2
    exit 1
  fi
  printf '%s\n' "$database"
}

set_profile_marker() {
  local database="$1"
  local marker="$2"
  python3 - "$database" "$marker" <<'PY'
import sqlite3
import sys

path, marker = sys.argv[1:]
with sqlite3.connect(path) as connection:
    connection.execute(
        "UPDATE local_profiles SET display_name = ? WHERE id = 'local-owner'",
        (marker,),
    )
    connection.commit()
    row = connection.execute(
        "SELECT display_name FROM local_profiles WHERE id = 'local-owner'"
    ).fetchone()
    if row != (marker,):
        raise SystemExit("Could not persist the package-test profile marker")
PY
}

assert_profile_marker() {
  local database="$1"
  local marker="$2"
  python3 - "$database" "$marker" <<'PY'
import sqlite3
import sys

path, marker = sys.argv[1:]
with sqlite3.connect(path) as connection:
    profile = connection.execute(
        "SELECT display_name FROM local_profiles WHERE id = 'local-owner'"
    ).fetchone()
    migrations = connection.execute(
        "SELECT COUNT(*) FROM migration_history"
    ).fetchone()
    schema_version = connection.execute(
        "SELECT MAX(version) FROM migration_history"
    ).fetchone()

if profile != (marker,):
    raise SystemExit(f"Expected profile marker {marker!r}, received {profile!r}")
if migrations != (1,) or schema_version != (1,):
    raise SystemExit(
        f"Expected one schema-v1 migration, received count={migrations}, max={schema_version}"
    )
PY
}

chmod +x "$appimage"
appimage_data_home="${RUNNER_TEMP:-/tmp}/zcvios-appimage-data"
rm -rf "$appimage_data_home"
mkdir -p "$appimage_data_home"
export XDG_DATA_HOME="$appimage_data_home"
export APPIMAGE_EXTRACT_AND_RUN=1
run_gui_smoke /tmp/zcvios-appimage-first.log "$appimage"
appimage_database="$(find_database "$appimage_data_home")"
set_profile_marker "$appimage_database" "AppImage Persistence Test"
run_gui_smoke /tmp/zcvios-appimage-second.log "$appimage"
assert_profile_marker "$appimage_database" "AppImage Persistence Test"
unset APPIMAGE_EXTRACT_AND_RUN

deb_data_home="${RUNNER_TEMP:-/tmp}/zcvios-deb-data"
deb_install_root="${RUNNER_TEMP:-/tmp}/zcvios-deb-install"
rm -rf "$deb_data_home" "$deb_install_root"
mkdir -p "$deb_data_home" "$deb_install_root"
export XDG_DATA_HOME="$deb_data_home"
dpkg-deb --extract "$deb" "$deb_install_root"
deb_binary="$deb_install_root/usr/bin/zcvios-desktop"
test -x "$deb_binary"
run_gui_smoke /tmp/zcvios-deb-first.log "$deb_binary"
deb_database="$(find_database "$deb_data_home")"
set_profile_marker "$deb_database" "Debian Persistence Test"
rm -rf "$deb_install_root"
test -f "$deb_database"
assert_profile_marker "$deb_database" "Debian Persistence Test"
mkdir -p "$deb_install_root"
dpkg-deb --extract "$deb" "$deb_install_root"
deb_binary="$deb_install_root/usr/bin/zcvios-desktop"
run_gui_smoke /tmp/zcvios-deb-second.log "$deb_binary"
assert_profile_marker "$deb_database" "Debian Persistence Test"

cat >"$bundle_root/persistence-verification.txt" <<EOF_RESULT
PASS: AppImage launch preserved the local-owner profile across restart.
PASS: Removing the extracted Debian application payload preserved zcvios.sqlite3.
PASS: Re-extracting the Debian package reopened the existing profile and schema-v1 migration ledger.
EOF_RESULT

cat "$bundle_root/persistence-verification.txt"
