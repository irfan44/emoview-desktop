const { app, BrowserWindow, ipcMain, Menu, screen } = require('electron');
const { release } = require('node:os');
const { createAppWindow, win } = require('./app');
const { createFloatingWindow, floatWin } = require('./floating');

if (release().startsWith('6.1')) app.disableHardwareAcceleration();

if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

app.whenReady().then(() => {
  createAppWindow();

  // get screen width
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width } = primaryDisplay.workAreaSize;

  // ipc for floating window
  ipcMain.on('floating:open', (_, ...args) => {
    createFloatingWindow(width, ...args);
  });
  ipcMain.on('floating:close', () => {
    BrowserWindow.getFocusedWindow().close();
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
