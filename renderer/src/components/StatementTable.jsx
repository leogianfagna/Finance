import { useMemo, useState } from "react";

function toBRL(n) {
  const v = Number(n) || 0;
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function parseBRNumber(s) {
  if (typeof s === "number") return s;
  if (!s) return 0;
  // aceita "1.234,56" e "1234.56"
  const cleaned = String(s).trim().replace(/\./g, "").replace(",", ".");
  const v = Number(cleaned);
  return Number.isFinite(v) ? v : 0;
}

function uid() {
  return crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function calculateSummary(data) {
  let worthIn = 0;
  let worthOut = 0;

  data.forEach(({ amount }) => {
    if (amount < 0) worthOut += amount;
    if (amount > 0) worthIn += amount;
  });

  return { in: worthIn, out: worthOut, total: worthOut + worthIn };
}

export default function StatementTable({
  rows,
  onAddRow,
  onUpdateRow,
  onRemoveRow,
}) {
  const [draft, setDraft] = useState({
    date: "",
    description: "",
    category: "",
    amount: "",
    type: "debit",
    account: "",
  });

  const sorted = useMemo(() => {
    return [...(rows || [])].sort((a, b) =>
      String(a.date || "").localeCompare(String(b.date || ""))
    );
  }, [rows]);

  const statitics = useMemo(() => calculateSummary(sorted), [sorted]);

  function handleAdd() {
    const amount = parseBRNumber(draft.amount);
    if (!draft.date || !draft.description || !amount) return;

    onAddRow?.({
      id: uid(),
      date: draft.date,
      description: draft.description,
      category: draft.category || "",
      amount,
      type: draft.type,
      account: draft.account || "",
      createdAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString().slice(0, 10),
    });

    setDraft({
      date: "",
      description: "",
      category: "",
      amount: "",
      type: "debit",
      account: "",
    });
  }

  return (
    <>
      <div
        style={{
          border: "1px solid #3333",
          borderRadius: 10,
          padding: 12,
          marginTop: "1rem",
        }}
      >
        {/* Add row */}
        <div
          style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "end" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, opacity: 0.8 }}>Data</label>
            <input
              type="date"
              value={draft.date}
              onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              minWidth: 220,
            }}
          >
            <label style={{ fontSize: 12, opacity: 0.8 }}>Descrição</label>
            <input
              value={draft.description}
              onChange={(e) =>
                setDraft((d) => ({ ...d, description: e.target.value }))
              }
              placeholder="Ex: Mercado / Uber / Salário"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, opacity: 0.8 }}>Tipo</label>
            <select
              value={draft.type}
              onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}
            >
              <option value="debit">Débito</option>
              <option value="credit">Crédito</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, opacity: 0.8 }}>Valor</label>
            <input
              value={draft.amount}
              onChange={(e) => setDraft((d) => ({ ...d, amount: e.target.value }))}
              placeholder="Ex: 123,45"
              inputMode="decimal"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, opacity: 0.8 }}>Categoria</label>
            <input
              value={draft.category}
              onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
              placeholder="Ex: Alimentação"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, opacity: 0.8 }}>Conta</label>
            <input
              value={draft.account}
              onChange={(e) => setDraft((d) => ({ ...d, account: e.target.value }))}
              placeholder="Ex: Nubank"
            />
          </div>

          <button onClick={handleAdd} style={{ padding: "6px 10px" }}>
            Adicionar
          </button>
        </div>
      </div>

      <div style={{ marginTop: 10, opacity: 0.85, fontSize: 13 }}>
        Entrada: {toBRL(statitics.in)} | Saída: {toBRL(statitics.out)}
      </div>

      {/* Table */}
      <div style={{ marginTop: 10, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #3333" }}>
              <th style={{ padding: 8 }}>Data</th>
              <th style={{ padding: 8 }}>Descrição</th>
              <th style={{ padding: 8 }}>Tipo</th>
              <th style={{ padding: 8 }}>Valor</th>
              <th style={{ padding: 8 }}>Categoria</th>
              <th style={{ padding: 8 }}>Conta</th>
              <th style={{ padding: 8 }}>Ações</th>
            </tr>
          </thead>

          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 10, opacity: 0.7 }}>
                  Nenhum lançamento no extrato ainda.
                </td>
              </tr>
            ) : (
              sorted.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #3332" }}>
                  <td style={{ padding: 8 }}>
                    <input
                      type="date"
                      value={r.date || ""}
                      onChange={(e) => onUpdateRow?.(r.id, { date: e.target.value })}
                    />
                  </td>

                  <td style={{ padding: 8 }}>
                    <input
                      value={r.description || ""}
                      onChange={(e) =>
                        onUpdateRow?.(r.id, { description: e.target.value })
                      }
                      style={{ width: 260 }}
                    />
                  </td>

                  <td style={{ padding: 8 }}>
                    <select
                      value={r.type || "debit"}
                      onChange={(e) => onUpdateRow?.(r.id, { type: e.target.value })}
                    >
                      <option value="debit">Débito</option>
                      <option value="credit">Crédito</option>
                    </select>
                  </td>

                  <td style={{ padding: 8 }}>
                    <input
                      value={String(r.amount ?? "")}
                      onChange={(e) =>
                        onUpdateRow?.(r.id, {
                          amount: parseBRNumber(e.target.value),
                        })
                      }
                      style={{ width: 120 }}
                      inputMode="decimal"
                    />
                  </td>

                  <td style={{ padding: 8 }}>
                    <input
                      value={r.category || ""}
                      onChange={(e) =>
                        onUpdateRow?.(r.id, { category: e.target.value })
                      }
                    />
                  </td>

                  <td style={{ padding: 8 }}>
                    <input
                      value={r.account || ""}
                      onChange={(e) =>
                        onUpdateRow?.(r.id, { account: e.target.value })
                      }
                    />
                  </td>

                  <td style={{ padding: 8 }}>
                    <button
                      onClick={() => {
                        if (!confirm("Remover esse lançamento?")) return;
                        onRemoveRow?.(r.id);
                      }}
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
