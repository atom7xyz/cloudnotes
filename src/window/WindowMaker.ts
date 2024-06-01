import { BrowserWindow } from 'electron';

export class WindowMaker {
    private static windows: Map<BrowserWindow, string> = new Map();

    public static createWindow(dir: string, window: BrowserWindow) {
        WindowMaker.windows.set(window, dir);
        window.loadFile(dir);
        return window;
    }

    public static getAssociatedWindow(dir: string): BrowserWindow | undefined {
        for (let [w, d] of WindowMaker.windows) {
            if (d === dir) {
                return w;
            }
        }
        return undefined;
    }

    public static removeWindow(window: BrowserWindow) {
        WindowMaker.windows.delete(window);
    }
}






