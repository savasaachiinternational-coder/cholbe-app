#!/usr/bin/env bash
set -euo pipefail

# Verify which Android upload keystore matches Google Play Console.
# Usage:
#   bash scripts/verify-upload-keystore.sh path/to/your.keystore
#
# Play Console expected SHA1 for Cholbe:
#   58:21:B2:DA:39:3B:83:25:CA:01:63:FF:15:3A:8C:91:06:4A:FF:2A

EXPECTED_SHA1="58:21:B2:DA:39:3B:83:25:CA:01:63:FF:15:3A:8C:91:06:4A:FF:2A"
KEYSTORE="${1:-android/app/cholbe-upload.keystore}"

if [[ ! -f "$KEYSTORE" ]]; then
  echo "Keystore not found: $KEYSTORE"
  exit 1
fi

echo "Checking: $KEYSTORE"
echo "Expected Play upload SHA1: $EXPECTED_SHA1"
echo

read -r -s -p "Keystore password: " STORE_PASS
echo
read -r -p "Key alias (default: cholbe-upload): " KEY_ALIAS
KEY_ALIAS="${KEY_ALIAS:-cholbe-upload}"

SHA1="$(
  keytool -list -v \
    -keystore "$KEYSTORE" \
    -alias "$KEY_ALIAS" \
    -storepass "$STORE_PASS" 2>/dev/null | awk -F': ' '/SHA1:/ {print $2; exit}'
)"

if [[ -z "${SHA1:-}" ]]; then
  echo "Could not read keystore. Check password and alias."
  exit 1
fi

echo "Found SHA1: $SHA1"
echo

if [[ "$SHA1" == "$EXPECTED_SHA1" ]]; then
  echo "MATCH — use this keystore in android/keystore.properties, then run:"
  echo "  npm run build:bundle"
  exit 0
fi

echo "MISMATCH — this is NOT the Play Store upload key."
echo "Find the original keystore from your first Play Store release,"
echo "or request an upload key reset in Play Console:"
echo "  Setup -> App signing -> Request upload key reset"
