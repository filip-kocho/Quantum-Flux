const path = require("path");
const { app, BrowserWindow, ipcMain } = require("electron");

function createWindow() {
  const window = new BrowserWindow({
    fullscreen: true,
    autoHideMenuBar: true,
    backgroundColor: "#03050a",
    icon: path.join(__dirname, "assets", "app-icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  window.loadFile("index.html");
}

app.whenReady().then(() => {
  ipcMain.handle("app:exit", () => {
    app.quit();
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
