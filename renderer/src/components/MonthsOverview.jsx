import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import {
  BarChart,
  BarPlot,
  ChartContainer,
  ChartsLegend,
  ChartsTooltip,
  ChartsXAxis,
  ChartsYAxis,
  LineChart,
  LinePlot,
  MarkPlot,
  PieChart,
} from "@mui/x-charts";
import FinanceDataGrid from "./common/FinanceDataGrid.jsx";
import { numberToCurrencyBR } from "/src/utils/formatter.js";
import { monthKey } from "/src/utils/month.js";

export default function MonthsOverview({
  rows,
  loading,
  onCreateMonth,
  onDeleteMonth,
  onSelectMonth,
  onOpenMonth,
}) {
  const now = new Date();
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [copyFrom, setCopyFrom] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const columns = useMemo(
    () => [
      {
        field: "month",
        headerName: "Mes",
        minWidth: 130,
      },
      {
        field: "netWorth",
        headerName: "Patrimonio",
        minWidth: 170,
        valueFormatter: (value) => numberToCurrencyBR(value),
      },
      {
        field: "assetsCount",
        headerName: "Ativos",
        minWidth: 100,
      },
      {
        field: "servicesPositiveCount",
        headerName: "Servicos",
        minWidth: 110,
      },
      {
        field: "statementCount",
        headerName: "Lancamentos",
        minWidth: 130,
      },
      {
        field: "statementTotal",
        headerName: "Saldo extrato",
        minWidth: 170,
        valueFormatter: (value) => numberToCurrencyBR(value),
      },
      {
        field: "updatedAt",
        headerName: "Atualizado em",
        minWidth: 180,
      },
      {
        field: "actions",
        headerName: "Acoes",
        minWidth: 160,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => (
          <Stack direction="row" alignItems="center">
            <Tooltip title="Remover mes">
              <IconButton
                color="error"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedRow(params.row);
                  setDeleteDialogOpen(true);
                }}
              >
                <DeleteOutlineRoundedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Visualizar resumo">
              <IconButton
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedRow(params.row);
                  setSummaryDialogOpen(true);
                }}
              >
                <VisibilityRoundedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Abrir mes">
              <IconButton
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenMonth?.(params.row);
                }}
              >
                <OpenInNewRoundedIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [onOpenMonth]
  );

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const output = [];
    for (let y = currentYear - 5; y <= currentYear + 5; y++) output.push(y);
    return output;
  }, []);

  const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const existingMonthKeys = useMemo(() => new Set((rows || []).map((row) => row.month)), [rows]);
  const copyFromOptions = useMemo(
    () =>
      [...(rows || [])]
        .map((row) => row.month)
        .filter(Boolean)
        .sort((a, b) => String(b).localeCompare(String(a))),
    [rows]
  );

  const sortedRows = useMemo(
    () => [...(rows || [])].sort((a, b) => String(a.month).localeCompare(String(b.month))),
    [rows]
  );
  const monthLabels = useMemo(() => sortedRows.map((row) => row.month), [sortedRows]);
  const netWorthSeries = useMemo(
    () => sortedRows.map((row) => Number(row.netWorth) || 0),
    [sortedRows]
  );
  const assetTypeLabels = useMemo(() => {
    const set = new Set();
    for (const row of sortedRows) {
      Object.keys(row.assetTypeTotals || {}).forEach((type) => set.add(type));
    }
    return [...set];
  }, [sortedRows]);
  const assetTypeSeries = useMemo(
    () =>
      assetTypeLabels.map((typeLabel) => ({
        id: `tipo-${typeLabel}`,
        type: "bar",
        label: typeLabel,
        data: sortedRows.map((row) => Number(row.assetTypeTotals?.[typeLabel]) || 0),
        xAxisId: "months",
        yAxisId: "values",
      })),
    [assetTypeLabels, sortedRows]
  );
  const statementInSeries = useMemo(
    () => sortedRows.map((row) => Number(row.statementIn) || 0),
    [sortedRows]
  );
  const statementOutSeries = useMemo(
    () => sortedRows.map((row) => Number(row.statementOut) || 0),
    [sortedRows]
  );
  const servicesMonthlyTotalSeries = useMemo(
    () => sortedRows.map((row) => Number(row.servicesPositiveTotal) || 0),
    [sortedRows]
  );
  const servicesMonthlyAverageSeries = useMemo(() => {
    if (!sortedRows.length) return [];
    const total = servicesMonthlyTotalSeries.reduce((sum, value) => sum + value, 0);
    const avg = total / sortedRows.length;
    return sortedRows.map(() => avg);
  }, [sortedRows, servicesMonthlyTotalSeries]);
  const selectedExpensesPieData = useMemo(() => {
    const base = selectedRow?.expensesByCategoryTop || [];
    const total = base.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    if (!total) return [];
    return base.map((item, idx) => {
      const value = Number(item.value) || 0;
      const pct = (value / total) * 100;
      return {
        id: idx,
        label: `${item.label} (${pct.toFixed(1)}%)`,
        value,
      };
    });
  }, [selectedRow]);
  const selectedAllocationByTypePieData = useMemo(() => {
    const base = selectedRow?.allocationByTypeTop || [];
    const total = base.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    if (!total) return [];
    return base.map((item, idx) => {
      const value = Number(item.value) || 0;
      const pct = (value / total) * 100;
      return {
        id: idx,
        label: `${item.label} (${pct.toFixed(1)}%)`,
        value,
      };
    });
  }, [selectedRow]);
  const selectedInstitutionPieData = useMemo(() => {
    const base = selectedRow?.allocationByInstitutionTop || [];
    const total = base.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    if (!total) return [];
    return base.map((item, idx) => {
      const value = Number(item.value) || 0;
      const pct = (value / total) * 100;
      return {
        id: idx,
        label: `${item.label} (${pct.toFixed(1)}%)`,
        value,
      };
    });
  }, [selectedRow]);

  async function handleSubmit() {
    const targetKey = monthKey(year, month);
    if (existingMonthKeys.has(targetKey)) {
      setFormError(`O mes ${targetKey} ja existe.`);
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      await onCreateMonth?.({ year, month, copyFrom: copyFrom || null });
      setOpen(false);
      setCopyFrom("");
    } catch (error) {
      setFormError(error?.message || "Nao foi possivel criar o mes.");
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!selectedRow) return;
    setSaving(true);
    setFormError("");
    try {
      await onDeleteMonth?.(selectedRow);
      setDeleteDialogOpen(false);
      setSelectedRow(null);
    } catch (error) {
      setFormError(error?.message || "Nao foi possivel remover o mes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Stack gap={1}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ md: "center" }}>
        <Typography variant="subtitle1">Resumo de todos os meses</Typography>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setOpen(true)}>
          Criar novo mes
        </Button>
      </Stack>

      {!loading && (!rows || rows.length === 0) && (
        <Alert severity="info">Nenhum mes encontrado no banco de dados.</Alert>
      )}

      <FinanceDataGrid
        loading={loading}
        rows={rows || []}
        columns={columns}
        onRowClick={(params) => {
          if (onOpenMonth) {
            onOpenMonth(params.row);
            return;
          }
          onSelectMonth?.(params.row);
        }}
        sx={{
          "& .MuiDataGrid-row": { cursor: "pointer" },
        }}
      />

      <Stack direction={{ xs: "column", xl: "row" }} gap={1.3}>
        <Paper sx={{ p: 1.5, borderRadius: 3, flex: 1 }}>
          <Typography variant="subtitle2" mb={0.8}>
            Evolucao patrimonial e investimentos
          </Typography>
          {!sortedRows.length ? (
            <Alert severity="info">Sem meses suficientes para montar o grafico.</Alert>
          ) : (
            <ChartContainer
              height={280}
              xAxis={[{ id: "months", scaleType: "band", data: monthLabels }]}
              yAxis={[{ id: "values" }]}
              series={[
                ...assetTypeSeries,
                {
                  id: "patrimonio",
                  type: "line",
                  data: netWorthSeries,
                  label: "Patrimonio",
                  xAxisId: "months",
                  yAxisId: "values",
                },
              ]}
            >
              <BarPlot />
              <LinePlot />
              <MarkPlot />
              <ChartsXAxis axisId="months" />
              <ChartsYAxis axisId="values" />
              <ChartsTooltip />
              <ChartsLegend />
            </ChartContainer>
          )}
        </Paper>

        <Paper sx={{ p: 1.5, borderRadius: 3, flex: 1 }}>
          <Typography variant="subtitle2" mb={0.8}>
            Entradas e gastos por mes
          </Typography>
          {!sortedRows.length ? (
            <Alert severity="info">Sem meses suficientes para montar o grafico.</Alert>
          ) : (
            <BarChart
              height={280}
              xAxis={[{ scaleType: "band", data: monthLabels }]}
              series={[
                { data: statementInSeries, label: "Entradas" },
                { data: statementOutSeries, label: "Gastos" },
              ]}
            />
          )}
        </Paper>
      </Stack>

      <Paper sx={{ p: 1.5, borderRadius: 3 }}>
        <Typography variant="subtitle2" mb={0.8}>
          Ganho de servicos por mes (total x media)
        </Typography>
        {!sortedRows.length ? (
          <Alert severity="info">Sem meses suficientes para montar o grafico.</Alert>
        ) : (
          <LineChart
            height={280}
            xAxis={[{ scaleType: "point", data: monthLabels }]}
            series={[
              { data: servicesMonthlyTotalSeries, label: "Total do mes" },
              { data: servicesMonthlyAverageSeries, label: "Media mensal" },
            ]}
          />
        )}
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Criar novo mes</DialogTitle>
        <DialogContent>
          <Stack direction={{ xs: "column", md: "row" }} gap={1.2} mt={0.5}>
            <TextField
              select
              fullWidth
              label="Ano"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {yearOptions.map((optionYear) => (
                <MenuItem key={optionYear} value={optionYear}>
                  {optionYear}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Mes"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {monthOptions.map((optionMonth) => (
                <MenuItem key={optionMonth} value={optionMonth}>
                  {String(optionMonth).padStart(2, "0")}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <TextField
            select
            fullWidth
            label="Copiar base (opcional)"
            value={copyFrom}
            onChange={(e) => setCopyFrom(e.target.value)}
            sx={{ mt: 1.2 }}
            helperText="Selecione um mes para clonar os resultados ou deixe em branco para criar vazio."
          >
            <MenuItem value="">Sem copia</MenuItem>
            {copyFromOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          {formError && (
            <Alert severity="error" sx={{ mt: 1.2 }}>
              {formError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={saving}>
            Criar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Confirmar remocao</DialogTitle>
        <DialogContent>
          <Typography>
            Deseja remover o mes <b>{selectedRow?.month}</b>? Essa acao nao pode ser desfeita.
          </Typography>
          {formError && (
            <Alert severity="error" sx={{ mt: 1.2 }}>
              {formError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete} disabled={saving}>
            Remover
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={summaryDialogOpen} onClose={() => setSummaryDialogOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>Resumo do mes {selectedRow?.month}</DialogTitle>
        <DialogContent>
          <Stack gap={1}>
            <Chip
              label={`Patrimonio: ${numberToCurrencyBR(selectedRow?.netWorth || 0)}`}
              variant="outlined"
            />
            <Chip
              label={`Investimentos: ${numberToCurrencyBR(selectedRow?.investmentTotal || 0)}`}
              variant="outlined"
            />
            <Chip label={`Ativos: ${selectedRow?.assetsCount || 0}`} variant="outlined" />
            <Chip label={`Servicos: ${selectedRow?.servicesPositiveCount || 0}`} variant="outlined" />
            <Chip
              label={`Entradas: ${numberToCurrencyBR(selectedRow?.statementIn || 0)}`}
              variant="outlined"
            />
            <Chip
              label={`Gastos: ${numberToCurrencyBR(selectedRow?.statementOut || 0)}`}
              variant="outlined"
            />
          </Stack>

          <Stack gap={1.2} mt={1.4}>
            <Paper sx={{ p: 1.2, borderRadius: 2 }}>
              <Typography variant="subtitle2" mb={0.6}>
                Entradas vs saidas do mes
              </Typography>
              <BarChart
                height={220}
                xAxis={[{ scaleType: "band", data: ["Resumo"] }]}
                series={[
                  { data: [Number(selectedRow?.statementIn) || 0], label: "Entradas" },
                  { data: [Number(selectedRow?.statementOut) || 0], label: "Saidas" },
                ]}
              />
            </Paper>

            <Paper sx={{ p: 1.2, borderRadius: 2 }}>
              <Typography variant="subtitle2" mb={0.6}>
                Despesas por categoria (top 8)
              </Typography>
              {selectedExpensesPieData.length ? (
                <PieChart
                  height={220}
                  series={[
                    {
                      data: selectedExpensesPieData,
                      innerRadius: 40,
                      outerRadius: 85,
                      paddingAngle: 2,
                    },
                  ]}
                />
              ) : (
                <Alert severity="info">Sem despesas para esse mes.</Alert>
              )}
            </Paper>

            <Paper sx={{ p: 1.2, borderRadius: 2 }}>
              <Typography variant="subtitle2" mb={0.6}>
                Alocacao da carteira por tipo de ativo
              </Typography>
              {selectedAllocationByTypePieData.length ? (
                <PieChart
                  height={220}
                  series={[
                    {
                      data: selectedAllocationByTypePieData,
                      innerRadius: 40,
                      outerRadius: 85,
                      paddingAngle: 2,
                    },
                  ]}
                />
              ) : (
                <Alert severity="info">Sem ativos para esse mes.</Alert>
              )}
            </Paper>

            <Paper sx={{ p: 1.2, borderRadius: 2 }}>
              <Typography variant="subtitle2" mb={0.6}>
                Distribuicao por instituicao (top 8)
              </Typography>
              {selectedInstitutionPieData.length ? (
                <PieChart
                  height={220}
                  series={[
                    {
                      data: selectedInstitutionPieData,
                      innerRadius: 40,
                      outerRadius: 85,
                      paddingAngle: 2,
                    },
                  ]}
                />
              ) : (
                <Alert severity="info">Sem ativos para esse mes.</Alert>
              )}
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSummaryDialogOpen(false)}>Fechar</Button>
          <Button
            variant="contained"
            onClick={() => {
              onOpenMonth?.(selectedRow);
              setSummaryDialogOpen(false);
            }}
          >
            Abrir mes
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
