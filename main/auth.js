const { BrowserWindow } = require('electron');
const {
  getAuthenticationURL,
  getLogOutUrl,
  loadTokens,
  logout,
} = require('../services/auth');
const { createAppWindow } = require('./app');

let win = null;

function createAuthWindow() {
  destroyAuthWin();

  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: false,
    },
    titleBarStyle: 'hidden',
  });

  win.loadURL(getAuthenticationURL());

  const {
    session: { webRequest },
  } = win.webContents;

  const filter = {
    urls: ['http://localhost/callback*'],
  };

  webRequest.onBeforeRequest(filter, async ({ url }) => {
    await loadTokens(url);
    createAppWindow();
    return destroyAuthWin();
  });

  win.on('authenticated', () => {
    destroyAuthWin();
  });

  win.on('closed', () => {
    win = null;
  });
}

function destroyAuthWin() {
  if (!win) return;
  win.close();
  win = null;
}

function createLogoutWindow() {
  const logoutWindow = new BrowserWindow({
    show: false,
  });

  logoutWindow.loadURL(getLogOutUrl());

  logoutWindow.on('ready-to-show', async () => {
    await logout();
    logoutWindow.close();
  });
}

module.exports = { createAuthWindow, createLogoutWindow };
