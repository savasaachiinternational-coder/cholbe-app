#!/usr/bin/env bash
set -euo pipefail

# Export the upload certificate (.pem) for Google Play upload key reset.
# Usage:
#   bash scripts/export-upload-certificate.sh
#
# Output:
#   android/play-store/upload_certificate.pem

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KEYSTORE="${1:-$ROOT/android/app/cholbe-upload.keystore}"
OUT="$ROOT/android/play-store/upload_certificate.pem"

if [[ ! -f "$KEYSTORE" ]]; then
  echo "Keystore not found: $KEYSTORE"
  exit 1
fi

read -r -s -p "Keystore password: " STORE_PASS
echo
read -r -p "Key alias (default: cholbe-upload): " KEY_ALIAS
KEY_ALIAS="${KEY_ALIAS:-cholbe-upload}"

mkdir -p "$(dirname "$OUT")"
keytool -export -rfc \
  -keystore "$KEYSTORE" \
  -alias "$KEY_ALIAS" \
  -file "$OUT" \
  -storepass "$STORE_PASS"

echo
echo "Certificate exported to:"
echo "  $OUT"
echo
echo "Upload this file in Play Console -> Request upload key reset."
