import React from "react";

export default function AssetsTable({ assets, onUpdateAsset, onRemoveAsset }) {
  if (!assets.length) return <p style={{ opacity: 0.8 }}>Sem ativos neste mês.</p>;

  return (
    <div style={{ marginTop: 12, overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left" }}>
            <th style={{ borderBottom: "1px solid #3333", padding: 8 }}>Nome</th>
            <th style={{ borderBottom: "1px solid #3333", padding: 8 }}>Tipo</th>
            <th style={{ borderBottom: "1px solid #3333", padding: 8 }}>Qtd</th>
            <th style={{ borderBottom: "1px solid #3333", padding: 8 }}>Preço</th>
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

              <td style={{ borderBottom: "1px solid #3333", padding: 8 }}>
                <input
                  value={a.type || ""}
                  onChange={(e) => onUpdateAsset(a.id, { type: e.target.value })}
                />
              </td>

              <td style={{ borderBottom: "1px solid #3333", padding: 8 }}>
                <input
                  value={a.quantity ?? ""}
                  onChange={(e) =>
                    onUpdateAsset(a.id, { quantity: e.target.value === "" ? null : Number(e.target.value) })
                  }
                />
              </td>

              <td style={{ borderBottom: "1px solid #3333", padding: 8 }}>
                <input
                  value={a.price ?? ""}
                  onChange={(e) =>
                    onUpdateAsset(a.id, { price: e.target.value === "" ? null : Number(e.target.value) })
                  }
                />
              </td>

              <td style={{ borderBottom: "1px solid #3333", padding: 8 }}>
                <input
                  value={Number(a.total || 0)}
                  onChange={(e) => onUpdateAsset(a.id, { total: Number(e.target.value) || 0 })}
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
