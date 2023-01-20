const { BrowserWindow } = require('electron');
const { join } = require('node:path');

let floatWin = null;

const preload = join(__dirname, '../preload/index.js');

async function createFloatingWindow(width, id, accessToken) {
  floatWin = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: false,
      contextIsolation: true,
    },
    width: 256,
    height: 220,
    alwaysOnTop: true,
    focusable: true,
    frame: false,
    transparent: false,
    y: 48,
    x: width - 272,
  });

  if (process.env.NODE_ENV === 'local') {
    floatWin.loadURL(
      `http://localhost:5173/in-meeting-display?id=${id}&accessToken=${accessToken}
      `
    );
  } else {
    floatWin.loadURL(
      `https://emoview.irfannm.xyz/in-meeting-display?id=${id}&accessToken=${accessToken}
      `
    );
  }

  floatWin.setContentProtection(true);

  floatWin.once('ready-to-show', () => {
    floatWin.show();
  });
}

module.exports = { createFloatingWindow, floatWin };
