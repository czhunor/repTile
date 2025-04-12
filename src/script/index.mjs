import TilingManager from "./tiling/tiling-manager.mjs";
import { Configuration } from "./tiling/configuration.mjs";
import { KWinWrapper, KWinLog } from "./extern/kwin.mjs";
import Hooks from "./tiling/hooks.mjs";

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

// Print some information about the current state
// TODO move to the relevant places
kwinLog.printMessage(`Information about the current state`);
kwinLog.printMessage(`--> Desktops:`);
workspace.desktops.forEach((desktop) => {
    kwinLog.printMessage(`---> Desktop ID: ${desktop.id}`);
    kwinLog.printMessage(`---> Desktop Name: ${desktop.name}`);
});

kwinLog.printMessage(`--> Screens:`);
workspace.screens.forEach((screen) => {
    kwinLog.printMessage(`---> Screen Model: ${screen.model}`);
    kwinLog.printMessage(`---> Screen Name: ${screen.name}`);
    kwinLog.printMessage(`---> Screen Serial Number: ${screen.serialNumber}`);
});

kwinLog.printMessage(
    `--> Active Screen Name: ${kwinWrapper.getActiveScreen().name}`
);
kwinLog.printMessage(
    `--> Current Desktop ID: ${kwinWrapper.getCurrentDesktop().id}`
);

// Connect to the Hooks
const hooks = new Hooks(tilingManager);
hooks.connect();
