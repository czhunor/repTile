#!/usr/bin/env sh

# Exit if some error happens
set -e

file_path="/usr/share/icons/hicolor/22x22/categories/reptile.png"

if [ ! -e "$file_path" ]; then
    echo "Installing icons.."

    sudo cmake --install build

    echo "Done."
else 
    echo "Icons already installed, nothing to do."
fi