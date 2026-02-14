import { cloneElement, isValidElement } from "react";
import { alpha, useTheme } from "@mui/material/styles";
import { Box, Paper, Stack, Typography } from "@mui/material";

function toPath(data = [], width = 120, height = 42, padding = 4) {
  if (!Array.isArray(data) || data.length === 0) return "";
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;

  return data
    .map((point, idx) => {
      const x = padding + idx * stepX;
      const normalized = (point - min) / range;
      const y = height - padding - normalized * (height - padding * 2);
      return `${idx === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export default function MetricCard({
  title,
  value,
  icon,
  accent = "#335eea",
  background = "linear-gradient(90deg, #dce9ff 0%, #c6def9 100%)",
  trendText,
  trendColor,
  series = [],
  titleColor,
}) {
  const theme = useTheme();
  const path = toPath(series);
  const computedTitleColor = titleColor || alpha(accent, 0.96);
  const renderedIcon = isValidElement(icon) ? cloneElement(icon, { sx: { fontSize: 28 } }) : icon;

  return (
    <Paper
      sx={{
        p: 2.4,
        borderRadius: 3.2,
        border: `1px solid ${alpha(accent, 0.2)}`,
        position: "relative",
        overflow: "hidden",
        minHeight: 174,
        background,
        boxShadow: "none",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: `radial-gradient(${alpha(accent, 0.22)} 1.15px, transparent 1.15px)`,
          backgroundSize: "6px 6px",
          opacity: 0.5,
          maskImage: "radial-gradient(circle at 10% 18%, black 0%, transparent 55%)",
          WebkitMaskImage: "radial-gradient(circle at 10% 18%, black 0%, transparent 55%)",
        }}
      />

      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.2}>
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 2.2,
            display: "grid",
            placeItems: "center",
            color: accent,
            bgcolor: alpha(theme.palette.common.white, 0.56),
            border: `1px solid ${alpha(accent, 0.28)}`,
          }}
        >
          {renderedIcon}
        </Box>
        {trendText ? (
          <Typography variant="body2" fontWeight={800} sx={{ color: trendColor || accent }}>
            {trendText}
          </Typography>
        ) : null}
      </Stack>

      <Typography variant="body1" fontWeight={800} sx={{ color: computedTitleColor }}>
        {title}
      </Typography>
      <Typography variant="h5" sx={{ color: computedTitleColor, lineHeight: 1.2, mt: 0.3 }}>
        {value}
      </Typography>

      <Box sx={{ mt: 1.4, display: "flex", justifyContent: "flex-end" }}>
        <svg width="124" height="46" viewBox="0 0 124 46" fill="none" aria-hidden="true">
          <path
            d={path}
            stroke={accent}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </Box>
    </Paper>
  );
}
