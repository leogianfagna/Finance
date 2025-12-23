const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("finance", {
  monthsList: () => ipcRenderer.invoke("months:list"),
  monthsGet: (payload) => ipcRenderer.invoke("months:get", payload),
  monthsUpsert: (payload) => ipcRenderer.invoke("months:upsert", payload),
  monthsCopyFromPrevious: (payload) => ipcRenderer.invoke("months:copyFromPrevious", payload),
  monthsDelete: (payload) => ipcRenderer.invoke("months:delete", payload),
});
