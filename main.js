const path = require("path");
const os = require("os");
const { app, BrowserWindow, ipcMain } = require("electron");
const { WebSocket, WebSocketServer } = require("ws");

let mainWindow = null;
let networkServer = null;
let networkSocket = null;
let roomCode = null;
let nextPeerId = 2;
const peers = new Map();

function createWindow() {
  mainWindow = new BrowserWindow({
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

  mainWindow.loadFile("index.html");
}

function sendNetworkEvent(type, payload = {}) {
  if (!mainWindow?.isDestroyed()) mainWindow.webContents.send("network:event", { type, ...payload });
}

function localIPv4Addresses() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((entry) => entry && entry.family === "IPv4" && !entry.internal)
    .map((entry) => entry.address);
}

function closeNetwork() {
  if (networkSocket) {
    try { networkSocket.close(); } catch {}
    networkSocket = null;
  }
  peers.forEach(({ socket }) => {
    try { socket.close(); } catch {}
  });
  peers.clear();
  if (networkServer) {
    try { networkServer.close(); } catch {}
    networkServer = null;
  }
  roomCode = null;
  nextPeerId = 2;
}

function lobbyPeers() {
  return [...peers.entries()].map(([peerId, peer]) => ({ peerId, name: peer.name }));
}

function broadcastFromHost(message, targetPeerId = null) {
  const encoded = JSON.stringify(message);
  peers.forEach((peer, peerId) => {
    if (targetPeerId && peerId !== targetPeerId) return;
    if (peer.socket.readyState === WebSocket.OPEN) peer.socket.send(encoded);
  });
}

function startNetworkHost(hostName) {
  closeNetwork();
  roomCode = String(Math.floor(1000 + Math.random() * 9000));
  networkServer = new WebSocketServer({ host: "0.0.0.0", port: 0 });

  networkServer.on("connection", (socket) => {
    let acceptedPeerId = null;
    socket.on("message", (raw) => {
      let message;
      try { message = JSON.parse(raw.toString()); } catch { return; }
      if (!acceptedPeerId) {
        if (message.type !== "hello" || String(message.roomCode) !== roomCode || peers.size >= 3) {
          socket.send(JSON.stringify({ type: "join-rejected", reason: peers.size >= 3 ? "Lobby is full." : "Wrong room code." }));
          socket.close();
          return;
        }
        acceptedPeerId = `peer-${nextPeerId++}`;
        peers.set(acceptedPeerId, { socket, name: String(message.name || "Player").slice(0, 16) });
        socket.send(JSON.stringify({ type: "joined", peerId: acceptedPeerId, roomCode }));
        sendNetworkEvent("lobby-update", { hostName, peers: lobbyPeers() });
        return;
      }
      sendNetworkEvent("peer-message", { peerId: acceptedPeerId, message });
    });
    socket.on("close", () => {
      if (!acceptedPeerId) return;
      peers.delete(acceptedPeerId);
      sendNetworkEvent("lobby-update", { hostName, peers: lobbyPeers() });
      sendNetworkEvent("peer-left", { peerId: acceptedPeerId });
    });
  });

  return new Promise((resolve, reject) => {
    networkServer.once("listening", () => {
      const port = networkServer.address().port;
      resolve({ roomCode, port, addresses: localIPv4Addresses(), hostName, peers: [] });
    });
    networkServer.once("error", reject);
  });
}

function joinNetworkHost(address, code, name) {
  closeNetwork();
  const normalized = String(address || "").trim().replace(/^ws:\/\//, "");
  networkSocket = new WebSocket(`ws://${normalized}`);
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Connection timed out.")), 7000);
    networkSocket.once("open", () => {
      networkSocket.send(JSON.stringify({ type: "hello", roomCode: String(code || "").trim(), name }));
    });
    networkSocket.on("message", (raw) => {
      let message;
      try { message = JSON.parse(raw.toString()); } catch { return; }
      if (message.type === "joined") {
        clearTimeout(timeout);
        resolve(message);
      }
      if (message.type === "join-rejected") {
        clearTimeout(timeout);
        reject(new Error(message.reason));
      }
      sendNetworkEvent("host-message", { message });
    });
    networkSocket.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    networkSocket.once("close", () => sendNetworkEvent("disconnected"));
  });
}

app.whenReady().then(() => {
  ipcMain.handle("app:exit", () => app.quit());
  ipcMain.handle("network:host", (_event, options) => startNetworkHost(options?.name || "Host"));
  ipcMain.handle("network:join", (_event, options) => joinNetworkHost(options?.address, options?.roomCode, options?.name || "Player"));
  ipcMain.handle("network:leave", () => closeNetwork());
  ipcMain.handle("network:send", (_event, payload) => {
    if (networkServer) broadcastFromHost(payload.message, payload.targetPeerId || null);
    else if (networkSocket?.readyState === WebSocket.OPEN) networkSocket.send(JSON.stringify(payload.message));
  });

  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  closeNetwork();
  if (process.platform !== "darwin") app.quit();
});
