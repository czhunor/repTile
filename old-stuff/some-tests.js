workspace.windowAdded.connect((window) => {
    // In case the Window is minimized, we have to react
    window.minimizedChanged.connect(() => {
        print("Window minimized " + workspace.activeWindow.resourceName);
    });

    window.windowStartUserMovedResized.connect((window, x, y) => {
        print(
            "Window start user move/resize " +
                window +
                ". Position X: " +
                x +
                "Position y: " +
                y
        );
    });

    window.windowFinishUserMovedResized.connect((window) => {
        print("Window finish move/resize " + window);
    });

    window.windowStepUserMovedResized.connect((window, x, y, width, height) => {
        print(
            "Window step user move/resize " +
                window +
                ". Position X: " +
                x +
                "Position y: " +
                y +
                " Width: " +
                width +
                "Height: " +
                height
        );
    });

    print("Window added " + window);
    // Attach the Tiling manager for Windows Added
});

workspace.windowRemoved.connect((window) => {
    // Attach the Tiling manager for Windows Removed
    print("Window removed " + window);
});

workspace.windowAdded.connect((window) => {
    // In case the Window is minimized, we have to react
    window.maximizedChanged.connect(() => {
        print("Window minimized " + window.resourceName);
    });

    window.moveResizedChanged.connect(() => {
        print(
            "Window start user move/resize " +
                window.resourceName +
                ". Position X: " +
                window.frameGeometry.x +
                "Position y: " +
                window.frameGeometry.y
        );
    });

    window.interactiveMoveResizeStarted.connect(() => {
        print("interactiveMoveResizeStarted " + window.resourceName);
    });

    window.interactiveMoveResizeFinished.connect(() => {
        print(
            "interactiveMoveResizeFinished " +
                window.resourceName +
                ". Position X: " +
                window.frameGeometry.x +
                "Position y: " +
                window.frameGeometry.y +
                " Width: " +
                window.frameGeometry.width +
                "Height: " +
                window.frameGeometry.height
        );
    });
});





print("------------------ START ------------------");
print("Current Desktop: " + workspace.currentDesktop);
print("Active Screen: " + workspace.activeScreen.model);
print("Active Window Tile: " + workspace.activeWindow.tile);
print("Active Window: " + workspace.activeWindow.desktops[0].id);
print("Active Window Geo: " + workspace.activeWindow.frameGeometry);

print("Tile Manager for Active Screen: " + workspace.tilingForScreen(workspace.activeScreen))


print("TESTING asdas: " + workspace.clientArea(KWin.PlacementArea, workspace.activeScreen, workspace.currentDesktop).y);

let newPrint = this.print;

newPrint("Windows list: " + workspace.stackingOrder);

filterProcess = [
        "krunner",
        "yakuake",
        "spectacle",
        "plasmashell",
    ];
/*