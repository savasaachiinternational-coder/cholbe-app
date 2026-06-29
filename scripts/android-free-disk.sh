#!/usr/bin/env bash
set -euo pipefail

echo "Freeing disk space for Android builds..."
bash "$(dirname "$0")/android-clean.sh"

echo "Clearing Gradle transform caches (safe to delete, will re-download)..."
rm -rf "$HOME/.gradle/caches/transforms-"* 2>/dev/null || true
rm -rf "$HOME/.gradle/caches/build-cache-"* 2>/dev/null || true

echo "Disk space after cleanup:"
df -h / | tail -1
