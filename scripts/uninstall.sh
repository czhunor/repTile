#!/usr/bin/env sh

# Exit if some error happens
set -e

echo "Uninstalling icons.."

sudo xargs --no-run-if-empty rm < "build/install_manifest.txt"

echo "Done."