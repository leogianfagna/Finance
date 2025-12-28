import React from "react";
import { TYPES, INSTITUTIONS } from "/src/constants/constants";

export default function AssetsTable({ assets, onUpdateAsset, onRemoveAsset }) {
  if (!assets.length) return <p style={{ opacity: 0.8 }}>Sem ativos neste mês.</p>;

  function toNumberBR(value) {
    if (typeof value !== "string") return NaN;
    const normalized = value.replace(/\./g, "").replace(",", ".");
    return Number(normalized);
  }

  return (
    <div style={{ marginTop: 12, overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left" }}>
            <th style={{ borderBottom: "1px solid #3333", padding: 8 }}>Nome</th>
            <th style={{ borderBottom: "1px solid #3333", padding: 8 }}>Tipo</th>
            <th style={{ borderBottom: "1px solid #3333", padding: 8 }}>Instituição</th>
            <th style={{ borderBottom: "1px solid #3333", padding: 8 }}>Total</th>
            <th style={{ borderBottom: "1px solid #3333", padding: 8 }}>Ações</th>
          </tr>
        </thead>

        <tbody>
          {assets.map((a) => (
            <tr key={a.id}>
              <td style={{ borderBottom: "1px solid #3333", padding: 8 }}>
                <input
                  value={a.name || ""}
                  onChange={(e) => onUpdateAsset(a.id, { name: e.target.value })}
                />
              </td>

              {/* Tipo agora é select (não texto) */}
              <td style={{ borderBottom: "1px solid #3333", padding: 8 }}>
                <select
                  value={a.type || "cash"}
                  onChange={(e) => onUpdateAsset(a.id, { type: e.target.value })}
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </td>

              {/* Instituição agora é select (não texto) */}
              <td style={{ borderBottom: "1px solid #3333", padding: 8 }}>
                <select
                  value={a.institution || ""}
                  onChange={(e) => onUpdateAsset(a.id, { institution: e.target.value })}
                >
                  <option value="" disabled>
                    Selecione...
                  </option>
                  {INSTITUTIONS.map((inst) => (
                    <option key={inst} value={inst}>
                      {inst}
                    </option>
                  ))}
                </select>
              </td>

              <td style={{ borderBottom: "1px solid #3333", padding: 8 }}>
                <input
                  inputMode="decimal"
                  value={String(a.total ?? "")}
                  onChange={(e) => {
                    const raw = e.target.value;
                    // permite limpar o campo sem virar 0 imediatamente
                    if (raw === "") {
                      onUpdateAsset(a.id, { total: 0 });
                      return;
                    }
                    const n = toNumberBR(raw);
                    onUpdateAsset(a.id, { total: Number.isFinite(n) ? n : 0 });
                  }}
                />
              </td>

              <td style={{ borderBottom: "1px solid #3333", padding: 8 }}>
                <button onClick={() => onRemoveAsset(a.id)}>Remover</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
