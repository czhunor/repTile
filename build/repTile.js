(() => {
  // src/script/tiling/configuration.mjs
  var Position = { Left: "left", Right: "right" };
  var Configuration = class {
    constructor() {
      this.rootWindowDefaultSizeInPercentage = 0.65;
      this.rootWindowPosition = Position.Right;
      this.padding = 10;
      this.ignoreList = [
        "krunner",
        "yakuake",
        "spectacle",
        "plasmashell",
        ""
        // Needed for dummy windows
      ];
      this.registerAsRoot = ["vscodium", "codium", "code", "brave-browser"];
      this.isTilingEnabled = true;
      this.isLoggingEnabled = true;
    }
  };

  // src/script/extern/kwin.mjs
  var MaximizeMode = { Maximized: 3, Normal: 0 };
  var KWinLog = class {
    /**
     * @param {Configuration} knwinConfiguration
     */
    constructor(knwinConfiguration2) {
      this.globalConfiguration = knwinConfiguration2;
    }
    printMessage(sMessage) {
      if (this.globalConfiguration.isLoggingEnabled) {
        print("repTile: " + sMessage);
      }
    }
  };
  var KWinWrapper = class {
    // --- WORKSPACE API
    getActiveScreen() {
      return workspace.activeScreen;
    }
    getActiveScreenWidth() {
      return workspace.clientArea(
        KWin.PlacementArea,
        workspace.activeScreen,
        workspace.currentDesktop
      ).width;
    }
    getActiveScreenHeight() {
      return workspace.clientArea(
        KWin.PlacementArea,
        workspace.activeScreen,
        workspace.currentDesktop
      ).height;
    }
    getActiveScreenXPos() {
      return workspace.clientArea(
        KWin.PlacementArea,
        workspace.activeScreen,
        workspace.currentDesktop
      ).x;
    }
    getActiveScreenYPos() {
      return workspace.clientArea(
        KWin.PlacementArea,
        workspace.activeScreen,
        workspace.currentDesktop
      ).y;
    }
    getCurrentDesktop() {
      return workspace.currentDesktop;
    }
    // --- WINDOW API
    setWindowPosition(kwinWindow, x, y, width, height) {
      kwinWindow.frameGeometry = {
        x,
        y,
        width,
        height
      };
    }
    /**
     *
     * @param {*} kwinWindow
     * @returns {*} An Object with the following parameters: x, y, width ,height
     */
    getWindowPosition(kwinWindow) {
      return kwinWindow.frameGeometry;
    }
    getWindowDesktop(kwinWindow) {
      return kwinWindow.desktops[0];
    }
    getWindowResourceName(kwinWindow) {
      return kwinWindow.resourceName;
    }
    getWindowInternalId(kwinWindow) {
      return kwinWindow.internalId;
    }
    getWindowMove(kwinWindow) {
      return kwinWindow.move;
    }
    getWindowResize(kwinWindow) {
      return kwinWindow.resize;
    }
    /**
     * Since there are a lot of attributes and they are only used in one place
     */
    isWindowRelevantForTiling(kwinWindow) {
      if (kwinWindow.fullScreen) return false;
      if (kwinWindow.dialog) return false;
      if (kwinWindow.splash) return false;
      if (kwinWindow.utility) return false;
      if (kwinWindow.dropdownMenu) return false;
      if (kwinWindow.tooltip) return false;
      if (kwinWindow.notification) return false;
      if (kwinWindow.criticalNotification) return false;
      if (kwinWindow.appletPopup) return false;
      if (kwinWindow.onScreenDisplay) return false;
      if (kwinWindow.comboBox) return false;
      if (kwinWindow.dndIcon) return false;
      if (kwinWindow.specialWindow) return false;
      if (kwinWindow.minimized) return false;
      if (kwinWindow.popupWindow) return false;
      if (kwinWindow.desktopWindow) return false;
      if (kwinWindow.toolbar) return false;
      if (kwinWindow.menu) return false;
      if (!kwinWindow.normalWindow) return false;
      return true;
    }
  };

  // src/script/tiling/layout.mjs
  var BaseLayout = class {
    /**
     *
     * @param {KWinLog} kwinLog
     * @param {KWinWrapper} kwinWrapper
     * @param {Configuration} knwinConfiguration
     */
    constructor(kwinLog2, kwinWrapper2, knwinConfiguration2) {
      this.logging = kwinLog2;
      this.kwinWrapper = kwinWrapper2;
      this.globalConfiguration = knwinConfiguration2;
    }
    tileWindowsOnDesktop(desktop, kwinWindows) {
      if (kwinWindows === void 0 || kwinWindows.length === 0) {
        return;
      }
      const padding = this.globalConfiguration.padding;
      const rootWindowDefaultSizeInPercentage = this.globalConfiguration.rootWindowDefaultSizeInPercentage;
      const screenXPos = this.kwinWrapper.getActiveScreenXPos() + padding;
      const screenYPos = this.kwinWrapper.getActiveScreenYPos() + padding;
      const screenWidth = this.kwinWrapper.getActiveScreenWidth() - padding * 2;
      const screenHeight = this.kwinWrapper.getActiveScreenHeight() - padding * 2;
      if (kwinWindows.length === 1) {
        const windowXPos = screenXPos;
        const windowYPos = screenYPos;
        const windowWidth = screenWidth;
        const windowHeight = screenHeight;
        this.kwinWrapper.setWindowPosition(
          kwinWindows[0],
          windowXPos,
          windowYPos,
          windowWidth,
          windowHeight
        );
        this.logging.printMessage(
          "-> set Window to Fullscreen " + this.kwinWrapper.getWindowResourceName(kwinWindows[0])
        );
      }
      if (kwinWindows.length > 1) {
        const nrOfSecondaryWindwos = kwinWindows.length - 1;
        const rootWindowWidth = screenWidth * rootWindowDefaultSizeInPercentage;
        const rootWindowHeight = screenHeight;
        const secondaryWindowWidth = screenWidth - rootWindowWidth - padding;
        const secondaryWindowHeight = (screenHeight - padding * (nrOfSecondaryWindwos - 1)) / nrOfSecondaryWindwos;
        let windowXPos = 0;
        let windowYPos = 0;
        let windowWidth = 0;
        let windowHeight = 0;
        for (let i = 0; i < kwinWindows.length; i++) {
          if (i === 0) {
            windowWidth = rootWindowWidth;
            windowHeight = rootWindowHeight;
            windowXPos = this.globalConfiguration.rootWindowPosition === Position.Right ? screenXPos + secondaryWindowWidth + padding : screenXPos;
            windowYPos = screenYPos;
            this.logging.printMessage(
              "-> set Root Window position " + this.kwinWrapper.getWindowResourceName(
                kwinWindows[i]
              )
            );
          } else {
            windowWidth = secondaryWindowWidth;
            windowHeight = secondaryWindowHeight;
            windowXPos = this.globalConfiguration.rootWindowPosition === Position.Right ? screenXPos : screenXPos + rootWindowWidth + padding;
            windowYPos = screenYPos + (i - 1) * secondaryWindowHeight + (i - 1) * padding;
            this.logging.printMessage(
              "-> set Secondary Window position " + this.kwinWrapper.getWindowResourceName(
                kwinWindows[i]
              )
            );
          }
          this.kwinWrapper.setWindowPosition(
            kwinWindows[i],
            windowXPos,
            windowYPos,
            windowWidth,
            windowHeight
          );
        }
      }
    }
  };

  // src/script/tiling/tiling-manager.mjs
  var TilingManager = class {
    /**
     *
     * @param {KWinLog} kwinLog
     * @param {KWinWrapper} kwinWrapper
     * @param {Configuration} knwinConfiguration
     */
    constructor(kwinLog2, kwinWrapper2, knwinConfiguration2) {
      this.registeredWindows = [];
      this.logging = kwinLog2;
      this.kwinWrapper = kwinWrapper2;
      this.globalConfiguration = knwinConfiguration2;
      this.layout = new BaseLayout(kwinLog2, kwinWrapper2, knwinConfiguration2);
    }
    /**
     * HOOK Method
     * If a new Window is opened, check if the window is relevant and execute
     * tiling if it is necessary
     *
     * @param {*} kwinWindow
     */
    registerWindow(kwinWindow) {
      this.logging.printMessage(
        "New Window registration started for: " + this.kwinWrapper.getWindowResourceName(kwinWindow)
      );
      if (this._isWindowRelevant(kwinWindow)) {
        let addedWindow = new Windowz(
          this.kwinWrapper.getWindowInternalId(kwinWindow),
          kwinWindow,
          this.kwinWrapper.getWindowDesktop(kwinWindow)
        );
        this._shouldWindowRegisterAsRoot(kwinWindow) ? this.registeredWindows.unshift(addedWindow) : this.registeredWindows.push(addedWindow);
        this.logging.printMessage("-> window added to the Tiling Manager");
        this._tileWindowsOnDesktop(
          this.kwinWrapper.getWindowDesktop(kwinWindow)
        );
      }
    }
    /**
     * HOOK Method
     * If the window is removed (e.g. closed), it will be removed from the
     * registered windwos and tiling will be executed on the desktop
     *
     * @param {*} kwinWindow
     */
    removeWindow(kwinWindow) {
      const isWindowSuccessfullyRemoved = this._removeWindowFromRegisteredList(kwinWindow);
      if (isWindowSuccessfullyRemoved) {
        this.logging.printMessage(
          "Window has been removed: " + this.kwinWrapper.getWindowResourceName(kwinWindow)
        );
        this._tileWindowsOnDesktop(
          this.kwinWrapper.getWindowDesktop(kwinWindow)
        );
      }
    }
    /**
     * HOOK Method
     * In case the window is minimized, the other windows can take their place.
     * If it was in a minimized state, and it is showed again, it should be placed
     * in the tiling again.
     *
     * @param {*} kwinWindow
     */
    minimizedChangedForWindow(kwinWindow) {
      this.logging.printMessage(
        "Window minimized state changed: " + this.kwinWrapper.getWindowResourceName(kwinWindow)
      );
      this._tileWindowsOnDesktop(
        this.kwinWrapper.getWindowDesktop(kwinWindow)
      );
    }
    /**
     * HOOK Method
     * If a window was maximized, we can leave all the window as they are behind the "scene".
     * We have to put the window back in position after the maximized state has been exited.
     *
     * @param {*} kwinWindow
     * @param {*} maximizeMode
     */
    maximizedChangedForWindow(kwinWindow, maximizeMode) {
      this.logging.printMessage(
        "Window maximized state changed: " + this.kwinWrapper.getWindowResourceName(kwinWindow) + ". MaximizedMode: " + maximizeMode
      );
      let maximizedWindow = this._getRegisteredWindowById(
        this.kwinWrapper.getWindowInternalId(kwinWindow)
      );
      if (maximizedWindow) {
        maximizedWindow.isMaximized = maximizeMode == MaximizeMode.Maximized ? true : false;
        if (!maximizedWindow.isMaximized) {
          this._tileWindowsOnDesktop(
            this.kwinWrapper.getWindowDesktop(kwinWindow)
          );
        }
      }
    }
    /**
     * HOOK Method
     * Window has been moved to another Desktop, we have to re-tile the old desktop
     * and add to the new one.
     *
     * @param {*} kwinWindow
     */
    desktopChangedForWindow(kwinWindow) {
      this.logging.printMessage(
        "Desktop changed for Window: " + this.kwinWrapper.getWindowResourceName(kwinWindow)
      );
      let registeredWindow = this._getRegisteredWindowById(
        this.kwinWrapper.getWindowInternalId(kwinWindow)
      );
      const oldDesktop = registeredWindow.kwinDesktop;
      const newDesktop = this.kwinWrapper.getWindowDesktop(kwinWindow);
      this.logging.printMessage("-> old Desktop: " + oldDesktop);
      this.logging.printMessage("-> new Desktop: " + newDesktop);
      const isWindowSuccessfullyRemoved = this._removeWindowFromRegisteredList(kwinWindow);
      if (isWindowSuccessfullyRemoved) {
        this.logging.printMessage(
          "-> window has been removed: " + this.kwinWrapper.getWindowResourceName(kwinWindow)
        );
        this._tileWindowsOnDesktop(oldDesktop);
      }
      if (this._isWindowRelevant(kwinWindow, registeredWindow)) {
        registeredWindow.kwinDesktop = newDesktop;
        this._shouldWindowRegisterAsRoot(kwinWindow) ? this.registeredWindows.unshift(registeredWindow) : this.registeredWindows.push(registeredWindow);
        this.logging.printMessage("-> window added to the Tiling Manager");
        this._tileWindowsOnDesktop(newDesktop);
      }
    }
    /**
     * HOOK Method
     * Since there is no other way to know at the end of a Moving/Resizing what actually happened
     * the state is stored for future use, e.g. in the interactiveMoveResizeFinishedForWindow method
     *
     * @param {*} kwinWindow
     */
    moveResizedChangedForWindow(kwinWindow) {
      let movedOrResizedWindow = this._getRegisteredWindowById(
        this.kwinWrapper.getWindowInternalId(kwinWindow)
      );
      if (movedOrResizedWindow && movedOrResizedWindow.isMoved === null && movedOrResizedWindow.isResized === null) {
        movedOrResizedWindow.isMoved = this.kwinWrapper.getWindowMove(kwinWindow);
        this.logging.printMessage(
          "-> is window moving: " + movedOrResizedWindow.isMoved
        );
        movedOrResizedWindow.isResized = this.kwinWrapper.getWindowResize(kwinWindow);
        this.logging.printMessage(
          "-> is window resizing: " + movedOrResizedWindow.isResized
        );
      }
    }
    /**
     * HOOK Method
     * Resizing: If a window was resized, since it is not allowed, we just execute the tiling again
     * Moving: at the end of the moving, swap the two windows if possible
     *
     * @param {*} kwinWindow
     */
    interactiveMoveResizeFinishedForWindow(kwinWindow) {
      let movedOrResizedWindow = this._getRegisteredWindowById(
        this.kwinWrapper.getWindowInternalId(kwinWindow)
      );
      if (movedOrResizedWindow) {
        this.logging.printMessage(
          "Window move/resize finished (moved: " + movedOrResizedWindow.isMoved + " resized: " + movedOrResizedWindow.isResized
        );
        if (movedOrResizedWindow.isResized) {
          this._tileWindowsOnDesktop(
            this.kwinWrapper.getWindowDesktop(kwinWindow)
          );
        }
        if (movedOrResizedWindow.isMoved) {
          const windowBelowTheMovedWindow = this._getWindowBelowTheWindow(kwinWindow);
          if (windowBelowTheMovedWindow) {
            this.logging.printMessage(
              "-> window below the moved window: " + this.kwinWrapper.getWindowResourceName(
                windowBelowTheMovedWindow
              )
            );
            this._swapWindowPlaces(
              kwinWindow,
              windowBelowTheMovedWindow
            );
            this._tileWindowsOnDesktop(
              this.kwinWrapper.getWindowDesktop(kwinWindow)
            );
          }
        }
        movedOrResizedWindow.isMoved = null;
        movedOrResizedWindow.isResized = null;
      }
    }
    /**
     * Decides if a Window should be Tiled or not
     *
     * @param {*} kwinWindow
     * @param {Windowz} customWindow
     * @returns
     */
    _isWindowRelevant(kwinWindow, customWindow = null) {
      if (!this.globalConfiguration.isTilingEnabled) return false;
      const ignoreList = this.globalConfiguration.ignoreList;
      if (ignoreList.indexOf(
        this.kwinWrapper.getWindowResourceName(kwinWindow)
      ) !== -1)
        return false;
      if (!this.kwinWrapper.isWindowRelevantForTiling(kwinWindow)) {
        return false;
      }
      if (customWindow !== null && customWindow !== void 0) {
        if (customWindow.isMaximized) return false;
      }
      return true;
    }
    /**
     * Executes the tiling for the corresponding desktop
     *
     * @param {*} desktop
     * @returns
     */
    _tileWindowsOnDesktop(desktop) {
      if (desktop === void 0 || desktop === null) {
        return;
      }
      this.logging.printMessage("-> tiling executed on Desktop: " + desktop);
      let windowsForDesktop = this._getWindowsForDesktop(desktop);
      this.layout.tileWindowsOnDesktop(desktop, windowsForDesktop);
    }
    /**
     * Returns the currently tileable windows for the desktop
     *
     * @param {*} desktop
     * @returns
     */
    _getWindowsForDesktop(desktop) {
      let windowsForDesktop = [];
      this.registeredWindows.forEach((customWindow) => {
        if (this.kwinWrapper.getWindowDesktop(customWindow.kwinWindow) === desktop) {
          if (this._isWindowRelevant(
            customWindow.kwinWindow,
            customWindow
          )) {
            windowsForDesktop.push(customWindow.kwinWindow);
          }
        }
      });
      return windowsForDesktop;
    }
    /**
     * Returns the window which is below the movedWindows mid point if there is something
     *
     * @param {*} movedWindow
     * @returns
     */
    _getWindowBelowTheWindow(movedWindow) {
      let windowBelowTheMovedWindow = void 0;
      const movedWindowPosition = this.kwinWrapper.getWindowPosition(movedWindow);
      this.logging.printMessage(
        "-> moved windows new position: " + movedWindowPosition
      );
      const midPointX = movedWindowPosition.x + movedWindowPosition.width / 2;
      const midPointY = movedWindowPosition.y + movedWindowPosition.height / 2;
      const windowsForDesktop = this._getWindowsForDesktop(
        this.kwinWrapper.getWindowDesktop(movedWindow)
      );
      windowsForDesktop.splice(windowsForDesktop.indexOf(movedWindow), 1);
      if (windowsForDesktop.length > 0) {
        windowsForDesktop.forEach((windowForDesktop) => {
          const windowForDesktopPosition = this.kwinWrapper.getWindowPosition(windowForDesktop);
          if (
            // mid point X is between the Windows X and X + Width
            midPointX >= windowForDesktopPosition.x && midPointX <= windowForDesktopPosition.x + windowForDesktopPosition.width && // mid point Y is between the Windows Y and Y + Height
            midPointY >= windowForDesktopPosition.y && midPointY <= windowForDesktopPosition.y + windowForDesktopPosition.height
          ) {
            windowBelowTheMovedWindow = windowForDesktop;
          }
        });
      }
      return windowBelowTheMovedWindow;
    }
    /**
     * Swaps the position in the registered windows array of the two window
     *
     * @param {*} windowOne
     * @param {*} windowTwo
     */
    _swapWindowPlaces(windowOne, windowTwo) {
      const indexWindowOne = this._getRegisteredWindowIndexById(
        this.kwinWrapper.getWindowInternalId(windowOne)
      );
      const indexWindowTwo = this._getRegisteredWindowIndexById(
        this.kwinWrapper.getWindowInternalId(windowTwo)
      );
      this.logging.printMessage(
        "-> swapping Windows: " + windowOne + ", " + windowTwo
      );
      this.logging.printMessage("--> index WindowOne: " + indexWindowOne);
      this.logging.printMessage("--> index WindowTwo: " + indexWindowTwo);
      const tempWindowOne = this.registeredWindows[indexWindowOne];
      this.registeredWindows[indexWindowOne] = this.registeredWindows[indexWindowTwo];
      this.registeredWindows[indexWindowTwo] = tempWindowOne;
    }
    /**
     * Checks wether the Window should be added as Root at the beginning
     *
     * @param {*} kwinWindow
     * @returns
     */
    _shouldWindowRegisterAsRoot(kwinWindow) {
      const registerAsRoot = this.globalConfiguration.registerAsRoot;
      const shouldWindowRegisterAsRoot = registerAsRoot.indexOf(
        this.kwinWrapper.getWindowResourceName(kwinWindow)
      ) !== -1 ? true : false;
      this.logging.printMessage(
        "-> should Window Register As Root: " + shouldWindowRegisterAsRoot
      );
      return shouldWindowRegisterAsRoot;
    }
    _removeWindowFromRegisteredList(kwinWindow) {
      const index = this._getRegisteredWindowIndexById(
        this.kwinWrapper.getWindowInternalId(kwinWindow)
      );
      if (index !== -1) {
        this.registeredWindows.splice(index, 1);
        return true;
      } else return false;
    }
    _getRegisteredWindowById(id) {
      return this.registeredWindows.find((element) => element.id === id);
    }
    _getRegisteredWindowIndexById(id) {
      return this.registeredWindows.findIndex((element) => element.id === id);
    }
  };
  var Windowz = class {
    constructor(id, kwinWindow, desktop) {
      this.id = id;
      this.kwinWindow = kwinWindow;
      this.kwinDesktop = desktop;
      this.isFloating = false;
      this.isMaximized = false;
      this.isMoved = null;
      this.isResized = null;
    }
  };

  // src/script/index.mjs
  var knwinConfiguration = new Configuration();
  var kwinWrapper = new KWinWrapper();
  var kwinLog = new KWinLog(knwinConfiguration);
  var tilingManager = new TilingManager(
    kwinLog,
    kwinWrapper,
    knwinConfiguration
  );
  var windows = workspace.stackingOrder;
  for (let i = 0; i < windows.length; i++) {
    windows[i].minimizedChanged.connect(() => {
      tilingManager.minimizedChangedForWindow(windows[i]);
    });
    windows[i].maximizedAboutToChange.connect((maximizeMode) => {
      tilingManager.maximizedChangedForWindow(windows[i], maximizeMode);
    });
    windows[i].moveResizedChanged.connect(() => {
      tilingManager.moveResizedChangedForWindow(windows[i]);
    });
    windows[i].interactiveMoveResizeFinished.connect(() => {
      tilingManager.interactiveMoveResizeFinishedForWindow(windows[i]);
    });
    windows[i].desktopsChanged.connect(() => {
      tilingManager.desktopChangedForWindow(windows[i]);
    });
    tilingManager.registerWindow(windows[i]);
  }
  workspace.windowAdded.connect((window) => {
    window.minimizedChanged.connect(() => {
      tilingManager.minimizedChangedForWindow(window);
    });
    window.maximizedAboutToChange.connect((maximizeMode) => {
      tilingManager.maximizedChangedForWindow(window, maximizeMode);
    });
    window.moveResizedChanged.connect(() => {
      tilingManager.moveResizedChangedForWindow(window);
    });
    window.interactiveMoveResizeFinished.connect(() => {
      tilingManager.interactiveMoveResizeFinishedForWindow(window);
    });
    window.desktopsChanged.connect(() => {
      tilingManager.desktopChangedForWindow(window);
    });
    tilingManager.registerWindow(window);
  });
  workspace.windowRemoved.connect((window) => {
    tilingManager.removeWindow(window);
  });
})();
