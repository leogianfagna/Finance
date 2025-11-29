import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2065D1'
    },
    secondary: {
      main: '#3366FF'
    },
    background: {
      default: '#F4F6F8',
      paper: '#FFFFFF'
    }
  },
  shape: {
    borderRadius: 12
  },
  typography: {
    fontFamily: 'Roboto, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 }
  }
})

export default theme
