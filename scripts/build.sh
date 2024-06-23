#!/usr/bin/env sh

# Exit if some error happens
set -e

echo "Building icons.."

cmake -S src/icons/ -B build
cmake --build build

echo "Done."