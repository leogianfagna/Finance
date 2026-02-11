import { Paper, Stack, Typography } from "@mui/material";

export default function MetricCard({ label, value, accent = "primary.main" }) {
  return (
    <Paper sx={{ p: 2.2, borderRadius: 3 }}>
      <Stack gap={0.8}>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase" }}>
          {label}
        </Typography>
        <Typography variant="h6" sx={{ color: accent }}>
          {value}
        </Typography>
      </Stack>
    </Paper>
  );
}
