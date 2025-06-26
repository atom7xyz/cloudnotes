import { app, BrowserWindow, ipcMain, globalShortcut } from 'electron';
import path from 'path';
import { getPreloadPath, isDev } from "./run_utilities.js";
import { authService, type LoginRequest, type RegisterRequest } from './auth-service.js';

let mainWindow: BrowserWindow | null = null;
// Flag to track reload state
let isReloading = false;

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

// Toggle DevTools function
const toggleDevTools = () => {
    if (mainWindow) {
        try {
            if (mainWindow.webContents.isDevToolsOpened()) {
                mainWindow.webContents.closeDevTools();
            } else {
                mainWindow.webContents.openDevTools({ mode: 'detach' });
            }
        } catch (error) {
            console.error('Error toggling DevTools:', error);
        }
    } else {
        console.error('Cannot toggle DevTools: mainWindow is null');
    }
};

// Helper to update the window title
const updateWindowTitle = (title: string) => {
    if (mainWindow) {
        // Append CloudNotes to the title for branding
        const appTitle = title ? `${title} - CloudNotes` : 'CloudNotes';
        mainWindow.setTitle(appTitle);
    }
};

// Function to update the thumbnail preview for ALT+TAB on Windows
const updateThumbnailClip = () => {
    if (mainWindow && process.platform === 'win32') {
        const { width, height } = mainWindow.getContentBounds();
        // Create a clip area that excludes the title bar to show just the document content
        mainWindow.setThumbnailClip({ x: 0, y: 48, width, height: height - 48 });
    }
};

function createWindow() {
    mainWindow = new BrowserWindow({
        frame: false,          // Remove the window frame (toolbar and title bar)
        show: false,           // Run in windowless mode (do not display the window)
        autoHideMenuBar: true, // Ensure the menu bar is hidden
        title: 'CloudNotes',   // Set default window title
        webPreferences: {
            preload: getPreloadPath(),
            nodeIntegration: false,
            contextIsolation: true,
            devTools: false     // Always allow DevTools
        }
    });

    mainWindow.removeMenu();
    mainWindow.maximize();
    mainWindow.show();
    mainWindow.webContents.session.setSpellCheckerEnabled(false);

    // Set the window title for taskbar and ALT+TAB
    mainWindow.setTitle('CloudNotes');

    // Set a thumbnail clip area for the ALT+TAB preview on Windows
    // This will create a preview of the main content area, not including the custom titlebar
    if (process.platform === 'win32') {
        // Clip area starts below the title bar (48px height)
        // Width and height are set to the main content area
        const { width, height } = mainWindow.getContentBounds();
        mainWindow.setThumbnailClip({ x: 0, y: 48, width, height: height - 48 });
    }

    // Load the app
    if (isDev()) {
        mainWindow.loadURL('http://localhost:5123');
        // Use a slight delay to ensure window is fully loaded before opening DevTools
        setTimeout(() => {
            if (mainWindow) {
                mainWindow.webContents.openDevTools({ mode: 'detach' });
            }
        }, 1000);
    } else {
        mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
    }

    // Listen for navigation events to update state
    mainWindow.webContents.on('did-navigate', () => {
        updateNavigationState();
    });
    
    mainWindow.webContents.on('did-navigate-in-page', () => {
        updateNavigationState();
    });

    // Add this event listener for SPA navigation
    mainWindow.webContents.on('page-title-updated', () => {
        updateNavigationState();
    });

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
        // Always update navigation state after the page finishes loading
        updateNavigationState();
        
        // Reset reloading flag if needed
        if (isReloading) {
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

app.on('ready', () => {
    createWindow();
    
    // Add IPC handler for toggling DevTools
    ipcMain.handle('toggle-dev-tools', () => {
        toggleDevTools();
    });
    
    // Authentication IPC handlers
    ipcMain.handle('auth:login', async (_, data: LoginRequest) => {
        try {
            return await authService.login(data);
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: 'An unexpected error occurred during login'
            };
        }
    });

    ipcMain.handle('auth:register', async (_, data: RegisterRequest) => {
        try {
            return await authService.register(data);
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: 'An unexpected error occurred during registration'
            };
        }
    });

    ipcMain.handle('auth:logout', async (_, token: string) => {
        try {
            return await authService.logout(token);
        } catch (error) {
            console.error('Logout error:', error);
            return {
                success: false,
                message: 'An unexpected error occurred during logout'
            };
        }
    });

    ipcMain.handle('auth:verify-token', async (_, token: string) => {
        try {
            return await authService.verifyToken(token);
        } catch (error) {
            console.error('Token verification error:', error);
            return {
                success: false,
                message: 'An unexpected error occurred during token verification'
            };
        }
    });

    ipcMain.handle('auth:get-users', async () => {
        try {
            return {
                success: true,
                users: authService.getAllUsers()
            };
        } catch (error) {
            console.error('Get users error:', error);
            return {
                success: false,
                message: 'An unexpected error occurred while fetching users'
            };
        }
    });
    
    // Register CTRL+I shortcut to toggle DevTools
    try {
        const registered = globalShortcut.register('CommandOrControl+I', () => {
            toggleDevTools();
        });
        if (!registered) {
            console.warn('CTRL+I shortcut registration failed');
        }
    } catch (error) {
        console.error('Error registering CTRL+I shortcut:', error);
    }
    
    // Register F5 to reload the page
    try {
        const registered = globalShortcut.register('F5', () => {
            if (mainWindow) {
                isReloading = true;
                mainWindow.webContents.reload();
            }
        });
        if (!registered) {
            console.warn('F5 shortcut registration failed');
        }
    } catch (error) {
        console.error('Error registering F5 shortcut:', error);
    }
    
    // Register CTRL+R as an alternative reload shortcut
    try {
        const registered = globalShortcut.register('CommandOrControl+R', () => {
            if (mainWindow) {
                isReloading = true;
                mainWindow.webContents.reload();
            }
        });
        if (!registered) {
            console.warn('CTRL+R shortcut registration failed');
        }
    } catch (error) {
        console.error('Error registering CTRL+R shortcut:', error);
    }
});

// Unregister shortcuts when app is about to quit
app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

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
        
        // Reload the page
        mainWindow.webContents.reload();
        
        // Make sure to update navigation state after reload
        mainWindow.webContents.once('did-finish-load', () => {
            updateNavigationState();
        });
    }
});

ipcMain.on('navigate', (_, url) => {
    if (mainWindow) {
        // Load the URL
        mainWindow.webContents.loadURL(url);
        
        // Make sure to update navigation state after navigation
        mainWindow.webContents.once('did-finish-load', () => {
            updateNavigationState();
        });
    }
});

// Add an IPC handler to request navigation state update
ipcMain.on('request-navigation-state-update', () => {
    updateNavigationState();
});

// Set window title handler
ipcMain.on('set-window-title', (_event, title: string) => {
    updateWindowTitle(title);
});

// Update window preview handler
ipcMain.on('update-window-preview', () => {
    updateThumbnailClip();
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