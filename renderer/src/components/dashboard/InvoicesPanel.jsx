import { useMemo } from "react";
import { Alert, Chip, Paper, Stack, Typography } from "@mui/material";
import { numberToCurrencyBR } from "/src/utils/formatter.js";
import { glassPanelSx } from "/src/theme/surfaces.js";

export default function InvoicesPanel({ rows }) {
  const invoices = useMemo(() => {
    return (rows || []).filter((item) => item.type === "credit" || item.category === "Pagamentos");
  }, [rows]);

  const total = useMemo(() => invoices.reduce((sum, row) => sum + (Number(row.amount) || 0), 0), [invoices]);

  return (
    <Stack gap={1.2}>
      <Alert severity="info" variant="outlined">
        Total de faturas identificadas: <b>{numberToCurrencyBR(total)}</b>
      </Alert>
      <Paper sx={(theme) => ({ ...glassPanelSx(theme), p: 2, borderRadius: 3 })}>
        <Typography variant="subtitle1" mb={1}>
          Lancamentos de fatura ({invoices.length})
        </Typography>
        {!invoices.length ? (
          <Typography color="text.secondary">Nao ha lancamentos de fatura para este mes.</Typography>
        ) : (
          <Stack gap={0.8}>
            {invoices.map((row) => (
              <Stack
                key={row.id}
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                sx={(theme) => ({
                  p: 1.2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1.8,
                  backgroundColor: "rgba(255,255,255,0.55)",
                  boxShadow: `inset 0 0 0 1px ${theme.palette.divider}`,
                })}
              >
                <Typography>{row.description || "Sem descricao"}</Typography>
                <Stack direction="row" gap={1} alignItems="center">
                  <Chip size="small" label={row.date || "Sem data"} />
                  <Typography fontWeight={700}>{numberToCurrencyBR(row.amount)}</Typography>
                </Stack>
              </Stack>
            ))}
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}
