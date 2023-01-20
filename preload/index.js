const { contextBridge, ipcRenderer } = require('electron');

const electronAPI = {
  getAccessToken: () => ipcRenderer.invoke('auth:get-accessToken'),
  getProfile: () => ipcRenderer.invoke('auth:get-profile'),
  logOut: () => ipcRenderer.send('auth:log-out'),

  openFloating: () => ipcRenderer.invoke('floating:open'),
  closeFloating: () => ipcRenderer.invoke('floating:close'),
};

process.once('loaded', () => {
  contextBridge.exposeInMainWorld('electronAPI', electronAPI);
});
