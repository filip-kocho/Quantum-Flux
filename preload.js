const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("QuantumFluxDesktop", {
  exitApp: () => ipcRenderer.invoke("app:exit")
});
