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

  if (process.env.NODE_ENV === 'local') {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadURL('https://emoview-v2-dev.vercel.app/');
  }

  // if (process.platform === 'linux') {
  //   win.autoHideMenuBar(true);
  // }

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) shell.openExternal(url);
    return { action: 'deny' };
  });

  win.webContents.on('did-fail-load', () => {
    win.loadURL('https://emoview.irfannm.xyz');
  });
}

module.exports = { createAppWindow, win };
