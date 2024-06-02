const { app, BrowserWindow, ipcMain, webContents } = require('electron');
const url = require('url');
const path = require('path');
const { HtmlBuilder } = require('./dist/html/HtmlBuilder');
const { WindowMaker } = require('./dist/window/WindowMaker');

let window = null;

function configureLinkHandlers() {
    ipcMain.on("create-window", (event, args) => {
        let dir = HtmlBuilder.getInstance().onDemandBuild(args[0]);
        let window = WindowMaker.getAssociatedWindow(dir);
        if (window) window.reload();
        else WindowMaker.createWindow(dir, new BrowserWindow({
            width: 1366,
            height: 768,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: true,
                preload: path.join(__dirname, '/dist/preload.js')
            },
            frame: false,
            resizable: true,
            titleBarStyle: "hidden"
        }));
    });
}

function configureIPC() {
    ipcMain.on('minimize', (event, args) => {
        BrowserWindow.fromWebContents(event.sender).minimize();
    });
    ipcMain.on('resize', (event, args) => {
        let window = BrowserWindow.fromWebContents(event.sender);
        if (window.isMaximized()) {
            window.unmaximize();
        } else {
            window.maximize();
        }
    });
    ipcMain.on('close', (event, args) => {
        let window = BrowserWindow.fromWebContents(event.sender);
        WindowMaker.removeWindow(window);
        window.close();
    });
}

function createWindow() {
    window = new BrowserWindow({
        width: 1366,
        height: 768,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, '/dist/preload.js')
        },
        frame: false,
        resizable: true,
        titleBarStyle: "hidden"
    });

    window.setMenuBarVisibility(false);
    window.maximize();

    configureIPC();
    configureLinkHandlers();

    WindowMaker.createWindow(HtmlBuilder.getInstance().onDemandBuild("login"), window);

    window.on('closed', () => window = null);
}

app.whenReady().then(() => {
    createWindow()
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
