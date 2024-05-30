const { app, BrowserWindow, ipcMain } = require('electron');
const url = require('url');
const path = require('path');
const { HtmlBuilder } = require('./dist/html/HtmlBuilder');

let window = null;

function configureIPC(window) {
    ipcMain.on('minimize', () => {
        window.minimize();
    });
    ipcMain.on('resize', () => {
        if (window.isMaximized()) {
            window.unmaximize();
        } else {
            window.maximize();
        }
    });
    ipcMain.on('close', () => {
        window.close();
    });
}

function createWindow() {
    console.log(path.join(__dirname, '/dist/preload.js'))
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

    window.setMinimumSize(1366, 768);
    window.setMenuBarVisibility(false);
    window.maximize();

    configureIPC(window);

    let htmlContent = HtmlBuilder.getInstance().onDemandBuild("terms-of-service");
    window.loadFile(htmlContent);


    /*
    window.loadURL(
        url.format({
            pathname: path.join(__dirname, "/resources/register.html"),
            protocol: "file:",
            slashes: true
        })
    );*/

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
