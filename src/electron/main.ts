import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { getPreloadPath, isDev } from "./run_utilities.js";

let mainWindow: BrowserWindow | null = null;
// Flag to track reload state
let isReloading = false;

function createWindow() {
    mainWindow = new BrowserWindow({
        frame: false,          // Remove the window frame (toolbar and title bar)
        show: false,           // Run in windowless mode (do not display the window)
        autoHideMenuBar: true, // Ensure the menu bar is hidden
        webPreferences: {
            preload: getPreloadPath(),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.removeMenu();
    mainWindow.maximize();
    mainWindow.show();
    mainWindow.webContents.session.setSpellCheckerEnabled(false);

    if (isDev()) {
        mainWindow.loadURL('http://localhost:5123');
    } else {
        mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
    }

    // Send navigation state changes to renderer
    const updateNavigationState = () => {
        if (mainWindow) {
            const canGoBack = mainWindow.webContents.navigationHistory.canGoBack();
            const canGoForward = mainWindow.webContents.navigationHistory.canGoForward();
            mainWindow.webContents.send('navigation-state-change', canGoBack, canGoForward);
        }
    };

    // Send maximize state changes to renderer
    const updateMaximizeState = () => {
        if (mainWindow) {
            const isMaximized = mainWindow.isMaximized();
            mainWindow.webContents.send('maximize-change', isMaximized);
        }
    };

    // Listen for navigation events to update state
    mainWindow.webContents.on('did-navigate', updateNavigationState);
    mainWindow.webContents.on('did-navigate-in-page', updateNavigationState);

    // Special handler for reloads to preserve history state
    mainWindow.webContents.on('will-navigate', (event, url) => {
        if (mainWindow) {
            // Check if this is a reload (same URL as current)
            const currentUrl = mainWindow.webContents.getURL();
            if (url === currentUrl) {
                isReloading = true;
            }
        }
    });

    // Update state on page load
    mainWindow.webContents.on('did-finish-load', () => {
        // If not reloading, update navigation state normally
        if (!isReloading) {
            updateNavigationState();
        } else {
            // After reload completes, reset the flag
            isReloading = false;
        }
        updateMaximizeState();
    });

    // Window state events
    mainWindow.on('maximize', updateMaximizeState);
    mainWindow.on('unmaximize', updateMaximizeState);

    // Cleanup on window close
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

// Handle IPC messages from renderer
ipcMain.on('minimize-window', () => {
    if (mainWindow) mainWindow.minimize();
});

ipcMain.on('maximize-window', () => {
    if (mainWindow) {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    }
});

ipcMain.on('close-window', () => {
    if (mainWindow) mainWindow.close();
});

ipcMain.on('go-back', () => {
    if (mainWindow && mainWindow.webContents.navigationHistory.canGoBack()) {
        mainWindow.webContents.navigationHistory.goBack();
    }
});

ipcMain.on('go-forward', () => {
    if (mainWindow && mainWindow.webContents.navigationHistory.canGoForward()) {
        mainWindow.webContents.navigationHistory.goForward();
    }
});

ipcMain.on('reload-page', () => {
    if (mainWindow) {
        // Set the flag before reloading
        isReloading = true;
        mainWindow.webContents.reload();
    }
});

// Quit application when all windows are closed on macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// On macOS, recreate window when dock icon is clicked and no windows are open
app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});