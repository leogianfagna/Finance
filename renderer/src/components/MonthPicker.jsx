import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
} from "@mui/material";

export default function MonthPicker({
  year,
  month,
  onChange,
  onCreateEmpty,
  onCopyFromPrevious,
  onDelete,
  disabled = false,
}) {
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 5; y <= currentYear + 2; y++) years.push(y);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <Paper sx={{ p: 2, borderRadius: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} gap={1.2} alignItems={{ md: "center" }}>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Ano</InputLabel>
          <Select
            value={year}
            label="Ano"
            disabled={disabled}
            onChange={(e) => onChange({ year: Number(e.target.value), month })}
          >
            {years.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Mes</InputLabel>
          <Select
            value={month}
            label="Mes"
            disabled={disabled}
            onChange={(e) => onChange({ year, month: Number(e.target.value) })}
          >
            {months.map((m) => (
              <MenuItem key={m} value={m}>
                {String(m).padStart(2, "0")}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="outlined" onClick={onCreateEmpty} disabled={disabled}>
          Criar mes vazio
        </Button>
        <Button variant="outlined" color="secondary" onClick={onCopyFromPrevious} disabled={disabled}>
          Copiar mes anterior
        </Button>

        <Button
          variant="text"
          color="error"
          onClick={onDelete}
          disabled={disabled}
          sx={{ ml: { md: "auto" } }}
        >
          Excluir mes
        </Button>
      </Stack>
    </Paper>
  );
}
