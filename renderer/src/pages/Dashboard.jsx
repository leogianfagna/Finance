import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
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
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import WavingHandRoundedIcon from "@mui/icons-material/WavingHandRounded";
import { financeApi } from "../api/financeApi.js";
import MonthPicker from "../components/MonthPicker.jsx";
import AssetEditor from "../components/AssetEditor.jsx";
import AssetsTable from "../components/AssetsTable.jsx";
import StatementImporter from "../components/StatmentImporter.jsx";
import StatementTable from "../components/StatementTable.jsx";
import MonthsOverview from "../components/MonthsOverview.jsx";
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
  { key: "meses", label: "Meses" },
];

function BreakdownCard({ title, rows }) {
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 4,
        height: "100%",
        background:
          "linear-gradient(150deg, rgba(255, 255, 255, 0.97) 0%, rgba(241, 245, 255, 0.94) 85%, rgba(255, 243, 231, 0.9) 100%)",
      }}
    >
      <Typography variant="subtitle1" mb={1.1}>
        {title}
      </Typography>
      {!rows.length ? (
        <Typography color="text.secondary">Sem dados neste mes.</Typography>
      ) : (
        <Stack gap={0.9}>
          {rows.map(([label, value]) => (
            <Stack
              key={label}
              direction="row"
              justifyContent="space-between"
              sx={{ p: 1, borderRadius: 2.5, bgcolor: "rgba(255,255,255,0.65)" }}
            >
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
      <Alert severity="info" variant="filled" sx={{ borderRadius: 3 }}>
        Total de faturas identificadas: <b>{numberToCurrencyBR(total)}</b>
      </Alert>
      <Paper
        sx={{
          p: 2,
          borderRadius: 4,
          background:
            "linear-gradient(140deg, rgba(255,255,255,0.98) 0%, rgba(242,246,255,0.96) 60%, rgba(255,244,235,0.9) 100%)",
        }}
      >
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
                  borderColor: "rgba(108, 123, 241, 0.2)",
                  borderRadius: 2.5,
                  bgcolor: "rgba(255,255,255,0.72)",
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
  const [monthsOverviewRows, setMonthsOverviewRows] = useState([]);
  const [monthsOverviewLoading, setMonthsOverviewLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingLoading, setSavingLoading] = useState(false);
  const [page, setPage] = useState("dashboard");

  async function loadCurrentMonthData() {
    setLoading(true);
    try {
      setMonthData(null);
      const row = await financeApi.monthsGet({ year, month });
      setMonthData(row);
    } finally {
      setLoading(false);
    }
  }

  async function loadMonthsOverview() {
    setMonthsOverviewLoading(true);
    try {
      const list = await financeApi.monthsList();
      if (!Array.isArray(list) || list.length === 0) {
        setMonthsOverviewRows([]);
        return;
      }

      const detailList = await Promise.all(
        list.map((item) => financeApi.monthsGet({ year: item.year, month: item.month }))
      );

      const rows = list.map((item, idx) => {
        const detail = detailList[idx];
        const detailsData = detail?.data || defaultMonthData(item.year, item.month);
        const assets = detailsData.assets || [];
        const statementRows = detailsData.statement || [];
        const netWorth =
          Number(detailsData?.totals?.netWorth) ||
          assets.reduce((sum, asset) => sum + (Number(asset.total) || 0), 0);
        const statementTotal = statementRows.reduce(
          (sum, statement) => sum + (Number(statement.amount) || 0),
          0
        );

        return {
          id: item.id || `${item.year}-${item.month}`,
          month: monthKey(item.year, item.month),
          netWorth,
          assetsCount: assets.length,
          statementCount: statementRows.length,
          statementTotal,
          updatedAt: ISODateToBR(detail?.updated_at || item.updated_at),
          hasData: detail != null,
        };
      });

      setMonthsOverviewRows(rows);
    } finally {
      setMonthsOverviewLoading(false);
    }
  }

  useEffect(() => {
    loadCurrentMonthData();
    loadMonthsOverview();
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
  const invoiceTotal = useMemo(
    () =>
      statement
        .filter((item) => item.type === "credit" || item.category === "Pagamentos")
        .reduce((sum, row) => sum + (Number(row.amount) || 0), 0),
    [statement]
  );
  const netWorthSeries = useMemo(() => {
    const sorted = [...(monthsOverviewRows || [])]
      .filter((row) => Number.isFinite(Number(row.netWorth)))
      .sort((a, b) => String(a.month).localeCompare(String(b.month)));
    if (!sorted.length) return [0];
    return sorted.map((row) => Number(row.netWorth) || 0);
  }, [monthsOverviewRows]);
  const totalStatementSeries = useMemo(() => {
    const sorted = [...(monthsOverviewRows || [])]
      .filter((row) => Number.isFinite(Number(row.statementTotal)))
      .sort((a, b) => String(a.month).localeCompare(String(b.month)));
    if (!sorted.length) return [0];
    return sorted.map((row) => Number(row.statementTotal) || 0);
  }, [monthsOverviewRows]);
  const assetsSeries = useMemo(() => {
    const sorted = [...(monthsOverviewRows || [])]
      .filter((row) => Number.isFinite(Number(row.assetsCount)))
      .sort((a, b) => String(a.month).localeCompare(String(b.month)));
    if (!sorted.length) return [0];
    return sorted.map((row) => Number(row.assetsCount) || 0);
  }, [monthsOverviewRows]);
  const previousMonthKey = useMemo(() => {
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    return monthKey(prevYear, prevMonth);
  }, [year, month]);
  const previousMonthNetWorth = useMemo(() => {
    const prev = (monthsOverviewRows || []).find((row) => row.month === previousMonthKey);
    return Number(prev?.netWorth) || 0;
  }, [monthsOverviewRows, previousMonthKey]);
  const netWorthEvolution = useMemo(() => {
    const diff = netWorth - previousMonthNetWorth;
    if (!previousMonthNetWorth && !netWorth) {
      return { pct: 0, diff };
    }
    if (!previousMonthNetWorth) {
      return { pct: 100, diff };
    }
    return { pct: (diff / Math.abs(previousMonthNetWorth)) * 100, diff };
  }, [netWorth, previousMonthNetWorth]);

  async function saveData(nextData) {
    setSavingLoading(true);
    try {
      const fixedWithTotalBalance = computeTotals(nextData);
      await financeApi.monthsUpsert({ year, month, data: fixedWithTotalBalance });
      await loadCurrentMonthData();
      await loadMonthsOverview();
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
      await loadMonthsOverview();
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
      await loadMonthsOverview();
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

  async function handleCreateMonthFromOverview({ year: targetYear, month: targetMonth, copyFrom }) {
    const exists = await financeApi.monthsGet({ year: targetYear, month: targetMonth });
    if (exists) {
      throw new Error(`O mes ${monthKey(targetYear, targetMonth)} ja existe.`);
    }

    if (!copyFrom) {
      const empty = defaultMonthData(targetYear, targetMonth);
      await financeApi.monthsUpsert({ year: targetYear, month: targetMonth, data: empty });
      await loadMonthsOverview();
      return;
    }

    const [copyYearRaw, copyMonthRaw] = String(copyFrom).split("-");
    const copyYear = Number(copyYearRaw);
    const copyMonth = Number(copyMonthRaw);
    const baseMonth = await financeApi.monthsGet({ year: copyYear, month: copyMonth });

    if (!baseMonth?.data) {
      throw new Error("Nao foi possivel carregar o mes base selecionado.");
    }

    const cloned = JSON.parse(JSON.stringify(baseMonth.data));
    cloned.month = monthKey(targetYear, targetMonth);
    cloned.meta = {
      ...(cloned.meta || {}),
      copiedFrom: monthKey(copyYear, copyMonth),
    };

    await financeApi.monthsUpsert({
      year: targetYear,
      month: targetMonth,
      data: computeTotals(cloned),
    });
    await loadMonthsOverview();
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
      periodSelector={{
        year,
        month,
        onChange: onChangeMonth,
        disabled: savingLoading,
      }}
    >
      <Stack gap={1.5}>
        <Paper
          sx={{
            p: { xs: 1.8, md: 2.2 },
            borderRadius: 5,
            position: "relative",
            overflow: "hidden",
            background:
              "linear-gradient(120deg, rgba(228, 233, 255, 0.95) 0%, rgba(239, 242, 255, 0.95) 48%, rgba(255, 233, 210, 0.92) 100%)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              right: -30,
              top: -42,
              width: 160,
              height: 160,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255, 186, 126, 0.42) 0%, rgba(255, 186, 126, 0) 70%)",
            }}
          />
          <Stack direction={{ xs: "column", md: "row" }} gap={1.2} justifyContent="space-between">
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Avatar sx={{ bgcolor: "primary.main", width: 42, height: 42 }}>
                <WavingHandRoundedIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ lineHeight: 1.1 }}>
                  Ola! Vamos cuidar do seu mes financeiro
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Painel amigavel com foco em organizacao e consistencia.
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" gap={0.8} flexWrap="wrap" alignItems="center">
              <Chip label={`Periodo ${selectedMonth}`} color="primary" size="small" />
              <Chip label={`${assets.length} ativos`} color="secondary" size="small" />
            </Stack>
          </Stack>
        </Paper>

        <MonthPicker
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

        {!loading && !monthData && (
          <Alert severity="warning">
            Esse mes ainda nao foi criado.
          </Alert>
        )}

        <Stack direction={{ xs: "column", md: "row" }} gap={1.3} flexWrap="wrap">
          <Grow in timeout={300}>
            <Box sx={{ flex: "1 1 240px" }}>
              <MetricCard
                title="Patrimonio do mes"
                value={numberToCurrencyBR(netWorth)}
                icon={<SavingsRoundedIcon fontSize="small" />}
                accent="#1d4ed8"
                titleColor="#0d2f90"
                background="linear-gradient(90deg, #d6e7fb 0%, #c2d8f2 100%)"
                trendText={`${netWorthEvolution.pct >= 0 ? "+" : ""}${netWorthEvolution.pct.toFixed(1)}%`}
                trendColor={netWorthEvolution.pct >= 0 ? "#1d4ed8" : "#b3261e"}
                series={netWorthSeries}
              />
            </Box>
          </Grow>
          <Grow in timeout={360}>
            <Box sx={{ flex: "1 1 240px" }}>
              <MetricCard
                title="Ativos cadastrados"
                value={String(assets.length)}
                icon={<AccountBalanceRoundedIcon fontSize="small" />}
                accent="#6d28d9"
                titleColor="#47138e"
                background="linear-gradient(90deg, #ead9ff 0%, #d8c0f0 100%)"
                trendText={`${assets.length} itens`}
                trendColor="#4c1d95"
                series={assetsSeries}
              />
            </Box>
          </Grow>
          <Grow in timeout={420}>
            <Box sx={{ flex: "1 1 240px" }}>
              <MetricCard
                title="Valor da fatura"
                value={numberToCurrencyBR(invoiceTotal)}
                icon={<ReceiptLongRoundedIcon fontSize="small" />}
                accent="#b06b00"
                titleColor="#8e4e00"
                background="linear-gradient(90deg, #f8efcc 0%, #efdfad 100%)"
                trendText={`${totalStatement >= 0 ? "+" : ""}${numberToCurrencyBR(totalStatement)}`}
                trendColor="#8f4f00"
                series={totalStatementSeries}
              />
            </Box>
          </Grow>
          <Grow in timeout={480}>
            <Box sx={{ flex: "1 1 240px" }}>
              <MetricCard
                title="Evolucao patrimonial"
                value={`${netWorthEvolution.pct >= 0 ? "+" : ""}${netWorthEvolution.pct.toFixed(2)}%`}
                icon={<InsightsRoundedIcon fontSize="small" />}
                accent="#b3261e"
                titleColor="#8c1712"
                background="linear-gradient(90deg, #ffe5db 0%, #f3d2c6 100%)"
                trendText={`${netWorthEvolution.diff >= 0 ? "+" : ""}${numberToCurrencyBR(
                  netWorthEvolution.diff
                )}`}
                trendColor={netWorthEvolution.diff >= 0 ? "#9a3412" : "#b3261e"}
                series={netWorthSeries}
              />
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

            {page === "meses" && (
              <MonthsOverview
                rows={monthsOverviewRows}
                loading={monthsOverviewLoading}
                onCreateMonth={handleCreateMonthFromOverview}
              />
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
