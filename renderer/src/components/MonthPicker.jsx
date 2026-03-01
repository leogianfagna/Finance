import {
  Button,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

export default function MonthPicker({
  onCreateEmpty,
  onCopyFromPrevious,
  onDelete,
  disabled = false,
}) {
  return (
    <Paper sx={{ p: 2, borderRadius: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} gap={1.2} alignItems={{ md: "center" }}>
        <Typography variant="subtitle2" color="text.secondary">
          Acoes do periodo selecionado
        </Typography>

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
