import { alpha, useTheme } from "@mui/material/styles";
import { Box, Paper, Stack, Typography } from "@mui/material";

export default function MetricCard({
  label,
  value,
  title,
  icon,
  color = "primary.main",
  helper,
}) {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: 2.1,
        borderRadius: 4,
        border: "1px solid rgba(108, 123, 241, 0.18)",
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(140deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 248, 255, 0.95) 60%, rgba(255, 245, 236, 0.92) 100%)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 5,
          background: `linear-gradient(90deg, ${color} 0%, ${alpha(theme.palette.secondary.main, 0.65)} 100%)`,
        }}
      />
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.2}>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: "0.06em" }}>
            {label}
          </Typography>
          {title && (
            <Typography variant="body2" fontWeight={700}>
              {title}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            color,
            width: 42,
            height: 42,
            borderRadius: 2.5,
            display: "grid",
            placeItems: "center",
            border: "1px solid",
            borderColor: alpha(theme.palette.primary.main, 0.24),
            bgcolor: alpha(theme.palette.primary.main, 0.11),
          }}
        >
          {icon}
        </Box>
      </Stack>
      <Typography variant="h6" sx={{ color, lineHeight: 1.2 }}>
        {value}
      </Typography>
      {helper && (
        <Typography variant="caption" color="text.secondary">
          {helper}
        </Typography>
      )}
    </Paper>
  );
}
