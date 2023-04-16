const { contextBridge, ipcRenderer } = require('electron');

const electronAPI = {
  openFloating: (id, accessToken) =>
    ipcRenderer.send('floating:open', id, accessToken),
  closeFloating: () => ipcRenderer.send('floating:close'),
};

process.once('loaded', () => {
  contextBridge.exposeInMainWorld('electronAPI', electronAPI);
});
