const { BrowserWindow, shell } = require('electron');
const { join } = require('node:path');

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

  win.loadURL('https://emoview.irfannm.xyz/');

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });
}

module.exports = { createAppWindow, win };
