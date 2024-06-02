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

    var time = new Date().getTime();

    console.log("Window created -> " + (new Date().getTime() - time));

    window.setMenuBarVisibility(false);
    window.maximize();

    console.log("Window maximized -> " + (new Date().getTime() - time));

    configureIPC();

    console.log("IPC configured -> " + (new Date().getTime() - time));

    configureLinkHandlers();

    console.log("Link handlers configured -> " + (new Date().getTime() - time));

    WindowMaker.createWindow(HtmlBuilder.getInstance().onDemandBuild("login"), window);

    console.log("Window created 2 -> " + (new Date().getTime() - time));

    window.on('closed', () => window = null);

    console.log("Window DONE -> " + (new Date().getTime() - time));
}

app.whenReady().then(() => {
    createWindow()
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
