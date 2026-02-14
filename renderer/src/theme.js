import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  shape: { borderRadius: 20 },
  typography: {
    fontFamily: '"Nunito", "Poppins", "Segoe UI", sans-serif',
    h4: { fontWeight: 700, letterSpacing: "-0.02em" },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 700 },
    button: { fontWeight: 700 },
  },
  palette: {
    mode: "light",
    primary: { main: "#5767e8" },
    secondary: { main: "#ffb778" },
    background: { default: "#edf0f8", paper: "#fdfdff" },
    text: { primary: "#1f2541", secondary: "#6b7292" },
    divider: "rgba(87, 103, 232, 0.16)",
    success: { main: "#34b68f" },
    error: { main: "#db5f7b" },
    warning: { main: "#e3a046" },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(87, 103, 232, 0.14)",
          boxShadow: "0 14px 28px rgba(86, 102, 196, 0.12)",
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 999,
          paddingInline: 16,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundColor: "rgba(255, 255, 255, 0.86)",
        },
      },
    },
  },
});
