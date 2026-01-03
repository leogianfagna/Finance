import { useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { numberToCurrencyBR } from "/src/utils/formater.js";

/**
 * Espera CSV com colunas: Data, Valor, Identificador, Descrição
 * - "Identificador" é descartado
 * - "categoria" começa vazia
 *
 * Observação: Excel (.xlsx/.xls) aqui fica implementado como "placeholder" (mensagem),
 * porque precisa de uma lib (ex: xlsx). Se quiser, eu já te devolvo a versão com xlsx também.
 */

const CATEGORIES = [
  "",
  "Saúde",
  "Pagamentos",
  "Alimentação",
  "Transporte",
  "Educação",
  "Lazer",
  "Outros",
];
const TYPES = ["entrada", "saída"];

function normalizeHeader(h) {
  return String(h || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function toNumberBR(value) {
  console.log(value);
  // aceita "1234.56" e também "1.234,56" e "-1.234,56"
  if (value == null) return NaN;

  const s = String(value).trim();
  if (!s) return NaN;

  const normalized = s.replace(/\./g, "").replace(",", ".");
  console.log(normalized);
  return Number(normalized);
}

function parseDateToISO(d) {
  // tenta reconhecer:
  // - "YYYY-MM-DD" (já ok)
  // - "DD/MM/YYYY"
  // - "DD-MM-YYYY"
  // se falhar, retorna ""
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
  // split simples com suporte a aspas (bom o suficiente para CSVs comuns)
  const out = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      // trata aspas escapadas ""
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
  const idxDesc = headers.indexOf("descricao"); // sem acento
  // "identificador" pode existir e é ignorado

  // fallback: tenta achar "descrição" normalizado
  // (normalizeHeader já remove acento, então "descrição" vira "descricao")

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]);

    const dataRaw = idxData >= 0 ? cols[idxData] : "";
    const valorRaw = idxValor >= 0 ? cols[idxValor] : "";
    const descRaw = idxDesc >= 0 ? cols[idxDesc] : "";

    const isoDate = parseDateToISO(dataRaw);
    const n = parseFloat(valorRaw);

    // valor na tabela fica como número (sempre positivo/negativo como veio)
    // usuário pode editar depois
    rows.push({
      id: crypto.randomUUID?.() || String(Date.now() + i),
      data: isoDate,
      descricao: sanitizeDescription(descRaw),
      categoria: "",
      valor: Number.isFinite(n) ? n : 0,
    });
  }

  return rows;
}

export default function StatementImporter() {
  const [fileName, setFileName] = useState("");

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      rows: [],
    },
    mode: "onSubmit",
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "rows",
    keyName: "keyId", // evita conflito com nosso "id"
  });

  const totals = useMemo(() => {
    let entradas = 0;
    let saidas = 0;

    for (const r of fields) {
      const v = Number(r.valor);
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
    const fileExtenstionType = file.name.toLowerCase().split(".").pop();

    if (fileExtenstionType === "csv") {
      const fileInText = await file.text();
      const parsed = parseCSV(fileInText);
      console.log(parsed);
      replace(parsed);
      return;
    }

    // Excel (xlsx/xls) — placeholder (precisa lib xlsx)
    if (fileExtenstionType === "xlsx" || fileExtenstionType === "xls") {
      alert(
        "Importação de Excel ainda não está habilitada. Use CSV por enquanto."
      );
      return;
    }

    alert("Formato não suportado. Envie um CSV ou Excel.");
  }

  function addRow() {
    append({
      id: crypto.randomUUID?.() || String(Date.now()),
      data: "",
      descricao: "",
      categoria: "",
      valor: 0,
    });
  }

  const onSave = (data) => {
    // validações extras (além do RHF)
    // aqui basta garantir que todas as categorias foram preenchidas e data válida
    const invalid = data.rows.some(
      (r) => !r.data || !r.descricao?.trim() || !r.categoria
    );
    if (invalid) return;

    console.log("Salvo!");
    // futuramente: enviar pro backend / estado global etc
  };

  return (
    <div
      style={{
        border: "1px solid #3333",
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
      }}
    >
      <h3 style={{ margin: "0 0 10px" }}>Importar extrato do mês</h3>

      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {fileName && (
          <span style={{ opacity: 0.85 }}>
            Arquivo: <b>{fileName}</b>
          </span>
        )}

        <button
          type="button"
          onClick={() => {
            replace([]);
            setFileName("");
          }}
        >
          Limpar
        </button>
      </div>

      {!fields.length ? (
        <p style={{ opacity: 0.8, marginTop: 12 }}>
          Nenhuma linha importada ainda.
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSave)}>
          <div style={{ marginTop: 12, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left" }}>
                  <th style={{ borderBottom: "1px solid #3333", padding: 8 }}>
                    Data
                  </th>
                  <th style={{ borderBottom: "1px solid #3333", padding: 8 }}>
                    Descrição
                  </th>
                  <th style={{ borderBottom: "1px solid #3333", padding: 8 }}>
                    Categoria
                  </th>
                  <th style={{ borderBottom: "1px solid #3333", padding: 8 }}>
                    Valor
                  </th>
                  <th style={{ borderBottom: "1px solid #3333", padding: 8 }}>
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody>
                {fields.map((row, index) => (
                  <tr key={row.keyId}>
                    <td style={{ borderBottom: "1px solid #3333", padding: 8 }}>
                      <input
                        type="date"
                        {...register(`rows.${index}.data`, {
                          required: "Obrigatório",
                        })}
                      />
                      {errors?.rows?.[index]?.data && (
                        <div style={{ fontSize: 12, color: "crimson" }}>
                          {errors.rows[index].data.message}
                        </div>
                      )}
                    </td>

                    <td style={{ borderBottom: "1px solid #3333", padding: 8 }}>
                      <input
                        style={{ width: 280 }}
                        placeholder="Descrição"
                        {...register(`rows.${index}.descricao`, {
                          required: "Obrigatório",
                          validate: (v) => v.trim().length > 0 || "Obrigatório",
                        })}
                      />
                      {errors?.rows?.[index]?.descricao && (
                        <div style={{ fontSize: 12, color: "crimson" }}>
                          {errors.rows[index].descricao.message}
                        </div>
                      )}
                    </td>

                    <td style={{ borderBottom: "1px solid #3333", padding: 8 }}>
                      <select
                        {...register(`rows.${index}.categoria`, {
                          required: "Selecione uma categoria",
                        })}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c || "empty"} value={c}>
                            {c ? c : "Selecione..."}
                          </option>
                        ))}
                      </select>
                      {errors?.rows?.[index]?.categoria && (
                        <div style={{ fontSize: 12, color: "crimson" }}>
                          {errors.rows[index].categoria.message}
                        </div>
                      )}
                    </td>

                    <td style={{ borderBottom: "1px solid #3333", padding: 8 }}>
                      <input
                        inputMode="decimal"
                        {...register(`rows.${index}.valor`, {
                          required: "Obrigatório",
                          valueAsNumber: true,
                          validate: (v) =>
                            Number.isFinite(v) || "Número inválido",
                        })}
                        onChange={(e) => {
                          // permite digitar em pt-BR sem quebrar, e ainda manter número no estado
                          const n = toNumberBR(e.target.value);
                          setValue(
                            `rows.${index}.valor`,
                            Number.isFinite(n) ? n : 0,
                            { shouldValidate: true }
                          );
                        }}
                      />
                      {errors?.rows?.[index]?.valor && (
                        <div style={{ fontSize: 12, color: "crimson" }}>
                          {errors.rows[index].valor.message}
                        </div>
                      )}
                    </td>

                    <td style={{ borderBottom: "1px solid #3333", padding: 8 }}>
                      <button type="button" onClick={() => remove(index)}>
                        Apagar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 12,
              flexWrap: "wrap",
            }}
          >
            <button type="button" onClick={addRow}>
              Adicionar linha
            </button>

            <button type="submit">Salvar</button>

            <div style={{ marginLeft: "auto", opacity: 0.85 }}>
              Entradas: <b>{numberToCurrencyBR(totals.entradas)}</b>{" "}
              &nbsp;|&nbsp; Saídas: <b>{numberToCurrencyBR(totals.saidas)}</b>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
