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
        p: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: alpha(theme.palette.text.primary, 0.08),
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          bgcolor: color,
        }}
      />
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.2}>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: "0.06em" }}>
            {label}
          </Typography>
          {title && (
            <Typography variant="body2" fontWeight={600}>
              {title}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            color,
            width: 36,
            height: 36,
            borderRadius: 1.5,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(theme.palette.primary.main, 0.09),
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
