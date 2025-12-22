import React, { useEffect, useState } from "react";
import "./style.css";

function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");

  const loadTodos = async () => {
    const list = await window.api.listTodos();
    setTodos(list);
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await window.api.addTodo(text.trim());
    setText("");
    await loadTodos();
  };

  const handleToggle = async (id) => {
    await window.api.toggleTodo(id);
    await loadTodos();
  };

  const handleDelete = async (id) => {
    await window.api.deleteTodo(id);
    await loadTodos();
  };

  return (
    <div className="container">
      <h1>Electron + React Todo</h1>
      <p className="subtitle">
        Os dados são salvos localmente em um banco SQLite no seu computador.
      </p>

      <form onSubmit={handleAdd} className="form">
        <input
          className="input"
          placeholder="Digite uma tarefa..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="button">
          Adicionar
        </button>
      </form>

      <ul className="list">
        {todos.map((todo) => (
          <li key={todo.id} className="item">
            <span
              className={`text ${todo.done ? "done" : ""}`}
              onClick={() => handleToggle(todo.id)}
            >
              {todo.text}
            </span>
            <button
              className="delete"
              onClick={() => handleDelete(todo.id)}
            >
              X
            </button>
          </li>
        ))}
        {todos.length === 0 && (
          <li className="empty">Nenhuma tarefa ainda. Adicione a primeira!</li>
        )}
      </ul>
    </div>
  );
}

export default App;
