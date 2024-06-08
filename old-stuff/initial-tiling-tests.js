// Initialize variables to keep track of windows
var windows = [];
var screen = workspace.activeScreen;
var screenWidth = workspace.clientArea(
    KWin.PlacementArea,
    workspace.activeScreen,
    workspace.currentDesktop
).width;
var screenHeight = workspace.clientArea(
    KWin.PlacementArea,
    workspace.activeScreen,
    workspace.currentDesktop
).height;

// Function to tile windows
function tileWindows() {
    var numWindows = windows.length;
    var cols = Math.ceil(Math.sqrt(numWindows));
    var rows = Math.ceil(numWindows / cols);
    var winWidth = screenWidth / cols;
    var winHeight = screenHeight / rows;

    for (var i = 0; i < numWindows; i++) {
        var win = windows[i];
        var col = i % cols;
        var row = Math.floor(i / cols);
        var x = col * winWidth;
        var y = row * winHeight;

        win.frameGeometry = {
            x: x,
            y: y,
            width: winWidth,
            height: winHeight,
        };
    }
}

// Variables to track dragging and resizing
var dragging = false;
var resizing = false;
var dragStartX,
    dragStartY,
    resizeStartWidth,
    resizeStartHeight,
    resizeStartX,
    resizeStartY;
var dragWindow = null;

// Event handler for window move
function startDrag(client, x, y) {
    dragging = true;
    dragWindow = client;
    dragStartX = x;
    dragStartY = y;
}

// Event handler for window resize
function startResize(client, width, height, x, y) {
    resizing = true;
    dragWindow = client;
    resizeStartWidth = width;
    resizeStartHeight = height;
    resizeStartX = x;
    resizeStartY = y;
}

// Connect to window added and removed signals
workspace.windowAdded.connect(function (client) {
    windows.push(client);
    tileWindows();

    client.windowStartUserMovedResized.connect(function (client, x, y) {
        if (client.resize) {
            startResize(
                client,
                client.geometry.width,
                client.geometry.height,
                x,
                y
            );
        } else {
            startDrag(client, x, y);
        }
    });

    client.windowFinishUserMovedResized.connect(function (client) {
        dragging = false;
        resizing = false;
        tileWindows();
    });

    client.windowStepUserMovedResized.connect(function (
        client,
        x,
        y,
        width,
        height
    ) {
        if (dragging) {
            var deltaX = x - dragStartX;
            var deltaY = y - dragStartY;
            client.geometry = {
                x: client.geometry.x + deltaX,
                y: client.geometry.y + deltaY,
                width: client.geometry.width,
                height: client.geometry.height,
            };
        } else if (resizing) {
            var deltaX = x - resizeStartX;
            var deltaY = y - resizeStartY;
            client.geometry = {
                x: client.geometry.x,
                y: client.geometry.y,
                width: resizeStartWidth + deltaX,
                height: resizeStartHeight + deltaY,
            };
        }
    });
});

workspace.windowRemoved.connect(function (client) {
    var index = windows.indexOf(client);
    if (index > -1) {
        windows.splice(index, 1);
    }
    tileWindows();
});

// Initial tiling of existing windows
var clients = workspace.stackingOrder;
for (var i = 0; i < clients.length; i++) {
    windows.push(clients[i]);
}
tileWindows();
