import React, { useMemo, useState } from "react";

const TYPES = ["cash", "stock", "crypto", "fixed_income", "other"];

export default function AssetEditor({ onAdd }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("cash");
  const [total, setTotal] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const computedTotal = useMemo(() => {
    const q = Number(quantity);
    const p = Number(price);
    if (Number.isFinite(q) && Number.isFinite(p) && q > 0 && p > 0) return q * p;
    return null;
  }, [quantity, price]);

  function handleAdd() {
    const finalTotal =
      total !== "" ? Number(total) : computedTotal !== null ? computedTotal : 0;

    if (!name.trim()) return;

    onAdd({
      id: crypto.randomUUID?.() || String(Date.now()),
      name: name.trim(),
      type,
      quantity: quantity === "" ? null : Number(quantity),
      price: price === "" ? null : Number(price),
      total: Number.isFinite(finalTotal) ? finalTotal : 0,
      lastUpdate: new Date().toISOString().slice(0, 10),
    });

    setName("");
    setType("cash");
    setTotal("");
    setQuantity("");
    setPrice("");
  }

  return (
    <div style={{ border: "1px solid #3333", padding: 12, borderRadius: 8, marginTop: 12 }}>
      <h3 style={{ margin: "0 0 10px" }}>Adicionar ativo</h3>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <label style={{ display: "flex", flexDirection: "column" }}>
          Nome
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Nubank" />
        </label>

        <label style={{ display: "flex", flexDirection: "column" }}>
          Tipo
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column" }}>
          Total (R$)
          <input
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            placeholder="Se vazio, tenta qty*price"
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column" }}>
          Quantidade (opcional)
          <input value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </label>

        <label style={{ display: "flex", flexDirection: "column" }}>
          Preço (opcional)
          <input value={price} onChange={(e) => setPrice(e.target.value)} />
        </label>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <button onClick={handleAdd}>Adicionar</button>
        </div>
      </div>

      {computedTotal !== null && total === "" && (
        <div style={{ marginTop: 8, opacity: 0.85 }}>
          Total calculado (qty*price): <b>{computedTotal.toFixed(2)}</b>
        </div>
      )}
    </div>
  );
}
