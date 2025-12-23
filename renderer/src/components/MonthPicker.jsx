import React from "react";

export default function MonthPicker({
  year,
  month,
  onChange,
  onCreateEmpty,
  onCopyFromPrevious,
  onDelete,
}) {
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 5; y <= currentYear + 2; y++) years.push(y);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <label>
        Ano:{" "}
        <select value={year} onChange={(e) => onChange({ year: Number(e.target.value), month })}>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </label>

      <label>
        Mês:{" "}
        <select value={month} onChange={(e) => onChange({ year, month: Number(e.target.value) })}>
          {months.map((m) => (
            <option key={m} value={m}>
              {String(m).padStart(2, "0")}
            </option>
          ))}
        </select>
      </label>

      <button onClick={onCreateEmpty}>Criar mês vazio</button>
      <button onClick={onCopyFromPrevious}>Copiar do mês anterior</button>
      <button onClick={onDelete} style={{ marginLeft: "auto" }}>
        Excluir mês
      </button>
    </div>
  );
}
