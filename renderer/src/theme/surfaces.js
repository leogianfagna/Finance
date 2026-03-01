import { alpha } from "@mui/material/styles";

export function glassPanelSx(theme) {
  return {
    border: "1px solid",
    borderColor: alpha(theme.palette.primary.main, 0.18),
    bgcolor: alpha(theme.palette.common.white, 0.68),
    boxShadow: "0 16px 36px rgba(23, 74, 43, 0.12)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
  };
}
