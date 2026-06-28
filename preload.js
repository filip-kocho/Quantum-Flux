const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("QuantumFluxDesktop", {
  exitApp: () => ipcRenderer.invoke("app:exit"),
  hostNetworkGame: (options) => ipcRenderer.invoke("network:host", options),
  joinNetworkGame: (options) => ipcRenderer.invoke("network:join", options),
  leaveNetworkGame: () => ipcRenderer.invoke("network:leave"),
  sendNetworkMessage: (message, targetPeerId = null) => ipcRenderer.invoke("network:send", { message, targetPeerId }),
  onNetworkEvent: (listener) => {
    const wrapped = (_event, payload) => listener(payload);
    ipcRenderer.on("network:event", wrapped);
    return () => ipcRenderer.removeListener("network:event", wrapped);
  }
});
