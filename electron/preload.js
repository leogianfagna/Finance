const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  listTodos: () => ipcRenderer.invoke("todos:list"),
  addTodo: (text) => ipcRenderer.invoke("todos:add", { text }),
  toggleTodo: (id) => ipcRenderer.invoke("todos:toggle", id),
  deleteTodo: (id) => ipcRenderer.invoke("todos:delete", id)
});
