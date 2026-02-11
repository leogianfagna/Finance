import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
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
      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Typography variant="subtitle1" mb={1.2}>
          Adicionar lancamento
        </Typography>
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
            sx={{ minWidth: 250 }}
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

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Descricao</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Conta</TableCell>
              <TableCell align="right">Acoes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography color="text.secondary">Nenhum lancamento no extrato ainda.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>
                    <TextField
                      size="small"
                      type="date"
                      value={r.date || ""}
                      onChange={(e) => onUpdateRow?.(r.id, { date: e.target.value })}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={r.description || ""}
                      onChange={(e) => onUpdateRow?.(r.id, { description: e.target.value })}
                      sx={{ minWidth: 240 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      select
                      size="small"
                      value={r.type || "debit"}
                      onChange={(e) => onUpdateRow?.(r.id, { type: e.target.value })}
                      sx={{ minWidth: 120 }}
                    >
                      <MenuItem value="debit">Debito</MenuItem>
                      <MenuItem value="credit">Credito</MenuItem>
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={String(r.amount ?? "")}
                      onChange={(e) =>
                        onUpdateRow?.(r.id, {
                          amount: parseBRNumber(e.target.value),
                        })
                      }
                      sx={{ minWidth: 120 }}
                      inputMode="decimal"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={r.category || ""}
                      onChange={(e) => onUpdateRow?.(r.id, { category: e.target.value })}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={r.account || ""}
                      onChange={(e) => onUpdateRow?.(r.id, { account: e.target.value })}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="error"
                      onClick={() => {
                        if (!confirm("Remover esse lancamento?")) return;
                        onRemoveRow?.(r.id);
                      }}
                    >
                      <DeleteRoundedIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
