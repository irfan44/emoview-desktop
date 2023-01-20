const { app, BrowserWindow, ipcMain, screen } = require('electron');
const { release } = require('node:os');
const {
  getAccessToken,
  getProfile,
  refreshTokens,
  addUserProfile,
} = require('../services/auth');
const { createAppWindow, win } = require('./app');
const { createAuthWindow, createLogoutWindow } = require('./auth');
const { createFloatingWindow, floatWin } = require('./floating');

if (release().startsWith('6.1')) app.disableHardwareAcceleration();

if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

async function showWindow() {
  try {
    await refreshTokens();
    await addUserProfile();
    createAppWindow();
  } catch (err) {
    createAuthWindow();
  }
}

app.whenReady().then(() => {
  showWindow();

  // get screen width
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width } = primaryDisplay.workAreaSize;

  ipcMain.handle('auth:get-accessToken', getAccessToken);
  ipcMain.handle('auth:get-profile', getProfile);
  ipcMain.on('auth:log-out', () => {
    BrowserWindow.getAllWindows().forEach((window) => window.close());
    createLogoutWindow();
  });

  // ipc for floating window
  ipcMain.on('floating:open', (_, ...args) => {
    createFloatingWindow(width, ...args);
  });
  ipcMain.on('floating:close', () => {
    BrowserWindow.getFocusedWindow().hide();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createAppWindow();
  }
});
