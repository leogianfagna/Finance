import { useMemo } from "react";
import { Alert, Paper, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { BarChart, LineChart, PieChart } from "@mui/x-charts";
import { numberToCurrencyBR } from "/src/utils/formatter.js";

function sortByMonthAsc(rows) {
  return [...(rows || [])].sort((a, b) => String(a.month).localeCompare(String(b.month)));
}

function groupByAmount(items, keyGetter, valueGetter) {
  const map = new Map();
  for (const item of items || []) {
    const key = keyGetter(item) || "Nao informado";
    const value = Number(valueGetter(item)) || 0;
    map.set(key, (map.get(key) || 0) + value);
  }
  return [...map.entries()].map(([label, value]) => ({ label, value }));
}

export default function AnalyticsDashboard({ monthsOverviewRows, assets, statement, selectedMonth }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const chartWidth = isDesktop ? 560 : 330;

  const monthRows = useMemo(() => sortByMonthAsc(monthsOverviewRows), [monthsOverviewRows]);
  const monthLabels = useMemo(() => monthRows.map((row) => row.month), [monthRows]);
  const netWorthSeries = useMemo(() => monthRows.map((row) => Number(row.netWorth) || 0), [monthRows]);
  const statementSeries = useMemo(
    () => monthRows.map((row) => Number(row.statementTotal) || 0),
    [monthRows]
  );
  const assetsCountSeries = useMemo(
    () => monthRows.map((row) => Number(row.assetsCount) || 0),
    [monthRows]
  );

  const totalIn = useMemo(
    () =>
      (statement || [])
        .filter((row) => Number(row.amount) > 0)
        .reduce((sum, row) => sum + (Number(row.amount) || 0), 0),
    [statement]
  );
  const totalOut = useMemo(
    () =>
      (statement || [])
        .filter((row) => Number(row.amount) < 0)
        .reduce((sum, row) => sum + Math.abs(Number(row.amount) || 0), 0),
    [statement]
  );

  const expenseByCategory = useMemo(() => {
    const grouped = groupByAmount(
      (statement || []).filter((row) => Number(row.amount) < 0),
      (row) => row.category,
      (row) => Math.abs(Number(row.amount) || 0)
    )
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
    return grouped.map((item, idx) => ({
      id: idx,
      label: item.label,
      value: item.value,
    }));
  }, [statement]);

  const allocationByType = useMemo(() => {
    const grouped = groupByAmount(
      assets || [],
      (asset) => asset.type,
      (asset) => Number(asset.total) || 0
    )
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
    return grouped.map((item, idx) => ({
      id: idx,
      label: item.label,
      value: item.value,
    }));
  }, [assets]);

  const allocationByInstitution = useMemo(() => {
    const grouped = groupByAmount(
      assets || [],
      (asset) => asset.institution,
      (asset) => Number(asset.total) || 0
    )
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
    return grouped.map((item) => item.label);
  }, [assets]);

  const allocationByInstitutionValues = useMemo(() => {
    return groupByAmount(
      assets || [],
      (asset) => asset.institution,
      (asset) => Number(asset.total) || 0
    )
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
      .map((item) => item.value);
  }, [assets]);

  const hasHistory = monthRows.length > 0;
  const hasStatement = (statement || []).length > 0;
  const hasAssets = (assets || []).length > 0;

  return (
    <Stack gap={1.4}>
      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Typography variant="subtitle1">Dashboard analitico - {selectedMonth}</Typography>
        <Typography variant="body2" color="text.secondary">
          Visao consolidada de tendencia patrimonial, fluxo financeiro e composicao da carteira.
        </Typography>
      </Paper>

      {!hasHistory && <Alert severity="info">Sem historico mensal suficiente para montar os graficos.</Alert>}

      {hasHistory && (
        <Stack direction={{ xs: "column", xl: "row" }} gap={1.4}>
          <Paper sx={{ p: 1.5, borderRadius: 3, flex: 1 }}>
            <Typography variant="subtitle2" mb={1}>
              Evolucao do patrimonio liquido
            </Typography>
            <LineChart
              height={280}
              width={chartWidth}
              xAxis={[{ scaleType: "point", data: monthLabels }]}
              series={[{ data: netWorthSeries, label: "Patrimonio" }]}
            />
          </Paper>
          <Paper sx={{ p: 1.5, borderRadius: 3, flex: 1 }}>
            <Typography variant="subtitle2" mb={1}>
              Extrato mensal (saldo)
            </Typography>
            <BarChart
              height={280}
              width={chartWidth}
              xAxis={[{ scaleType: "band", data: monthLabels }]}
              series={[{ data: statementSeries, label: "Saldo do extrato" }]}
            />
          </Paper>
        </Stack>
      )}

      {hasHistory && (
        <Paper sx={{ p: 1.5, borderRadius: 3 }}>
          <Typography variant="subtitle2" mb={1}>
            Quantidade de ativos cadastrados por mes
          </Typography>
          <BarChart
            height={280}
            width={isDesktop ? 1140 : 330}
            xAxis={[{ scaleType: "band", data: monthLabels }]}
            series={[{ data: assetsCountSeries, label: "Ativos" }]}
          />
        </Paper>
      )}

      <Stack direction={{ xs: "column", xl: "row" }} gap={1.4}>
        <Paper sx={{ p: 1.5, borderRadius: 3, flex: 1 }}>
          <Typography variant="subtitle2" mb={1}>
            Entradas vs saidas do mes
          </Typography>
          {!hasStatement ? (
            <Alert severity="info">Sem lancamentos no extrato para o mes selecionado.</Alert>
          ) : (
            <BarChart
              height={280}
              width={chartWidth}
              xAxis={[{ scaleType: "band", data: ["Entradas", "Saidas"] }]}
              series={[
                {
                  data: [totalIn, totalOut],
                  label: "Fluxo",
                },
              ]}
            />
          )}
        </Paper>

        <Paper sx={{ p: 1.5, borderRadius: 3, flex: 1 }}>
          <Typography variant="subtitle2" mb={1}>
            Despesas por categoria (top 8)
          </Typography>
          {!expenseByCategory.length ? (
            <Alert severity="info">Sem despesas categorizadas para o mes selecionado.</Alert>
          ) : (
            <PieChart
              height={280}
              width={chartWidth}
              series={[
                {
                  data: expenseByCategory,
                  innerRadius: 48,
                  outerRadius: 110,
                  paddingAngle: 2,
                  cornerRadius: 4,
                },
              ]}
            />
          )}
        </Paper>
      </Stack>

      <Stack direction={{ xs: "column", xl: "row" }} gap={1.4}>
        <Paper sx={{ p: 1.5, borderRadius: 3, flex: 1 }}>
          <Typography variant="subtitle2" mb={1}>
            Alocacao da carteira por tipo de ativo
          </Typography>
          {!allocationByType.length ? (
            <Alert severity="info">Sem ativos para compor a alocacao por tipo.</Alert>
          ) : (
            <PieChart
              height={280}
              width={chartWidth}
              series={[
                {
                  data: allocationByType,
                  innerRadius: 48,
                  outerRadius: 110,
                  paddingAngle: 2,
                  cornerRadius: 4,
                },
              ]}
            />
          )}
        </Paper>

        <Paper sx={{ p: 1.5, borderRadius: 3, flex: 1 }}>
          <Typography variant="subtitle2" mb={1}>
            Distribuicao por instituicao (top 8)
          </Typography>
          {!hasAssets || !allocationByInstitution.length ? (
            <Alert severity="info">Sem ativos para analise por instituicao.</Alert>
          ) : (
            <BarChart
              height={280}
              width={chartWidth}
              xAxis={[{ scaleType: "band", data: allocationByInstitution }]}
              series={[{ data: allocationByInstitutionValues, label: "Patrimonio" }]}
            />
          )}
        </Paper>
      </Stack>

      <Alert severity="info" variant="outlined">
        Fluxo do mes: entradas {numberToCurrencyBR(totalIn)} | saidas {numberToCurrencyBR(totalOut)}
      </Alert>
    </Stack>
  );
}
