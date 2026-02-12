import { useMemo } from "react";
import { Box, IconButton, MenuItem, Stack, TextField, Typography } from "@mui/material";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import { TYPES, INSTITUTIONS } from "/src/constants/constants";
import FinanceDataGrid from "./common/FinanceDataGrid.jsx";

export default function AssetsTable({ assets, onUpdateAsset, onRemoveAsset }) {
  function toNumberBR(value) {
    if (typeof value !== "string") return NaN;
    const normalized = value.replace(/\./g, "").replace(",", ".");
    return Number(normalized);
  }

  const columns = useMemo(
    () => [
      {
        field: "name",
        headerName: "Nome",
        flex: 1.3,
        minWidth: 180,
        renderCell: (params) => (
          <TextField
            size="small"
            fullWidth
            value={params.row.name || ""}
            onChange={(e) => onUpdateAsset(params.row.id, { name: e.target.value })}
          />
        ),
      },
      {
        field: "type",
        headerName: "Tipo",
        minWidth: 160,
        flex: 1,
        renderCell: (params) => (
          <TextField
            select
            size="small"
            fullWidth
            value={params.row.type || "Saldo"}
            onChange={(e) => onUpdateAsset(params.row.id, { type: e.target.value })}
          >
            {TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>
        ),
      },
      {
        field: "institution",
        headerName: "Instituicao",
        minWidth: 180,
        flex: 1.1,
        renderCell: (params) => (
          <TextField
            select
            size="small"
            fullWidth
            value={params.row.institution || ""}
            onChange={(e) => onUpdateAsset(params.row.id, { institution: e.target.value })}
          >
            <MenuItem value="" disabled>
              Selecione...
            </MenuItem>
            {INSTITUTIONS.map((inst) => (
              <MenuItem key={inst} value={inst}>
                {inst}
              </MenuItem>
            ))}
          </TextField>
        ),
      },
      {
        field: "total",
        headerName: "Total",
        minWidth: 150,
        flex: 0.8,
        renderCell: (params) => (
          <TextField
            size="small"
            fullWidth
            inputMode="decimal"
            value={String(params.row.total ?? "")}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") {
                onUpdateAsset(params.row.id, { total: 0 });
                return;
              }
              const n = toNumberBR(raw);
              onUpdateAsset(params.row.id, { total: Number.isFinite(n) ? n : 0 });
            }}
          />
        ),
      },
      {
        field: "actions",
        headerName: "Acoes",
        minWidth: 90,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => (
          <IconButton color="error" onClick={() => onRemoveAsset(params.row.id)}>
            <DeleteRoundedIcon />
          </IconButton>
        ),
      },
    ],
    [onRemoveAsset, onUpdateAsset]
  );

  if (!assets.length) {
    return (
      <Stack
        direction="row"
        alignItems="center"
        gap={1}
        sx={{ border: "1px dashed", borderColor: "divider", borderRadius: 2, p: 2 }}
      >
        <AccountBalanceWalletRoundedIcon color="primary" />
        <Typography color="text.secondary">Sem ativos neste mes.</Typography>
      </Stack>
    );
  }

  return (
    <Box>
      <FinanceDataGrid rows={assets} columns={columns} />
    </Box>
  );
}
