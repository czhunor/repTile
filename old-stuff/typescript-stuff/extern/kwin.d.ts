import * as Qt from "./qt";

export interface VirtualDesktop {
    readonly id: string;
}

export interface Window {
    readonly activities: string[];
    readonly desktops: VirtualDesktop[];

    readonly normalWindow: boolean;
    readonly popupWindow: boolean;
    readonly transient: boolean;

    frameGeometry: Qt.QRect;
    fullScreen: boolean;
    minimized: boolean;

    desktopChanged: Qt.Signal<() => void>;
    screenChanged: Qt.Signal<() => void>;
    fullScreenChanged: Qt.Signal<() => void>;
    minimizedChanged: Qt.Signal<() => void>;
}

export interface Workspace {
    activeWindow: Window;

    windowAdded: Qt.Signal<(client: Window) => void>;
    windowRemoved: Qt.Signal<(client: Window) => void>;
    windowActivated: Qt.Signal<(client: Window) => void>;
}

export interface Root {
    readonly workspace: Workspace;
    print(sMessage: string): void;
}
