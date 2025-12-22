const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { getDb } = require("./db");

let mainWindow;

const isDev = !!process.env.VITE_DEV_SERVER_URL;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, "../renderer/dist/index.html");
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  const db = getDb();

  // IPC handlers para todos
  ipcMain.handle("todos:list", () => {
    const rows = db.prepare("SELECT * FROM todos ORDER BY created_at DESC").all();
    return rows;
  });

  ipcMain.handle("todos:add", (_event, todo) => {
    const stmt = db.prepare("INSERT INTO todos (text, done) VALUES (?, ?)");
    const info = stmt.run(todo.text, 0);
    return { id: info.lastInsertRowid };
  });

  ipcMain.handle("todos:toggle", (_event, id) => {
    const row = db.prepare("SELECT done FROM todos WHERE id = ?").get(id);
    if (!row) return { success: false };
    const newDone = row.done ? 0 : 1;
    db.prepare("UPDATE todos SET done = ? WHERE id = ?").run(newDone, id);
    return { success: true };
  });

  ipcMain.handle("todos:delete", (_event, id) => {
    db.prepare("DELETE FROM todos WHERE id = ?").run(id);
    return { success: true };
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
