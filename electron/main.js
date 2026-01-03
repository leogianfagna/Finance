const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { getDb, monthKey, defaultMonthData } = require("./db");

let mainWindow;
const isDev = !!process.env.VITE_DEV_SERVER_URL;
const USER_ID = 1; // single-user offline

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
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

function nowISO() {
  return new Date().toISOString();
}

/**
 * Declaração das funções da API para utilizar o banco de dados SQLite. Cada função de manipulação
 * do DB é declarada dentro desse app com ipcMain e depois são invocadas no preload.js. Para ser
 * usado na aplicação, chamar no financeApi.js as funções do preload.
 */
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  const db = getDb();

  /**
   * Listar todos os meses adicionado por um usuário.
   * @returns {Object[]} Lista de meses com as propriedades do SELECT.
   */
  ipcMain.handle("months:list", () => {
    return db
      .prepare(
        `
        SELECT id, year, month, updated_at, copied_from
        FROM months
        WHERE user_id = ?
        ORDER BY year DESC, month DESC
      `
      )
      .all(USER_ID);
  });

  /**
   * MONTHS: buscar mês específico (year, month)
   * Retorna: { id, year, month, data, updated_at, copied_from } ou null
   */
  ipcMain.handle("months:get", (_event, { year, month }) => {
    const row = db
      .prepare(
        `
        SELECT id, year, month, data_json, updated_at, copied_from
        FROM months
        WHERE user_id = ? AND year = ? AND month = ?
      `
      )
      .get(USER_ID, year, month);

    if (!row) return null;

    let data = null;
    try {
      data = JSON.parse(row.data_json);
    } catch {
      // Se corromper, pelo menos não quebra o app inteiro
      data = defaultMonthData({ year, month });
    }

    return {
      id: row.id,
      year: row.year,
      month: row.month,
      data,
      updated_at: row.updated_at,
      copied_from: row.copied_from,
    };
  });

  /**
   * MONTHS: criar ou atualizar mês (upsert)
   * payload: { year, month, data }  (data é objeto JS)
   * Retorna: { id, key }
   */
  ipcMain.handle("months:upsert", (_event, { year, month, data }) => {
    const key = monthKey(year, month);

    // Garantir formato mínimo
    const safeData = data ?? defaultMonthData({ year, month });
    if (!safeData.month) safeData.month = key;
    if (!safeData.assets) safeData.assets = [];
    if (!safeData.extract) safeData.extract = [];
    if (!safeData.totals) safeData.totals = { netWorth: 0 };
    if (!safeData.meta) safeData.meta = { copiedFrom: null, notes: "" };

    const json = JSON.stringify(safeData);

    // Tenta atualizar; se não existir, cria
    const update = db
      .prepare(
        `
        UPDATE months
        SET data_json = ?, updated_at = ?
        WHERE user_id = ? AND year = ? AND month = ?
      `
      )
      .run(json, nowISO(), USER_ID, year, month);

    if (update.changes > 0) {
      const row = db
        .prepare(
          `SELECT id FROM months WHERE user_id = ? AND year = ? AND month = ?`
        )
        .get(USER_ID, year, month);

      return { id: row.id, key };
    }

    const insert = db
      .prepare(
        `
        INSERT INTO months (user_id, year, month, data_json, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `
      )
      .run(USER_ID, year, month, json, nowISO());

    return { id: insert.lastInsertRowid, key };
  });

  /**
   * MONTHS: criar mês copiando do anterior
   * payload: { year, month }  (mês alvo)
   * Comportamento:
   * - procura mês anterior existente
   * - copia data_json
   * - seta meta.copiedFrom e coluna copied_from
   * Retorna: { id, key, copiedFrom } ou { id, key, copiedFrom: null } se criou vazio
   */
  ipcMain.handle("months:copyFromPrevious", (_event, { year, month }) => {
    // Calcula mês anterior
    let prevYear = year;
    let prevMonth = month - 1;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }

    const prevRow = db
      .prepare(
        `
        SELECT data_json
        FROM months
        WHERE user_id = ? AND year = ? AND month = ?
      `
      )
      .get(USER_ID, prevYear, prevMonth);

    const targetKey = monthKey(year, month);
    const prevKey = monthKey(prevYear, prevMonth);

    let data = defaultMonthData({ year, month });
    let copiedFrom = null;

    if (prevRow) {
      try {
        data = JSON.parse(prevRow.data_json);
      } catch {
        data = defaultMonthData({ year, month });
      }

      // Ajusta o doc para o mês novo
      data.month = targetKey;
      data.meta = data.meta || {};
      data.meta.copiedFrom = prevKey;
      copiedFrom = prevKey;
    }

    const json = JSON.stringify(data);

    // Cria (se já existir, não sobrescreve)
    try {
      const insert = db
        .prepare(
          `
          INSERT INTO months (user_id, year, month, data_json, copied_from, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `
        )
        .run(USER_ID, year, month, json, copiedFrom, nowISO());

      return { id: insert.lastInsertRowid, key: targetKey, copiedFrom };
    } catch (e) {
      // UNIQUE(user_id, year, month) pode estourar se já existir
      const existing = db
        .prepare(
          `SELECT id FROM months WHERE user_id = ? AND year = ? AND month = ?`
        )
        .get(USER_ID, year, month);

      return { id: existing.id, key: targetKey, copiedFrom: "already-exists" };
    }
  });

  /**
   * MONTHS: deletar um mês
   * payload: { year, month }
   */
  ipcMain.handle("months:delete", (_event, { year, month }) => {
    const info = db
      .prepare(
        `DELETE FROM months WHERE user_id = ? AND year = ? AND month = ?`
      )
      .run(USER_ID, year, month);

    return { success: info.changes > 0 };
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
