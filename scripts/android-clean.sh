#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ANDROID_DIR="$ROOT/android"

echo "Stopping Gradle daemons..."
(cd "$ANDROID_DIR" && ./gradlew --stop) 2>/dev/null || true

echo "Removing stale Gradle locks and build output..."
rm -rf \
  "$ANDROID_DIR/.gradle/buildOutputCleanup" \
  "$ANDROID_DIR/.gradle/9.3.1/executionHistory" \
  "$ANDROID_DIR/app/build" \
  "$ANDROID_DIR/app/.cxx" \
  "$ANDROID_DIR/build"

echo "Cleaning native module Android build caches..."
find "$ROOT/node_modules" -type d -name build -path '*/android/build' -prune -exec rm -rf {} + 2>/dev/null || true
find "$ROOT/node_modules" -type d -name .cxx -path '*/android/.cxx' -prune -exec rm -rf {} + 2>/dev/null || true

echo "Android clean complete."
