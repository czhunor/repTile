import TilingManager from "./tiling/tiling-manager.mjs";
import { Configuration } from "./tiling/configuration.mjs";
import { KWinWrapper, KWinLog } from "./extern/kwin.mjs";

//---------------------------------------------------------------------------//
//                      Initialization and execution                         //

// Initialize Wrapper Classes
const knwinConfiguration = new Configuration();
const kwinWrapper = new KWinWrapper();
const kwinLog = new KWinLog(knwinConfiguration);

// Tiling Manager
const tilingManager = new TilingManager(
    kwinLog,
    kwinWrapper,
    knwinConfiguration
);

// Initial execution of the script, register every already opened Window and register
// the Hook methods also, otherwise it will be necesarry to close the apps and restart them to work properly.
let windows = workspace.stackingOrder;
for (let i = 0; i < windows.length; i++) {
    // Register the Hooks
    // -> In case the Window is minimized, we have to react
    windows[i].minimizedChanged.connect(() => {
        tilingManager.minimizedChangedForWindow(windows[i]);
    });

    // -> In case the Window is minimized, we have to react
    windows[i].maximizedAboutToChange.connect((maximizeMode) => {
        tilingManager.maximizedChangedForWindow(windows[i], maximizeMode);
    });

    // -> When the Window is moved or resized, we will store the state of the action for later
    windows[i].moveResizedChanged.connect(() => {
        tilingManager.moveResizedChangedForWindow(windows[i]);
    });

    windows[i].interactiveMoveResizeFinished.connect(() => {
        tilingManager.interactiveMoveResizeFinishedForWindow(windows[i]);
    });

    // Window was moved to another Desktop
    windows[i].desktopsChanged.connect(() => {
        tilingManager.desktopChangedForWindow(windows[i]);
    });

    // Execute Tiling the first time
    tilingManager.registerWindow(windows[i]);
}

//---------------------------------------------------------------------------//
//                      Register Hooks                                       //

workspace.windowAdded.connect((window) => {
    // In case the Window is minimized, we have to react
    window.minimizedChanged.connect(() => {
        tilingManager.minimizedChangedForWindow(window);
    });

    // In case the Window is minimized, we have to react
    window.maximizedAboutToChange.connect((maximizeMode) => {
        tilingManager.maximizedChangedForWindow(window, maximizeMode);
    });

    // When the Window is moved or resized, we will store the state of the action for later
    window.moveResizedChanged.connect(() => {
        tilingManager.moveResizedChangedForWindow(window);
    });

    window.interactiveMoveResizeFinished.connect(() => {
        tilingManager.interactiveMoveResizeFinishedForWindow(window);
    });

    // Window was moved to another Desktop
    window.desktopsChanged.connect(() => {
        tilingManager.desktopChangedForWindow(window);
    });

    // Attach the Tiling manager for Windows Added
    tilingManager.registerWindow(window);
});

workspace.windowRemoved.connect((window) => {
    // Attach the Tiling manager for Windows Removed
    tilingManager.removeWindow(window);
});
