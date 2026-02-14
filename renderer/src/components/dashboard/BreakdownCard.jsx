import { Paper, Stack, Typography } from "@mui/material";
import { numberToCurrencyBR } from "/src/utils/formatter.js";
import { glassPanelSx } from "/src/theme/surfaces.js";

export default function BreakdownCard({ title, rows }) {
  return (
    <Paper sx={(theme) => ({ ...glassPanelSx(theme), p: 2, borderRadius: 2, height: "100%" })}>
      <Typography variant="subtitle1" mb={1.1}>
        {title}
      </Typography>
      {!rows.length ? (
        <Typography color="text.secondary">Sem dados neste mes.</Typography>
      ) : (
        <Stack gap={0.9}>
          {rows.map(([label, value]) => (
            <Stack key={label} direction="row" justifyContent="space-between">
              <Typography color="text.secondary">{label || "Nao informado"}</Typography>
              <Typography fontWeight={700}>{numberToCurrencyBR(value)}</Typography>
            </Stack>
          ))}
        </Stack>
      )}
    </Paper>
  );
}
