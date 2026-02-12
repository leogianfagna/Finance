import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import FinanceDataGrid from "./common/FinanceDataGrid.jsx";
import { numberToCurrencyBR } from "/src/utils/formatter.js";
import { monthKey } from "/src/utils/month.js";

export default function MonthsOverview({ rows, loading, onCreateMonth }) {
  const now = new Date();
  const [open, setOpen] = useState(false);
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
        field: "status",
        headerName: "Status",
        minWidth: 120,
        renderCell: (params) => (
          <Chip
            size="small"
            label={params.row.hasData ? "Com dados" : "Sem dados"}
            color={params.row.hasData ? "success" : "warning"}
            variant="outlined"
          />
        ),
      },
    ],
    []
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

      <FinanceDataGrid loading={loading} rows={rows || []} columns={columns} />

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
    </Stack>
  );
}
