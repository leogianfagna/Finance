import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { LineChart } from "@mui/x-charts";
import FinanceDataGrid from "../common/FinanceDataGrid.jsx";
import { numberToCurrencyBR } from "/src/utils/formatter.js";

function parseBRNumber(value) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const cleaned = String(value).trim().replace(/\./g, "").replace(",", ".");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function uid() {
  return crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function getDaysInMonth(monthKeyValue) {
  const [yearRaw, monthRaw] = String(monthKeyValue || "").split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return 31;
  return new Date(year, month, 0).getDate();
}

export default function ServicesPanel({ rows, onAddRow, onUpdateRow, onRemoveRow, selectedMonth }) {
  const daysInMonth = useMemo(() => getDaysInMonth(selectedMonth), [selectedMonth]);
  const [draft, setDraft] = useState({
    day: "",
    amount: "",
    description: "",
  });

  const sorted = useMemo(
    () => [...(rows || [])].sort((a, b) => Number(a.day || 0) - Number(b.day || 0)),
    [rows]
  );

  const totalReceived = useMemo(
    () =>
      sorted
        .filter((row) => Number(row.amount) > 0)
        .reduce((sum, row) => sum + (Number(row.amount) || 0), 0),
    [sorted]
  );
  const totalOut = useMemo(
    () =>
      sorted
        .filter((row) => Number(row.amount) < 0)
        .reduce((sum, row) => sum + Math.abs(Number(row.amount) || 0), 0),
    [sorted]
  );
  const totalNet = totalReceived - totalOut;

  const summaryAmountByDaySeries = useMemo(() => {
    const dailyNet = Array.from({ length: daysInMonth }, () => 0);
    for (const row of sorted) {
      const day = Number(row.day);
      const amount = Number(row.amount) || 0;
      if (!Number.isFinite(day) || day < 1 || day > daysInMonth) continue;
      dailyNet[day - 1] += amount;
    }
    let running = 0;
    return dailyNet.map((value) => {
      running += value;
      return running;
    });
  }, [sorted, daysInMonth]);

  const dayLabels = useMemo(
    () => Array.from({ length: daysInMonth }, (_, idx) => String(idx + 1)),
    [daysInMonth]
  );

  const columns = useMemo(
    () => [
      {
        field: "day",
        headerName: "Dia",
        minWidth: 100,
        renderCell: (params) => (
          <TextField
            size="small"
            type="number"
            inputProps={{ min: 1, max: daysInMonth }}
            value={params.row.day ?? ""}
            onChange={(event) => {
              const day = Number(event.target.value);
              onUpdateRow?.(params.row.id, { day: Number.isFinite(day) ? day : "" });
            }}
          />
        ),
      },
      {
        field: "amount",
        headerName: "Valor",
        minWidth: 150,
        renderCell: (params) => (
          <TextField
            size="small"
            fullWidth
            inputMode="decimal"
            value={String(params.row.amount ?? "")}
            onChange={(event) =>
              onUpdateRow?.(params.row.id, { amount: parseBRNumber(event.target.value) })
            }
          />
        ),
      },
      {
        field: "description",
        headerName: "Descricao",
        flex: 1,
        minWidth: 260,
        renderCell: (params) => (
          <TextField
            size="small"
            fullWidth
            value={params.row.description || ""}
            onChange={(event) => onUpdateRow?.(params.row.id, { description: event.target.value })}
          />
        ),
      },
      {
        field: "actions",
        headerName: "Acoes",
        minWidth: 90,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => (
          <IconButton
            color="error"
            onClick={() => {
              if (!confirm("Remover esse servico?")) return;
              onRemoveRow?.(params.row.id);
            }}
          >
            <DeleteRoundedIcon />
          </IconButton>
        ),
      },
    ],
    [daysInMonth, onRemoveRow, onUpdateRow]
  );

  function handleAdd() {
    const day = Number(draft.day);
    const amount = parseBRNumber(draft.amount);
    if (!Number.isFinite(day) || day < 1 || day > daysInMonth || !amount) return;

    onAddRow?.({
      id: uid(),
      day,
      amount,
      description: draft.description || "",
      createdAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString().slice(0, 10),
    });

    setDraft({ day: "", amount: "", description: "" });
  }

  return (
    <Stack gap={1.4}>
      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Typography variant="subtitle1">Servicos do mes</Typography>
        <Typography variant="body2" color="text.secondary" mb={1.1}>
          Registre entradas (valor positivo) e saidas (valor negativo) de servicos autonomos.
        </Typography>
        <Stack direction={{ xs: "column", md: "row" }} gap={1}>
          <TextField
            size="small"
            type="number"
            label="Dia"
            inputProps={{ min: 1, max: daysInMonth }}
            value={draft.day}
            onChange={(event) => setDraft((current) => ({ ...current, day: event.target.value }))}
          />
          <TextField
            size="small"
            label="Valor"
            inputMode="decimal"
            value={draft.amount}
            onChange={(event) => setDraft((current) => ({ ...current, amount: event.target.value }))}
            placeholder="Ex: 350,00 ou -50,00"
          />
          <TextField
            size="small"
            label="Descricao"
            value={draft.description}
            onChange={(event) =>
              setDraft((current) => ({ ...current, description: event.target.value }))
            }
            sx={{ minWidth: 260 }}
          />
          <Button variant="contained" onClick={handleAdd}>
            Adicionar
          </Button>
        </Stack>
      </Paper>

      <Stack direction={{ xs: "column", md: "row" }} gap={1}>
        <Alert severity="success" variant="outlined" sx={{ flex: 1 }}>
          Total recebido: <b>{numberToCurrencyBR(totalReceived)}</b>
        </Alert>
        <Alert severity="warning" variant="outlined" sx={{ flex: 1 }}>
          Total de saidas: <b>{numberToCurrencyBR(totalOut)}</b>
        </Alert>
        <Alert severity={totalNet >= 0 ? "info" : "error"} variant="outlined" sx={{ flex: 1 }}>
          Resumo do mes: <b>{numberToCurrencyBR(totalNet)}</b>
        </Alert>
      </Stack>

      <Paper sx={{ p: 1.5, borderRadius: 3 }}>
        <Typography variant="subtitle2" mb={0.8}>
          Montante acumulado por dia
        </Typography>
        <LineChart
          height={280}
          xAxis={[{ scaleType: "point", data: dayLabels }]}
          series={[{ data: summaryAmountByDaySeries, label: "Resumo acumulado" }]}
        />
      </Paper>

      <FinanceDataGrid rows={sorted} columns={columns} />
    </Stack>
  );
}
