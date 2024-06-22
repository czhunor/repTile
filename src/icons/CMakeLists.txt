cmake_minimum_required(VERSION 3.10)

project(reptile)

find_package(ECM REQUIRED NO_MODULE)
set(CMAKE_MODULE_PATH ${ECM_MODULE_PATH})

include(KDEInstallDirs)
include(ECMInstallIcons)

ecm_install_icons(
  ICONS
  22-categories-reptile.png
  24-categories-reptile.png
  32-categories-reptile.png
  48-categories-reptile.png
  64-categories-reptile.png
  DESTINATION
  ${KDE_INSTALL_ICONDIR})