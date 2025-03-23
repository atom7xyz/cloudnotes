import {app, BrowserWindow} from 'electron';
import path from 'path';
import {getPreloadPath, isDev} from "./run_utilities.js";

app.on('ready', () => {
    const mainWindow: BrowserWindow = new BrowserWindow({
        webPreferences: {
            preload: getPreloadPath()
        }
    });

    if (isDev()) {
        mainWindow.loadURL('http://localhost:5123');
    } else {
        mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
    }

    const t: Sesso = 'M';
});