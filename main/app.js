const { BrowserWindow, shell } = require('electron');
const { join } = require('node:path');
const {LOCAL_FE_ENDPOINT, PROD_FE_ENDPOINT} = require("./constants");

let win = null;

const preload = join(__dirname, '../preload/index.js');

async function createAppWindow() {
  win = new BrowserWindow({
    title: 'Emoview',
    icon: join(__dirname, './static/icon.png'),
    webPreferences: {
      preload,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#f1f2f6',
    },
    width: 1200,
    height: 800,
  });

  if (process.env.NODE_ENV === 'local') {
    win.loadURL(LOCAL_FE_ENDPOINT);
  } else {
    win.loadURL(PROD_FE_ENDPOINT);
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) shell.openExternal(url);
    return { action: 'deny' };
  });

  win.webContents.on('did-fail-load', () => {
    win.loadURL('https://emoview.irfannm.xyz');
  });
}

module.exports = { createAppWindow, win };
