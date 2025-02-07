const { app, BrowserWindow, ipcMain } = require('electron');
const url = require('url');
const path = require('path');

// Window Management
let window = null;

function createWindow() {
    const windowConfig = {
        width: 1366,
        height: 768,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            spellcheck: false,
            preload: path.join(__dirname, '/dist/preload.js'),
            backgroundColor: '#2e2c29'
        },
        frame: false,
        resizable: true,
        titleBarStyle: "hidden",
        show: false,
        backgroundColor: '#2e2c29',
        paintWhenInitiallyHidden: true
    };

    window = new BrowserWindow(windowConfig);
    
    // Set background color immediately after creation
    window.setBackgroundColor('#2e2c29');
    window.setMenuBarVisibility(false);
    window.maximize();

    // Preload the background color
    window.webContents.on('dom-ready', () => {
        window.webContents.executeJavaScript(`
            document.body.style.backgroundColor = '#2e2c29';
            document.documentElement.style.backgroundColor = '#2e2c29';
        `);
    });

    configureIPC();

    setTimeout(() => {
        window.loadURL(
            url.format({
                pathname: path.join(__dirname, "/resources/settings.html"),
                protocol: "file:",
                slashes: true
            })
        );
    }, 500);

    window.once('ready-to-show', () => {
        setTimeout(() => {
            window.show();
            window.webContents.executeJavaScript(`
                document.body.style.opacity = 0;
                document.body.style.transition = 'opacity 400ms ease-in';
                document.body.style.opacity = 1;
            `);
        }, 200);
    });

    window.on('closed', () => window = null);
}

// IPC Configuration - Split into logical groups
function configureIPC() {
    configureNavigationHandlers();
    configureWindowControlHandlers();
    configureHistoryHandlers();
}

function configureNavigationHandlers() {
    window.webContents.on('did-navigate', (event, url) => {
        updateHistory(url);
    });

    ipcMain.on('navigate', (event, args) => {
        const [url] = args[0];
        BrowserWindow.fromWebContents(event.sender).loadURL(url);
    });

    ipcMain.on('reload', (event) => {
        BrowserWindow.fromWebContents(event.sender).reload();
    });

    ipcMain.on('goback', (event) => {
        BrowserWindow.fromWebContents(event.sender).loadURL(navigateBackwards());
    });

    ipcMain.on('goforward', (event) => {
        BrowserWindow.fromWebContents(event.sender).loadURL(navigateForward());
    });
}

function configureWindowControlHandlers() {
    ipcMain.on('minimize', (event) => {
        BrowserWindow.fromWebContents(event.sender).minimize();
    });
    
    ipcMain.on('resize', (event) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        window.isMaximized() ? window.unmaximize() : window.maximize();
    });
    
    ipcMain.on('close', (event) => {
        BrowserWindow.fromWebContents(event.sender).close();
    });
}

function configureHistoryHandlers() {
    ipcMain.handle('get-history', () => ({
        previousUrl: currentIndex > 0 ? urlHistory[currentIndex - 1] : null,
        currentUrl: urlHistory[currentIndex],
        nextUrl: currentIndex < urlHistory.length - 1 ? urlHistory[currentIndex + 1] : null
    }));

    ipcMain.on('check-nav-state', (event) => {
        const canGoBack = getPreviousUrl() !== null;
        const canGoForward = getNextUrl() !== null;
        event.sender.send('result-nav-state', { canGoBack, canGoForward });
    });
}

// Application Lifecycle
app.whenReady().then(() => {
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

/*
 * Browser History Management
 */

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
