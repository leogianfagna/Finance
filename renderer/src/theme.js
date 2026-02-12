import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Poppins", "Segoe UI", "Helvetica Neue", sans-serif',
    h4: { fontWeight: 700, letterSpacing: "-0.02em" },
    h6: { fontWeight: 600 },
  },
  palette: {
    mode: "light",
    primary: { main: "#0f766e" },
    secondary: { main: "#ea580c" },
    background: { default: "#f4f7fb", paper: "#ffffff" },
    text: { primary: "#12203a", secondary: "#50617f" },
    divider: "rgba(16, 39, 78, 0.14)",
    success: { main: "#15803d" },
    error: { main: "#be123c" },
    warning: { main: "#ca8a04" },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(15, 34, 65, 0.08)",
          boxShadow: "0 12px 32px rgba(16, 39, 78, 0.08)",
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { textTransform: "none", fontWeight: 600 } },
    },
  },
});
