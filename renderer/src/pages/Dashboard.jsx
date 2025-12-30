import React, { useEffect, useMemo, useState } from "react";
import { financeApi } from "../api/financeApi.js";
import MonthPicker from "../components/MonthPicker.jsx";
import AssetEditor from "../components/AssetEditor.jsx";
import AssetsTable from "../components/AssetsTable.jsx";
import { computeTotals, defaultMonthData, getNowYearMonth, monthKey } from "../utils/month.js";
import StatementImporter from "../components/StatmentImporter.jsx";

export default function Dashboard() {
  const now = getNowYearMonth();
  const [year, setYear] = useState(now.year);
  const [month, setMonth] = useState(now.month);

  const [monthRow, setMonthRow] = useState(null); // retorno do months:get
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const key = useMemo(() => monthKey(year, month), [year, month]);

  async function loadCurrentMonth() {
    setLoading(true);
    try {
      const row = await financeApi.monthsGet({ year, month });
      setMonthRow(row); // pode ser null
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCurrentMonth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  const data = useMemo(() => {
    if (!monthRow?.data) return null;
    return monthRow.data;
  }, [monthRow]);

  const assets = useMemo(() => (data?.assets ? data.assets : []), [data]);

  const netWorth = useMemo(() => {
    const total = assets.reduce((sum, a) => sum + (Number(a.total) || 0), 0);
    return total;
  }, [assets]);

  async function saveData(nextData) {
    setSaving(true);
    try {
      const fixed = computeTotals(nextData);
      await financeApi.monthsUpsert({ year, month, data: fixed });
      await loadCurrentMonth();
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateEmpty() {
    const empty = defaultMonthData(year, month);
    await saveData(empty);
  }

  async function handleCopyFromPrevious() {
    setSaving(true);
    try {
      await financeApi.monthsCopyFromPrevious({ year, month });
      await loadCurrentMonth();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Excluir o mês ${key}?`)) return;
    setSaving(true);
    try {
      await financeApi.monthsDelete({ year, month });
      setMonthRow(null);
    } finally {
      setSaving(false);
    }
  }

  function handleAddAsset(asset) {
    const base = data ?? defaultMonthData(year, month);
    const next = {
      ...base,
      assets: [...(base.assets || []), asset],
    };
    saveData(next);
  }

  function handleUpdateAsset(assetId, patch) {
    const base = data ?? defaultMonthData(year, month);
    const nextAssets = (base.assets || []).map((a) =>
      a.id === assetId ? { ...a, ...patch, lastUpdate: new Date().toISOString().slice(0, 10) } : a
    );
    saveData({ ...base, assets: nextAssets });
  }

  function handleRemoveAsset(assetId) {
    const base = data ?? defaultMonthData(year, month);
    const nextAssets = (base.assets || []).filter((a) => a.id !== assetId);
    saveData({ ...base, assets: nextAssets });
  }

  function onChangeMonth({ year: y, month: m }) {
    setYear(y);
    setMonth(m);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <MonthPicker
        year={year}
        month={month}
        onChange={onChangeMonth}
        onCreateEmpty={handleCreateEmpty}
        onCopyFromPrevious={handleCopyFromPrevious}
        onDelete={handleDelete}
      />

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ padding: 12, border: "1px solid #3333", borderRadius: 8 }}>
          <div style={{ opacity: 0.8, fontSize: 12 }}>Mês</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{key}</div>
        </div>

        <div style={{ padding: 12, border: "1px solid #3333", borderRadius: 8 }}>
          <div style={{ opacity: 0.8, fontSize: 12 }}>Patrimônio total</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            {netWorth.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </div>
        </div>

        <div style={{ opacity: 0.85 }}>
          {loading ? "Carregando..." : monthRow ? `Atualizado em: ${monthRow.updated_at}` : "Mês não existe ainda."}
          {saving ? " (salvando...)" : ""}
        </div>
      </div>

      {!monthRow && (
        <div style={{ padding: 12, border: "1px dashed #3336", borderRadius: 8 }}>
          <p style={{ margin: 0 }}>
            Esse mês ainda não foi criado. Você pode <b>criar vazio</b> ou <b>copiar do mês anterior</b>.
          </p>
        </div>
      )}

      <AssetEditor onAdd={handleAddAsset} />

      <div style={{ marginTop: 6 }}>
        <h3 style={{ margin: "10px 0" }}>Ativos do mês</h3>
        <AssetsTable assets={assets} onUpdateAsset={handleUpdateAsset} onRemoveAsset={handleRemoveAsset} />
      </div>

      <div style={{ marginTop: 10 }}>
        <h3 style={{ margin: "10px 0" }}>Notas do mês</h3>
        <textarea
          rows={4}
          style={{ width: "100%", padding: 10 }}
          value={data?.meta?.notes || ""}
          onChange={(e) => {
            const base = data ?? defaultMonthData(year, month);
            const next = { ...base, meta: { ...(base.meta || {}), notes: e.target.value } };
            saveData(next);
          }}
          placeholder="Ex: mudanças na carteira, observações..."
        />
      </div>

      <StatementImporter />
    </div>
  );
}
