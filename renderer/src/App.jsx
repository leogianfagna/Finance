import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  return (
    <div style={{ fontFamily: "system-ui, Arial", padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ margin: "8px 0 16px" }}>Patrimônio mensal (offline)</h1>
      <Dashboard />
    </div>
  );
}
