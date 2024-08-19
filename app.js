const { app, BrowserWindow, ipcMain } = require('electron');
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
    window.webContents.on('did-navigate', (event, url) => 
    {
        updateHistory(url);
    });

    ipcMain.on('form-submitted', (event, args) =>
    {
        const data = args[0];
        const url = data[0];

        // updateHistory(url);
    });

    ipcMain.handle('get-history', () => 
    ({
        previousUrl: currentIndex > 0 ? urlHistory[currentIndex - 1] : null,
        currentUrl: urlHistory[currentIndex],
        nextUrl: currentIndex < urlHistory.length - 1 ? urlHistory[currentIndex + 1] : null
    }));


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
        BrowserWindow.fromWebContents(event.sender).loadURL(navigateBackwards());
    });

    ipcMain.on('goforward', (event) => 
    {
        BrowserWindow.fromWebContents(event.sender).loadURL(navigateForward());
    });

    ipcMain.on('check-nav-state', (event) =>
    {
        const canGoBack = getPreviousUrl() !== null;
        const canGoForward = getNextUrl() !== null;

        event.sender.send('result-nav-state', { canGoBack, canGoForward });
    });

    ipcMain.on('navigate', (event, args) =>
    {
        const data = args[0];
        const url = data[0];

        BrowserWindow.fromWebContents(event.sender).loadURL(url);
    });
}

function createWindow() 
{
    window = new BrowserWindow({
        width: 1366,
        height: 768,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            spellcheck: false,
            preload: path.join(__dirname, '/dist/preload.js')
        },
        frame: false,
        resizable: true,
        titleBarStyle: "hidden"
    });

    window.setMenuBarVisibility(false);
    window.maximize();

    configureIPC();

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

let urlHistory = [];
let currentIndex = -1;
 
const excludedFromHistory = [ 'pw-recovery-setnew.html', 'pw-recovery-code.html' ]

function updateHistory(url)
{
    let partOfInterest = url.split('/').pop();

    if (urlHistory[currentIndex] === url || excludedFromHistory.includes(partOfInterest) || partOfInterest.includes("#"))
    {
        return;
    }

    if (currentIndex < urlHistory.length - 1) 
    {
        urlHistory = urlHistory.slice(0, currentIndex + 1);
    }

    urlHistory.push(url);
    currentIndex++;

    displayHistory();
}

function navigateBackwards(restoreIndex = false) 
{
    if (currentIndex > 0)
    {
        let targetIndex = restoreIndex ? currentIndex - 1 : --currentIndex;
        return urlHistory[targetIndex];
    }

    return null;
}

function navigateForward(restoreIndex = false)
{
    if (currentIndex < urlHistory.length - 1) 
    {
        let targetIndex = restoreIndex ? currentIndex + 1 : ++currentIndex;
        return urlHistory[targetIndex];
    }

    return null;
}

function getPreviousUrl()
{
    return currentIndex > 0 ? urlHistory[currentIndex - 1] : null;
}

function getNextUrl()
{
    return currentIndex < urlHistory.length - 1 ? urlHistory[currentIndex + 1] : null;
}

function displayHistory() 
{
    console.log("Browser History:");
    
    urlHistory.forEach((url, index) => 
    {
        if (index === currentIndex) 
        {
            console.log(`* [${index}] ${url} (Current Page)`);
        } 
        else 
        {
            console.log(`[${index}] ${url}`);
        }
    });
    console.log("");
}
