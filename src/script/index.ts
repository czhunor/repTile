import { TilingManager } from "./tiling/tilingmanager";
import Log from "./tiling/log";
import * as KWin from "./extern/kwin";

const kwinRoot = this;

//@ts-ignore
const kwinLog = new Log(kwinRoot);
const tilingManager = new TilingManager(kwinLog);

//@ts-ignore
const kwinWorkspace = kwinRoot.workspace;

kwinWorkspace.windowAdded.connect(tilingManager.registerWindow);
