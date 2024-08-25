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

const hooks = new Hooks(tilingManager);

hooks.connect();
