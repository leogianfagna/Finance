import { useMemo, useState } from "react";
import {
  AppBar,
  Box,
  Chip,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Fade,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import SpaceDashboardRoundedIcon from "@mui/icons-material/SpaceDashboardRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import CalendarViewMonthRoundedIcon from "@mui/icons-material/CalendarViewMonthRounded";

const drawerWidth = 260;

const menuIcons = {
  dashboard: <SpaceDashboardRoundedIcon />,
  historico: <HistoryRoundedIcon />,
  faturas: <ReceiptLongRoundedIcon />,
  notas: <EditNoteRoundedIcon />,
  meses: <CalendarViewMonthRoundedIcon />,
};

export default function AppShell({
  title,
  subtitle,
  menu,
  activeKey,
  onNavigate,
  children,
  periodSelector,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () => Array.from({ length: 8 }, (_, idx) => currentYear - 5 + idx),
    [currentYear]
  );
  const months = useMemo(() => Array.from({ length: 12 }, (_, idx) => idx + 1), []);

  const current = useMemo(
    () => menu.find((item) => item.key === activeKey) || menu[0],
    [menu, activeKey]
  );

  const content = (
    <Stack sx={{ height: "100%", p: 2, gap: 1.2, position: "relative", overflow: "hidden" }}>
      <Box
        sx={{
          position: "absolute",
          right: -30,
          top: -35,
          width: 130,
          height: 130,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255, 183, 120, 0.45) 0%, rgba(255, 183, 120, 0) 72%)",
        }}
      />
      <Stack sx={{ px: 1.3, py: 1.2, zIndex: 1 }} gap={1}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ letterSpacing: "0.06em" }}>
          FRIENDLY
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Selecione o periodo
        </Typography>
        {periodSelector ? (
          <Stack direction="row" gap={0.8}>
            <FormControl size="small" fullWidth>
              <InputLabel>Ano</InputLabel>
              <Select
                value={periodSelector.year}
                label="Ano"
                disabled={periodSelector.disabled}
                onChange={(event) =>
                  periodSelector.onChange({
                    year: Number(event.target.value),
                    month: periodSelector.month,
                  })
                }
              >
                {years.map((yearOption) => (
                  <MenuItem key={yearOption} value={yearOption}>
                    {yearOption}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Mes</InputLabel>
              <Select
                value={periodSelector.month}
                label="Mes"
                disabled={periodSelector.disabled}
                onChange={(event) =>
                  periodSelector.onChange({
                    year: periodSelector.year,
                    month: Number(event.target.value),
                  })
                }
              >
                {months.map((monthOption) => (
                  <MenuItem key={monthOption} value={monthOption}>
                    {String(monthOption).padStart(2, "0")}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        ) : (
          <Typography variant="h6" sx={{ lineHeight: 1.1 }}>
            {title}
          </Typography>
        )}
      </Stack>

      <List sx={{ p: 0, zIndex: 1 }}>
        {menu.map((item) => (
          <ListItemButton
            key={item.key}
            selected={activeKey === item.key}
            onClick={() => {
              onNavigate(item.key);
              setMobileOpen(false);
            }}
            sx={{
              borderRadius: 3,
              mb: 0.8,
              border: "1px solid transparent",
              transition: "all 180ms ease",
              "&:hover": {
                borderColor: "divider",
                bgcolor: "rgba(255, 255, 255, 0.75)",
              },
              "&.Mui-selected": {
                bgcolor: "rgba(87, 103, 232, 0.12)",
                color: "primary.main",
                borderColor: "rgba(87, 103, 232, 0.26)",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 38, color: "inherit" }}>
              {menuIcons[item.key]}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Stack>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", position: "relative" }}>
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={{
          borderBottom: "1px solid rgba(108, 123, 241, 0.2)",
          backdropFilter: "blur(14px)",
          bgcolor: "rgba(239, 243, 255, 0.78)",
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          {!isDesktop && (
            <IconButton onClick={() => setMobileOpen((v) => !v)} edge="start" sx={{ mr: 1.5 }}>
              <MenuRoundedIcon />
            </IconButton>
          )}
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Typography variant="h6" lineHeight={1.15}>
              {current?.label || title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
            <Chip size="small" color="secondary" label="Friendly UI" sx={{ ml: 1 }} />
          </Stack>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}>
        <Drawer
          variant={isDesktop ? "permanent" : "temporary"}
          open={isDesktop ? true : mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              borderRight: "1px solid rgba(108, 123, 241, 0.2)",
              bgcolor: "rgba(250, 251, 255, 0.95)",
            },
          }}
        >
          <Toolbar />
          {content}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          mt: 8,
          width: { lg: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Fade in key={activeKey} timeout={360}>
          <Box sx={{ maxWidth: 1380, mx: "auto" }}>{children}</Box>
        </Fade>
      </Box>
    </Box>
  );
}
