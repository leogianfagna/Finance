import { useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Alert,
  Box,
  Button,
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
import { numberToCurrencyBR } from "/src/utils/formatter.js";
import { PAYMENT_CATEGORIES, INSTITUTIONS } from "/src/constants/constants";

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

export default function StatementImporter({ onImport }) {
  const [fileName, setFileName] = useState("");

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      rows: [],
      bank: INSTITUTIONS[0],
      transfer_type: "debito",
    },
    mode: "onSubmit",
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "rows",
    keyName: "keyId",
  });

  const totals = useMemo(() => {
    let entradas = 0;
    let saidas = 0;
    for (const r of fields) {
      const v = Number(r.amount);
      if (Number.isFinite(v)) {
        if (v < 0) saidas += v;
        else entradas += v;
      }
    }
    return { entradas, saidas };
  }, [fields]);

  async function handleFile(file) {
    if (!file) return;
    setFileName(file.name);
    const extension = file.name.toLowerCase().split(".").pop();

    if (extension === "csv") {
      const fileInText = await file.text();
      replace(parseCSV(fileInText));
      return;
    }

    if (extension === "xlsx" || extension === "xls") {
      alert("Importacao de Excel ainda nao esta habilitada. Use CSV por enquanto.");
      return;
    }

    alert("Formato nao suportado. Envie um CSV ou Excel.");
  }

  function addRow() {
    append({
      id: crypto.randomUUID?.() || String(Date.now()),
      date: "",
      description: "",
      category: "",
      account: "to-do",
      type: "to-do",
      amount: 0,
    });
  }

  const onSave = (data) => {
    onImport(data.rows);
  };

  return (
    <Paper sx={{ p: 2, borderRadius: 3 }}>
      <Typography variant="subtitle1" mb={1.2}>
        Importar historico
      </Typography>

      <Stack direction={{ xs: "column", md: "row" }} gap={1} alignItems={{ md: "center" }}>
        <Button component="label" variant="contained">
          Escolher arquivo
          <input
            hidden
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </Button>
        {fileName && (
          <Typography color="text.secondary">
            Arquivo: <b>{fileName}</b>
          </Typography>
        )}
        <Button
          variant="outlined"
          onClick={() => {
            replace([]);
            setFileName("");
          }}
        >
          Limpar
        </Button>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} gap={1.1} mt={1.6}>
        <TextField
          select
          label="Instituicao"
          size="small"
          defaultValue={INSTITUTIONS[0]}
          {...register("bank", { required: "Selecione uma instituicao" })}
          sx={{ minWidth: 200 }}
        >
          {INSTITUTIONS.map((bank, i) => (
            <MenuItem key={`${bank}-${i}`} value={bank}>
              {bank}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Tipo de pagamento"
          size="small"
          defaultValue="debito"
          {...register("transfer_type", { required: "Selecione um tipo" })}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="debito">Debito</MenuItem>
          <MenuItem value="credito">Credito</MenuItem>
        </TextField>
      </Stack>

      {!fields.length ? (
        <Typography color="text.secondary" mt={2}>
          Nenhuma linha importada ainda.
        </Typography>
      ) : (
        <Box component="form" onSubmit={handleSubmit(onSave)}>
          <TableContainer sx={{ mt: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Descricao</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell align="right">Acoes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((row, index) => (
                  <TableRow key={row.keyId}>
                    <TableCell>
                      <TextField
                        size="small"
                        type="date"
                        error={Boolean(errors?.rows?.[index]?.date)}
                        helperText={errors?.rows?.[index]?.date?.message}
                        {...register(`rows.${index}.date`, {
                          required: "Obrigatorio",
                        })}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        sx={{ minWidth: 260 }}
                        placeholder="Descricao"
                        error={Boolean(errors?.rows?.[index]?.description)}
                        helperText={errors?.rows?.[index]?.description?.message}
                        {...register(`rows.${index}.description`, {
                          required: "Obrigatorio",
                          validate: (v) => v.trim().length > 0 || "Obrigatorio",
                        })}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        size="small"
                        error={Boolean(errors?.rows?.[index]?.category)}
                        helperText={errors?.rows?.[index]?.category?.message}
                        defaultValue=""
                        {...register(`rows.${index}.category`, {
                          required: "Selecione uma categoria",
                        })}
                      >
                        {PAYMENT_CATEGORIES.map((c) => (
                          <MenuItem key={c || "empty"} value={c}>
                            {c ? c : "Selecione..."}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        inputMode="decimal"
                        error={Boolean(errors?.rows?.[index]?.amount)}
                        helperText={errors?.rows?.[index]?.amount?.message}
                        {...register(`rows.${index}.amount`, {
                          required: "Obrigatorio",
                          valueAsNumber: true,
                          validate: (v) => Number.isFinite(v) || "Numero invalido",
                        })}
                        onChange={(e) => {
                          const n = toNumberBR(e.target.value);
                          setValue(`rows.${index}.amount`, Number.isFinite(n) ? n : 0, {
                            shouldValidate: true,
                          });
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button color="error" onClick={() => remove(index)}>
                        Apagar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack direction={{ xs: "column", md: "row" }} gap={1} mt={1.5}>
            <Button type="button" variant="outlined" onClick={addRow}>
              Adicionar linha
            </Button>
            <Button type="submit" variant="contained">
              Salvar
            </Button>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} gap={1} mt={1.2}>
            <Alert severity="success" variant="outlined" sx={{ flex: 1 }}>
              Entradas: <b>{numberToCurrencyBR(totals.entradas)}</b>
            </Alert>
            <Alert severity="warning" variant="outlined" sx={{ flex: 1 }}>
              Saidas: <b>{numberToCurrencyBR(totals.saidas)}</b>
            </Alert>
          </Stack>
        </Box>
      )}
    </Paper>
  );
}
