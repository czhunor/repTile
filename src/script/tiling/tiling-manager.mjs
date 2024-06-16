import { KWinLog, KWinWrapper, MaximizeMode } from "../extern/kwin.mjs";
import { Configuration } from "./configuration.mjs";
import BaseLayout from "./layout.mjs";

/**
 * The Main Actor in the Script, the Tiling Manager
 * It has all the relevant methods, hooks, which are needed for tiling.
 * It uses the KWin Wrapper, KWin Log, etc. to fulfill all the tasks
 */

export default class TilingManager {
    /**
     *
     * @param {KWinLog} kwinLog
     * @param {KWinWrapper} kwinWrapper
     * @param {Configuration} knwinConfiguration
     */
    constructor(kwinLog, kwinWrapper, knwinConfiguration) {
        /** @type {Windowz[]} */
        this.registeredWindows = [];
        this.logging = kwinLog;
        this.kwinWrapper = kwinWrapper;
        this.globalConfiguration = knwinConfiguration;
        this.layout = new BaseLayout(kwinLog, kwinWrapper, knwinConfiguration);
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
            "New Window registration started for: " +
                this.kwinWrapper.getWindowResourceName(kwinWindow)
        );

        // Check if the Window is relevant
        if (this._isWindowRelevant(kwinWindow)) {
            // Add the Window to the list
            let addedWindow = new Windowz(
                this.kwinWrapper.getWindowInternalId(kwinWindow),
                kwinWindow,
                this.kwinWrapper.getWindowDesktop(kwinWindow)
            );

            this._shouldWindowRegisterAsRoot(kwinWindow)
                ? this.registeredWindows.unshift(addedWindow) // Add to the beginning of the list if it's Root
                : this.registeredWindows.push(addedWindow); // otherwise, to the end

            this.logging.printMessage("-> window added to the Tiling Manager");

            // Execute Tiling on the desktop where the Window was opened
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
        // Remove the window from the list and check if it was successfull
        const isWindowSuccessfullyRemoved =
            this._removeWindowFromRegisteredList(kwinWindow);

        if (isWindowSuccessfullyRemoved) {
            this.logging.printMessage(
                "Window has been removed: " +
                    this.kwinWrapper.getWindowResourceName(kwinWindow)
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
            "Window minimized state changed: " +
                this.kwinWrapper.getWindowResourceName(kwinWindow)
        );
        // execute Tiling for the Desktop, where the Window minimized state changed
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
            "Window maximized state changed: " +
                this.kwinWrapper.getWindowResourceName(kwinWindow) +
                ". MaximizedMode: " +
                maximizeMode
        );

        // Set maximized property for the maximized Window
        let maximizedWindow = this._getRegisteredWindowById(
            this.kwinWrapper.getWindowInternalId(kwinWindow)
        );

        if (maximizedWindow) {
            // Assuming that the window was not maximized before :-)
            maximizedWindow.isMaximized =
                maximizeMode == MaximizeMode.Maximized ? true : false;

            // If exit maximize, execute Tiling again, otherwise the screen is completly covered by the maximized window
            if (!maximizedWindow.isMaximized) {
                // execute Tiling for the Desktop, where the Window minimized state changed
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
            "Desktop changed for Window: " +
                this.kwinWrapper.getWindowResourceName(kwinWindow)
        );

        let registeredWindow = this._getRegisteredWindowById(
            this.kwinWrapper.getWindowInternalId(kwinWindow)
        );

        const oldDesktop = registeredWindow.kwinDesktop;
        const newDesktop = this.kwinWrapper.getWindowDesktop(kwinWindow);

        this.logging.printMessage("-> old Desktop: " + oldDesktop);
        this.logging.printMessage("-> new Desktop: " + newDesktop);

        // REMOVE Window from the old Desktop and execute tiling if so
        const isWindowSuccessfullyRemoved =
            this._removeWindowFromRegisteredList(kwinWindow);

        if (isWindowSuccessfullyRemoved) {
            this.logging.printMessage(
                "-> window has been removed: " +
                    this.kwinWrapper.getWindowResourceName(kwinWindow)
            );
            // Execute tiling on the Old Desktop
            this._tileWindowsOnDesktop(oldDesktop);
        }

        // REGISTER the Window again as a "new" one
        // - Check if the Window is relevant
        if (this._isWindowRelevant(kwinWindow, registeredWindow)) {
            registeredWindow.kwinDesktop = newDesktop;

            this._shouldWindowRegisterAsRoot(kwinWindow)
                ? this.registeredWindows.unshift(registeredWindow) // Add to the beginning of the list if it's Root
                : this.registeredWindows.push(registeredWindow); // otherwise, to the end

            this.logging.printMessage("-> window added to the Tiling Manager");

            // Execute Tiling on the desktop where the Window was moved
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

        if (
            movedOrResizedWindow &&
            movedOrResizedWindow.isMoved === null &&
            movedOrResizedWindow.isResized === null
        ) {
            movedOrResizedWindow.isMoved =
                this.kwinWrapper.getWindowMove(kwinWindow);
            this.logging.printMessage(
                "-> is window moving: " + movedOrResizedWindow.isMoved
            );
            movedOrResizedWindow.isResized =
                this.kwinWrapper.getWindowResize(kwinWindow);

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
                "Window move/resize finished (moved: " +
                    movedOrResizedWindow.isMoved +
                    " resized: " +
                    movedOrResizedWindow.isResized
            );

            // RESIZING
            // -> If resized, tile the windows back to the defined layout
            if (movedOrResizedWindow.isResized) {
                this._tileWindowsOnDesktop(
                    this.kwinWrapper.getWindowDesktop(kwinWindow)
                );
            }

            // MOVING
            // -> Have to check if there is a Window below the new position of the moved Window.
            //    If so, swap the places
            if (movedOrResizedWindow.isMoved) {
                const windowBelowTheMovedWindow =
                    this._getWindowBelowTheWindow(kwinWindow);

                if (windowBelowTheMovedWindow) {
                    this.logging.printMessage(
                        "-> window below the moved window: " +
                            this.kwinWrapper.getWindowResourceName(
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

            // Set back the default value after the Move/Resize is finished
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

        // Check wheter the Window is in the List defined in the Configuration to be skipped
        const ignoreList = this.globalConfiguration.ignoreList;

        if (
            ignoreList.indexOf(
                this.kwinWrapper.getWindowResourceName(kwinWindow)
            ) !== -1
        )
            return false;

        // Check if the Window is not relevant based on his basic properties
        if (!this.kwinWrapper.isWindowRelevantForTiling(kwinWindow)) {
            return false;
        }

        // Custom Window checks
        if (customWindow !== null && customWindow !== undefined) {
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
        if (desktop === undefined || desktop === null) {
            return;
        }

        this.logging.printMessage("-> tiling executed on Desktop: " + desktop);

        // Get all relevant Windows on the Desktop
        let windowsForDesktop = this._getWindowsForDesktop(desktop);
        // Call the Layout Manager to tile the Desktop
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
            if (
                this.kwinWrapper.getWindowDesktop(customWindow.kwinWindow) ===
                desktop
            ) {
                // Only add the window to the results if it is still in a relevan state
                // e.g. if change on the minimized, fullscreen, set to floating happens
                if (
                    this._isWindowRelevant(
                        customWindow.kwinWindow,
                        customWindow
                    )
                ) {
                    windowsForDesktop.push(customWindow.kwinWindow);
                }
            }
        });

        /* this.logging.printMessage(
            "-> windows found there: " + windowsForDesktop
        ); */
        return windowsForDesktop;
    }

    /**
     * Returns the window which is below the movedWindows mid point if there is something
     *
     * @param {*} movedWindow
     * @returns
     */
    _getWindowBelowTheWindow(movedWindow) {
        let windowBelowTheMovedWindow = undefined;
        const movedWindowPosition =
            this.kwinWrapper.getWindowPosition(movedWindow);

        this.logging.printMessage(
            "-> moved windows new position: " + movedWindowPosition
        );

        // determine the mid point of the moved Window
        const midPointX = movedWindowPosition.x + movedWindowPosition.width / 2;
        const midPointY =
            movedWindowPosition.y + movedWindowPosition.height / 2;

        // Check which Window is below the mid point
        // get all Windows for the Desktop
        const windowsForDesktop = this._getWindowsForDesktop(
            this.kwinWrapper.getWindowDesktop(movedWindow)
        );
        // remove the moved Window from the list, since we dont want to swap with the same one
        windowsForDesktop.splice(windowsForDesktop.indexOf(movedWindow), 1);

        if (windowsForDesktop.length > 0) {
            windowsForDesktop.forEach((windowForDesktop) => {
                const windowForDesktopPosition =
                    this.kwinWrapper.getWindowPosition(windowForDesktop);

                if (
                    // mid point X is between the Windows X and X + Width
                    midPointX >= windowForDesktopPosition.x &&
                    midPointX <=
                        windowForDesktopPosition.x +
                            windowForDesktopPosition.width &&
                    // mid point Y is between the Windows Y and Y + Height
                    midPointY >= windowForDesktopPosition.y &&
                    midPointY <=
                        windowForDesktopPosition.y +
                            windowForDesktopPosition.height
                ) {
                    // The mid point is on top of the Window
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
        // Find the indexes of the Windows to be swapped
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

        // Swap places
        const tempWindowOne = this.registeredWindows[indexWindowOne];

        this.registeredWindows[indexWindowOne] =
            this.registeredWindows[indexWindowTwo];
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

        const shouldWindowRegisterAsRoot =
            registerAsRoot.indexOf(
                this.kwinWrapper.getWindowResourceName(kwinWindow)
            ) !== -1
                ? true
                : false;

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
            return true; // If it was removed, return true
        } else return false; // If the window was not in the list, return false
    }

    _getRegisteredWindowById(id) {
        return this.registeredWindows.find((element) => element.id === id);
    }

    _getRegisteredWindowIndexById(id) {
        return this.registeredWindows.findIndex((element) => element.id === id);
    }
}

class Windowz {
    constructor(id, kwinWindow, desktop) {
        this.id = id; // KWin Window  - internalId
        this.kwinWindow = kwinWindow; // KWin Window
        this.kwinDesktop = desktop; // KWin Desktop
        this.isFloating = false;
        this.isMaximized = false;
        this.isMoved = null;
        this.isResized = null;
    }
}
