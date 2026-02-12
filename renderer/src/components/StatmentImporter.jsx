import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { numberToCurrencyBR } from "/src/utils/formatter.js";
import { PAYMENT_CATEGORIES, INSTITUTIONS } from "/src/constants/constants";
import FinanceDataGrid from "./common/FinanceDataGrid.jsx";

function normalizeHeader(h) {
  return String(h || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function toNumberBR(value) {
  if (value == null) return NaN;
  const s = String(value).trim();
  if (!s) return NaN;
  const normalized = s.replace(/\./g, "").replace(",", ".");
  return Number(normalized);
}

function parseDateToISO(d) {
  if (!d) return "";
  const s = String(d).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})$/);
  if (m) {
    const dd = m[1];
    const mm = m[2];
    const yyyy = m[3];
    return `${yyyy}-${mm}-${dd}`;
  }
  return "";
}

function sanitizeDescription(s) {
  return String(s ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitCSVLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }

    cur += ch;
  }
  out.push(cur);
  return out;
}

function parseCSV(text) {
  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((l) => l.trim().length > 0);

  if (lines.length < 2) return [];

  const rawHeaders = splitCSVLine(lines[0]).map((h) => h.trim());
  const headers = rawHeaders.map(normalizeHeader);
  const idxData = headers.indexOf("data");
  const idxValor = headers.indexOf("valor");
  const idxDesc = headers.indexOf("descricao");

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]);
    const dataRaw = idxData >= 0 ? cols[idxData] : "";
    const valorRaw = idxValor >= 0 ? cols[idxValor] : "";
    const descRaw = idxDesc >= 0 ? cols[idxDesc] : "";

    rows.push({
      id: crypto.randomUUID?.() || String(Date.now() + i),
      date: parseDateToISO(dataRaw),
      description: sanitizeDescription(descRaw),
      category: "",
      amount: Number.isFinite(toNumberBR(valorRaw)) ? toNumberBR(valorRaw) : 0,
      account: "to-do",
      type: "to-do",
    });
  }

  return rows;
}

function emptyRow() {
  return {
    id: crypto.randomUUID?.() || String(Date.now()),
    date: "",
    description: "",
    category: "",
    amount: 0,
    account: "to-do",
    type: "to-do",
  };
}

export default function StatementImporter({ onImport }) {
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState([]);
  const [bank, setBank] = useState(INSTITUTIONS[0]);
  const [transferType, setTransferType] = useState("debito");

  const totals = useMemo(() => {
    let entradas = 0;
    let saidas = 0;
    for (const r of rows) {
      const v = Number(r.amount);
      if (Number.isFinite(v)) {
        if (v < 0) saidas += v;
        else entradas += v;
      }
    }
    return { entradas, saidas };
  }, [rows]);

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
            onChange={(e) => {
              const value = e.target.value;
              setRows((prev) => prev.map((r) => (r.id === params.row.id ? { ...r, date: value } : r)));
            }}
          />
        ),
      },
      {
        field: "description",
        headerName: "Descricao",
        minWidth: 250,
        flex: 1.2,
        renderCell: (params) => (
          <TextField
            size="small"
            fullWidth
            value={params.row.description || ""}
            onChange={(e) => {
              const value = e.target.value;
              setRows((prev) =>
                prev.map((r) => (r.id === params.row.id ? { ...r, description: value } : r))
              );
            }}
          />
        ),
      },
      {
        field: "category",
        headerName: "Categoria",
        minWidth: 180,
        renderCell: (params) => (
          <TextField
            select
            size="small"
            fullWidth
            value={params.row.category || ""}
            onChange={(e) => {
              const value = e.target.value;
              setRows((prev) => prev.map((r) => (r.id === params.row.id ? { ...r, category: value } : r)));
            }}
          >
            {PAYMENT_CATEGORIES.map((c) => (
              <MenuItem key={c || "empty"} value={c}>
                {c || "Selecione..."}
              </MenuItem>
            ))}
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
            inputMode="decimal"
            value={String(params.row.amount ?? "")}
            onChange={(e) => {
              const n = toNumberBR(e.target.value);
              setRows((prev) =>
                prev.map((r) => (r.id === params.row.id ? { ...r, amount: Number.isFinite(n) ? n : 0 } : r))
              );
            }}
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
          <Button
            color="error"
            startIcon={<DeleteRoundedIcon />}
            onClick={() => setRows((prev) => prev.filter((r) => r.id !== params.row.id))}
          >
            Remover
          </Button>
        ),
      },
    ],
    []
  );

  async function handleFile(file) {
    if (!file) return;
    setFileName(file.name);
    const extension = file.name.toLowerCase().split(".").pop();

    if (extension === "csv") {
      const fileInText = await file.text();
      setRows(parseCSV(fileInText));
      return;
    }

    if (extension === "xlsx" || extension === "xls") {
      alert("Importacao de Excel ainda nao esta habilitada. Use CSV por enquanto.");
      return;
    }

    alert("Formato nao suportado. Envie um CSV ou Excel.");
  }

  function handleSave() {
    const invalid = rows.some(
      (row) => !row.date || !String(row.description || "").trim() || !Number.isFinite(Number(row.amount))
    );
    if (invalid) {
      alert("Revise o importador: data, descricao e valor sao obrigatorios em todas as linhas.");
      return;
    }
    onImport(rows.map((row) => ({ ...row, account: bank, type: transferType })));
  }

  return (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.2}>
        <Typography variant="subtitle1">Importar historico</Typography>
        <Typography variant="caption" color="text.secondary">
          CSV com Data, Valor e Descricao
        </Typography>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} gap={1} alignItems={{ md: "center" }}>
        <Button component="label" variant="contained" startIcon={<UploadFileRoundedIcon />}>
          Escolher arquivo
          <input hidden type="file" accept=".csv,.xlsx,.xls" onChange={(e) => handleFile(e.target.files?.[0])} />
        </Button>
        {fileName && (
          <Typography color="text.secondary">
            Arquivo: <b>{fileName}</b>
          </Typography>
        )}
        <Button
          variant="outlined"
          onClick={() => {
            setRows([]);
            setFileName("");
          }}
        >
          Limpar
        </Button>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} gap={1.1} mt={1.4}>
        <TextField
          select
          label="Instituicao"
          size="small"
          value={bank}
          onChange={(e) => setBank(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          {INSTITUTIONS.map((inst) => (
            <MenuItem key={inst} value={inst}>
              {inst}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Tipo de pagamento"
          size="small"
          value={transferType}
          onChange={(e) => setTransferType(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="debito">Debito</MenuItem>
          <MenuItem value="credito">Credito</MenuItem>
        </TextField>
      </Stack>

      {!rows.length ? (
        <Typography color="text.secondary" mt={2}>
          Nenhuma linha importada ainda.
        </Typography>
      ) : (
        <Stack gap={1.2} mt={1.5}>
          <FinanceDataGrid rows={rows} columns={columns} />

          <Stack direction={{ xs: "column", md: "row" }} gap={1}>
            <Button variant="outlined" onClick={() => setRows((prev) => prev.concat(emptyRow()))}>
              Adicionar linha
            </Button>
            <Button variant="contained" onClick={handleSave}>
              Salvar
            </Button>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} gap={1}>
            <Alert severity="success" variant="outlined" sx={{ flex: 1 }}>
              Entradas: <b>{numberToCurrencyBR(totals.entradas)}</b>
            </Alert>
            <Alert severity="warning" variant="outlined" sx={{ flex: 1 }}>
              Saidas: <b>{numberToCurrencyBR(totals.saidas)}</b>
            </Alert>
          </Stack>
        </Stack>
      )}
    </Paper>
  );
}
