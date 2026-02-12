import { useMemo, useState } from "react";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
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

export default function AppShell({ title, subtitle, menu, activeKey, onNavigate, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  const current = useMemo(
    () => menu.find((item) => item.key === activeKey) || menu[0],
    [menu, activeKey]
  );

  const content = (
    <Stack sx={{ height: "100%", p: 2, gap: 1.2 }}>
      <Box sx={{ px: 1.3, py: 1.2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Financas
        </Typography>
        <Typography variant="h6">{title}</Typography>
      </Box>

      <List sx={{ p: 0 }}>
        {menu.map((item) => (
          <ListItemButton
            key={item.key}
            selected={activeKey === item.key}
            onClick={() => {
              onNavigate(item.key);
              setMobileOpen(false);
            }}
            sx={{
              borderRadius: 2.5,
              mb: 0.8,
              "&.Mui-selected": {
                bgcolor: "rgba(15, 118, 110, 0.12)",
                color: "primary.main",
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
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          backdropFilter: "blur(12px)",
          bgcolor: "rgba(244, 247, 251, 0.88)",
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          {!isDesktop && (
            <IconButton onClick={() => setMobileOpen((v) => !v)} edge="start" sx={{ mr: 1.5 }}>
              <MenuRoundedIcon />
            </IconButton>
          )}
          <Box>
            <Typography variant="h6" lineHeight={1.15}>
              {current?.label || title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
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
              borderRight: "1px solid",
              borderColor: "divider",
              bgcolor: "#f8fbff",
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
          <Box>{children}</Box>
        </Fade>
      </Box>
    </Box>
  );
}
