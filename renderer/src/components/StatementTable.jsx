import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import FinanceDataGrid from "./common/FinanceDataGrid.jsx";
import { numberToCurrencyBR } from "/src/utils/formatter.js";

function parseBRNumber(s) {
  if (typeof s === "number") return s;
  if (!s) return 0;
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

export default function StatementTable({ rows, onAddRow, onUpdateRow, onRemoveRow }) {
  const [draft, setDraft] = useState({
    date: "",
    description: "",
    category: "",
    amount: "",
    type: "debit",
    account: "",
  });

  const sorted = useMemo(() => {
    return [...(rows || [])].sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")));
  }, [rows]);

  const statistics = useMemo(() => calculateSummary(sorted), [sorted]);

  const columns = useMemo(
    () => [
      {
        field: "date",
        headerName: "Data",
        minWidth: 140,
        renderCell: (params) => (
          <TextField
            size="small"
            type="date"
            value={params.row.date || ""}
            onChange={(e) => onUpdateRow?.(params.row.id, { date: e.target.value })}
          />
        ),
      },
      {
        field: "description",
        headerName: "Descricao",
        minWidth: 240,
        flex: 1.2,
        renderCell: (params) => (
          <TextField
            size="small"
            fullWidth
            value={params.row.description || ""}
            onChange={(e) => onUpdateRow?.(params.row.id, { description: e.target.value })}
          />
        ),
      },
      {
        field: "type",
        headerName: "Tipo",
        minWidth: 130,
        renderCell: (params) => (
          <TextField
            select
            size="small"
            fullWidth
            value={params.row.type || "debit"}
            onChange={(e) => onUpdateRow?.(params.row.id, { type: e.target.value })}
          >
            <MenuItem value="debit">Debito</MenuItem>
            <MenuItem value="credit">Credito</MenuItem>
          </TextField>
        ),
      },
      {
        field: "amount",
        headerName: "Valor",
        minWidth: 140,
        renderCell: (params) => (
          <TextField
            size="small"
            fullWidth
            inputMode="decimal"
            value={String(params.row.amount ?? "")}
            onChange={(e) =>
              onUpdateRow?.(params.row.id, {
                amount: parseBRNumber(e.target.value),
              })
            }
          />
        ),
      },
      {
        field: "category",
        headerName: "Categoria",
        minWidth: 150,
        flex: 0.8,
        renderCell: (params) => (
          <TextField
            size="small"
            fullWidth
            value={params.row.category || ""}
            onChange={(e) => onUpdateRow?.(params.row.id, { category: e.target.value })}
          />
        ),
      },
      {
        field: "account",
        headerName: "Conta",
        minWidth: 150,
        flex: 0.8,
        renderCell: (params) => (
          <TextField
            size="small"
            fullWidth
            value={params.row.account || ""}
            onChange={(e) => onUpdateRow?.(params.row.id, { account: e.target.value })}
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
              if (!confirm("Remover esse lancamento?")) return;
              onRemoveRow?.(params.row.id);
            }}
          >
            <DeleteRoundedIcon />
          </IconButton>
        ),
      },
    ],
    [onRemoveRow, onUpdateRow]
  );

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
    <Stack gap={1.4}>
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.2}>
          <Stack direction="row" alignItems="center" gap={1}>
            <ReceiptLongRoundedIcon color="primary" />
            <Typography variant="subtitle1">Novo lancamento</Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Preencha os campos e adicione ao extrato
          </Typography>
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} gap={1.1}>
          <TextField
            size="small"
            type="date"
            label="Data"
            InputLabelProps={{ shrink: true }}
            value={draft.date}
            onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
          />
          <TextField
            size="small"
            label="Descricao"
            value={draft.description}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            sx={{ minWidth: 220 }}
          />
          <TextField
            select
            size="small"
            label="Tipo"
            value={draft.type}
            onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="debit">Debito</MenuItem>
            <MenuItem value="credit">Credito</MenuItem>
          </TextField>
          <TextField
            size="small"
            label="Valor"
            value={draft.amount}
            onChange={(e) => setDraft((d) => ({ ...d, amount: e.target.value }))}
            inputMode="decimal"
          />
          <TextField
            size="small"
            label="Categoria"
            value={draft.category}
            onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
          />
          <TextField
            size="small"
            label="Conta"
            value={draft.account}
            onChange={(e) => setDraft((d) => ({ ...d, account: e.target.value }))}
          />
          <Button variant="contained" onClick={handleAdd}>
            Adicionar
          </Button>
        </Stack>
      </Paper>

      <Stack direction={{ xs: "column", md: "row" }} gap={1}>
        <Alert severity="success" variant="outlined" sx={{ flex: 1 }}>
          Entradas: <b>{numberToCurrencyBR(statistics.in)}</b>
        </Alert>
        <Alert severity="warning" variant="outlined" sx={{ flex: 1 }}>
          Saidas: <b>{numberToCurrencyBR(statistics.out)}</b>
        </Alert>
      </Stack>

      <FinanceDataGrid rows={sorted} columns={columns} />
    </Stack>
  );
}
