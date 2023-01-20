const { BrowserWindow } = require('electron');
const { join } = require('node:path');

let floatWin = null;

const preload = join(__dirname, '../preload/index.js');

async function createFloatingWindow(width, ...arg) {
  floatWin = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: false,
      contextIsolation: true,
    },
    width: 256,
    height: 220,
    alwaysOnTop: true,
    focusable: false,
    frame: false,
    transparent: true,
    y: 48,
    x: width - 272,
  });

  floatWin.loadURL(`https://google.com`);

  floatWin.setContentProtection(true);

  floatWin.once('ready-to-show', () => {
    floatWin.show();
  });
}

module.exports = { createFloatingWindow, floatWin };
