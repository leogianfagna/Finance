import { useForm } from "react-hook-form";
import { Button, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { TYPES, INSTITUTIONS } from "/src/constants/constants";
import { ASSETS_DEFAULT_COLUMNS } from "/src/constants/columns";

export default function AssetEditor({ onAdd }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: ASSETS_DEFAULT_COLUMNS,
    mode: "onSubmit",
  });

  function toNumberBR(value) {
    if (typeof value !== "string") return NaN;
    const normalized = value.replace(/\./g, "").replace(",", ".");
    return Number(normalized);
  }

  const onSubmit = (data) => {
    const totalNumber = toNumberBR(data.total);

    onAdd({
      id: crypto.randomUUID?.() || String(Date.now()),
      name: data.name.trim(),
      type: data.type,
      institution: data.institution,
      total: Number.isFinite(totalNumber) ? totalNumber : 0,
      lastUpdate: new Date().toISOString().slice(0, 10),
    });

    reset();
  };

  return (
    <Paper sx={{ p: 2, borderRadius: 3 }}>
      <Typography variant="subtitle1" mb={1.2}>
        Adicionar ativo
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack direction={{ xs: "column", md: "row" }} gap={1.2} alignItems={{ md: "center" }}>
          <TextField
            label="Nome"
            size="small"
            placeholder="Ex: Nubank"
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
            {...register("name", {
              required: "Informe o nome",
              validate: (v) => v.trim().length > 0 || "Informe o nome",
            })}
          />

          <TextField
            select
            label="Tipo"
            size="small"
            error={Boolean(errors.type)}
            helperText={errors.type?.message}
            defaultValue={ASSETS_DEFAULT_COLUMNS.type}
            sx={{ minWidth: 160 }}
            {...register("type", { required: "Selecione o tipo" })}
          >
            {TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Instituicao"
            size="small"
            error={Boolean(errors.institution)}
            helperText={errors.institution?.message}
            defaultValue=""
            sx={{ minWidth: 170 }}
            {...register("institution", {
              required: "Selecione a instituicao",
            })}
          >
            <MenuItem value="" disabled>
              Selecione...
            </MenuItem>
            {INSTITUTIONS.map((inst) => (
              <MenuItem key={inst} value={inst}>
                {inst}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Total (R$)"
            size="small"
            inputMode="decimal"
            placeholder="Ex: 1500,00"
            error={Boolean(errors.total)}
            helperText={errors.total?.message}
            {...register("total", {
              required: "Informe o total",
              validate: (v) => {
                const n = toNumberBR(v);
                if (!Number.isFinite(n)) return "Digite um numero valido";
                if (n <= 0) return "O total deve ser maior que zero";
                return true;
              },
            })}
          />

          <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ minWidth: 120 }}>
            Adicionar
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
