#!/usr/bin/env bash
# Keep Agora screen-sharing out of Android builds (Play FGS media-projection).
set -euo pipefail
FILE="node_modules/react-native-agora/android/build.gradle"
if [[ ! -f "$FILE" ]]; then
  exit 0
fi
if grep -q "implementation 'io.agora.rtc:full-screen-sharing:" "$FILE"; then
  perl -i -0pe "s/implementation 'io.agora.rtc:full-screen-sharing:[^']+'\n/\/\/ Screen sharing disabled for Cholbe Play release\n\/\/ implementation 'io.agora.rtc:full-screen-sharing:REMOVED'\n/" "$FILE"
  echo "Patched Agora: removed full-screen-sharing dependency"
fi
