import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Grow,
  Paper,
  Slide,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { financeApi } from "../api/financeApi.js";
import MonthPicker from "../components/MonthPicker.jsx";
import AssetEditor from "../components/AssetEditor.jsx";
import AssetsTable from "../components/AssetsTable.jsx";
import StatementImporter from "../components/StatmentImporter.jsx";
import StatementTable from "../components/StatementTable.jsx";
import AppShell from "../components/layout/AppShell.jsx";
import MetricCard from "../components/common/MetricCard.jsx";
import { computeTotals, defaultMonthData, getNowYearMonth, monthKey } from "../utils/month.js";
import { generateMonthSummary } from "../utils/data.js";
import { ISODateToBR, numberToCurrencyBR } from "/src/utils/formatter.js";

const APP_MENU = [
  { key: "dashboard", label: "Dashboard" },
  { key: "historico", label: "Historico" },
  { key: "faturas", label: "Faturas" },
  { key: "notas", label: "Notas" },
];

function BreakdownCard({ title, rows }) {
  return (
    <Paper sx={{ p: 2, borderRadius: 3, height: "100%" }}>
      <Typography variant="subtitle1" mb={1.1}>
        {title}
      </Typography>
      {!rows.length ? (
        <Typography color="text.secondary">Sem dados neste mes.</Typography>
      ) : (
        <Stack gap={0.9}>
          {rows.map(([label, value]) => (
            <Stack key={label} direction="row" justifyContent="space-between">
              <Typography color="text.secondary">{label || "Nao informado"}</Typography>
              <Typography fontWeight={600}>{numberToCurrencyBR(value)}</Typography>
            </Stack>
          ))}
        </Stack>
      )}
    </Paper>
  );
}

function InvoicesPanel({ rows }) {
  const invoices = useMemo(() => {
    return (rows || []).filter((item) => item.type === "credit" || item.category === "Pagamentos");
  }, [rows]);

  const total = useMemo(() => invoices.reduce((sum, row) => sum + (Number(row.amount) || 0), 0), [invoices]);

  return (
    <Stack gap={1.2}>
      <Alert severity="info" variant="outlined">
        Total de faturas identificadas: <b>{numberToCurrencyBR(total)}</b>
      </Alert>
      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Typography variant="subtitle1" mb={1}>
          Lancamentos de fatura ({invoices.length})
        </Typography>
        {!invoices.length ? (
          <Typography color="text.secondary">Nao ha lancamentos de fatura para este mes.</Typography>
        ) : (
          <Stack gap={0.8}>
            {invoices.map((row) => (
              <Stack
                key={row.id}
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                sx={{
                  p: 1.2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                <Typography>{row.description || "Sem descricao"}</Typography>
                <Stack direction="row" gap={1} alignItems="center">
                  <Chip size="small" label={row.date || "Sem data"} />
                  <Typography fontWeight={600}>{numberToCurrencyBR(row.amount)}</Typography>
                </Stack>
              </Stack>
            ))}
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}

export default function Dashboard() {
  const now = getNowYearMonth();
  const [year, setYear] = useState(now.year);
  const [month, setMonth] = useState(now.month);
  const selectedMonth = useMemo(() => monthKey(year, month), [year, month]);

  const [monthData, setMonthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savingLoading, setSavingLoading] = useState(false);
  const [page, setPage] = useState("dashboard");

  async function loadCurrentMonthData() {
    setLoading(true);
    try {
      const row = await financeApi.monthsGet({ year, month });
      setMonthData(row);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCurrentMonthData();
  }, [year, month]);

  const data = useMemo(() => {
    if (!monthData?.data) return null;
    return monthData.data;
  }, [monthData]);

  const assets = useMemo(() => (data?.assets ? data.assets : []), [data]);
  const statement = useMemo(() => (data?.statement ? data.statement : []), [data]);

  const netWorth = useMemo(() => {
    return assets.reduce((sum, a) => sum + (Number(a.total) || 0), 0);
  }, [assets]);

  const summaryData = useMemo(() => generateMonthSummary(monthData), [monthData]);
  const totalStatement = useMemo(
    () => statement.reduce((sum, row) => sum + (Number(row.amount) || 0), 0),
    [statement]
  );

  async function saveData(nextData) {
    setSavingLoading(true);
    try {
      const fixedWithTotalBalance = computeTotals(nextData);
      await financeApi.monthsUpsert({ year, month, data: fixedWithTotalBalance });
      await loadCurrentMonthData();
    } finally {
      setSavingLoading(false);
    }
  }

  async function handleCreateEmpty() {
    const empty = defaultMonthData(year, month);
    await saveData(empty);
  }

  async function handleCopyFromPrevious() {
    setSavingLoading(true);
    try {
      await financeApi.monthsCopyFromPrevious({ year, month });
      await loadCurrentMonthData();
    } finally {
      setSavingLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Excluir o mes ${selectedMonth}?`)) return;
    setSavingLoading(true);
    try {
      await financeApi.monthsDelete({ year, month });
      setMonthData(null);
    } finally {
      setSavingLoading(false);
    }
  }

  function handleAddAsset(asset) {
    const base = data ?? defaultMonthData(year, month);
    saveData({
      ...base,
      assets: [...(base.assets || []), asset],
    });
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

  function handleAddStatementRow(newStatement) {
    const base = data ?? defaultMonthData(year, month);
    saveData({
      ...base,
      statement: [...(base.statement || []), newStatement],
    });
  }

  function handleUpdateStatementRow(statementId, patch) {
    const base = data ?? defaultMonthData(year, month);
    const nextStatement = (base.statement || []).map((r) =>
      r.id === statementId ? { ...r, ...patch, lastUpdate: new Date().toISOString().slice(0, 10) } : r
    );
    saveData({ ...base, statement: nextStatement });
  }

  function handleRemoveStatementRow(statementId) {
    const base = data ?? defaultMonthData(year, month);
    const nextStatement = (base.statement || []).filter((r) => r.id !== statementId);
    saveData({ ...base, statement: nextStatement });
  }

  function handleSaveStatementRows(fixedImportedStatement) {
    const base = data ?? defaultMonthData(year, month);
    const current = base.statement || [];
    const nextData = current.concat(fixedImportedStatement);
    saveData({ ...base, statement: nextData });
  }

  function onChangeMonth({ year: y, month: m }) {
    setYear(y);
    setMonth(m);
  }

  const summaryByInstitution = Object.entries(summaryData?.totalByInstitution || {});
  const summaryByType = Object.entries(summaryData?.totalByType || {});

  return (
    <AppShell
      title="Patrimonio mensal"
      subtitle="Aplicacao offline Electron"
      menu={APP_MENU}
      activeKey={page}
      onNavigate={setPage}
    >
      <Stack gap={1.5}>
        <MonthPicker
          year={year}
          month={month}
          onChange={onChangeMonth}
          onCreateEmpty={handleCreateEmpty}
          onCopyFromPrevious={handleCopyFromPrevious}
          onDelete={handleDelete}
          disabled={savingLoading}
        />

        {savingLoading && (
          <Alert severity="info" icon={<CircularProgress size={16} />}>
            Salvando alteracoes...
          </Alert>
        )}

        {!monthData && (
          <Alert severity="warning">
            Esse mes ainda nao foi criado. Use "Criar mes vazio" ou "Copiar mes anterior".
          </Alert>
        )}

        <Stack direction={{ xs: "column", md: "row" }} gap={1.3} flexWrap="wrap">
          <Grow in timeout={300}>
            <Box sx={{ flex: "1 1 240px" }}>
              <MetricCard label="Mes selecionado" value={selectedMonth} />
            </Box>
          </Grow>
          <Grow in timeout={360}>
            <Box sx={{ flex: "1 1 240px" }}>
              <MetricCard label="Patrimonio do mes" value={numberToCurrencyBR(netWorth)} />
            </Box>
          </Grow>
          <Grow in timeout={420}>
            <Box sx={{ flex: "1 1 240px" }}>
              <MetricCard label="Ativos cadastrados" value={String(assets.length)} accent="secondary.main" />
            </Box>
          </Grow>
          <Grow in timeout={480}>
            <Box sx={{ flex: "1 1 240px" }}>
              <MetricCard label="Saldo do extrato" value={numberToCurrencyBR(totalStatement)} accent="success.main" />
            </Box>
          </Grow>
        </Stack>

        <Slide direction="up" in timeout={320} mountOnEnter unmountOnExit key={page}>
          <Box>
            {page === "dashboard" && (
              <Stack gap={1.4}>
                <AssetEditor onAdd={handleAddAsset} />
                <AssetsTable
                  assets={assets}
                  onUpdateAsset={handleUpdateAsset}
                  onRemoveAsset={handleRemoveAsset}
                />
                <Stack direction={{ xs: "column", md: "row" }} gap={1.3}>
                  <Box sx={{ flex: 1 }}>
                    <BreakdownCard title="Total por instituicao" rows={summaryByInstitution} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <BreakdownCard title="Total por tipo de ativo" rows={summaryByType} />
                  </Box>
                </Stack>
              </Stack>
            )}

            {page === "historico" && (
              <Stack gap={1.4}>
                <StatementImporter onImport={handleSaveStatementRows} />
                <StatementTable
                  rows={statement}
                  onAddRow={handleAddStatementRow}
                  onUpdateRow={handleUpdateStatementRow}
                  onRemoveRow={handleRemoveStatementRow}
                />
              </Stack>
            )}

            {page === "faturas" && <InvoicesPanel rows={statement} />}

            {page === "notas" && (
              <Paper sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="subtitle1" mb={1.2}>
                  Notas do mes
                </Typography>
                <TextField
                  multiline
                  minRows={5}
                  fullWidth
                  value={data?.meta?.notes || ""}
                  onChange={(e) => {
                    const base = data ?? defaultMonthData(year, month);
                    const next = {
                      ...base,
                      meta: { ...(base.meta || {}), notes: e.target.value },
                    };
                    saveData(next);
                  }}
                  placeholder="Ex: mudancas na carteira, observacoes..."
                />
              </Paper>
            )}
          </Box>
        </Slide>

        {(loading || monthData) && (
          <Typography color="text.secondary" fontSize={13}>
            {loading
              ? "Atualizando dados do mes..."
              : `Ultima modificacao: ${ISODateToBR(monthData?.updated_at)}`}
          </Typography>
        )}
      </Stack>
    </AppShell>
  );
}
