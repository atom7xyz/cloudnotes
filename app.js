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

function configureIPC()
{
    ipcMain.on('minimize', (event) => 
    {
        BrowserWindow.fromWebContents(event.sender).minimize();
    });
    
    ipcMain.on('resize', (event) => 
    {
        let window = BrowserWindow.fromWebContents(event.sender);

        if (window.isMaximized()) 
        {
            window.unmaximize();
        } 
        else 
        {
            window.maximize();
        }
    });
    
    ipcMain.on('close', (event) => 
    {
        let window = BrowserWindow.fromWebContents(event.sender);

        //WindowMaker.removeWindow(window);
        window.close();
    });

    ipcMain.on('reload', (event) => 
    {
        BrowserWindow.fromWebContents(event.sender).reload();
    });

    ipcMain.on('goback', (event) => 
    {
        BrowserWindow.fromWebContents(event.sender).webContents.goBack();
    });

    ipcMain.on('goforward', (event) => 
    {
        BrowserWindow.fromWebContents(event.sender).webContents.goForward();
    });

    ipcMain.on('check-nav-state', (event) =>
    {
        let window = BrowserWindow.fromWebContents(event.sender);
        
        const canGoBack = window.webContents.canGoBack();
        const canGoForward = window.webContents.canGoForward();

        event.sender.send('result-nav-state', { canGoBack, canGoForward });
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

    window.loadURL(
        url.format({
            pathname: path.join(__dirname, "/resources/register.html"),
            protocol: "file:",
            slashes: true
        })
    );

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
