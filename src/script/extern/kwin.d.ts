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
    activitiesChanged: Qt.Signal<() => void>;
    screenChanged: Qt.Signal<() => void>;
    tileChanged: Qt.Signal<() => void>;
    fullScreenChanged: Qt.Signal<() => void>;
    minimizedChanged: Qt.Signal<() => void>;
    clientMaximizedStateChanged: Qt.Signal<
        (c: Window, h: boolean, v: boolean) => void
    >;
}

export interface Workspace {
    activeWindow: Window;

    clientAdded: Qt.Signal<(c: Window) => void>;
    clientRemoved: Qt.Signal<(c: Window) => void>;
    clientActivated: Qt.Signal<(c: Window) => void>;
    currentDesktopChanged: Qt.Signal<(d: number) => void>;
    numberScreensChanged: Qt.Signal<() => void>;
}
