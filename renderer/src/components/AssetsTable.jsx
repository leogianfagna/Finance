import {
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { TYPES, INSTITUTIONS } from "/src/constants/constants";

export default function AssetsTable({ assets, onUpdateAsset, onRemoveAsset }) {
  if (!assets.length) {
    return (
      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Typography color="text.secondary">Sem ativos neste mes.</Typography>
      </Paper>
    );
  }

  function toNumberBR(value) {
    if (typeof value !== "string") return NaN;
    const normalized = value.replace(/\./g, "").replace(",", ".");
    return Number(normalized);
  }

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Instituicao</TableCell>
            <TableCell>Total</TableCell>
            <TableCell align="right">Acoes</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {assets.map((a) => (
            <TableRow key={a.id} hover>
              <TableCell>
                <TextField
                  size="small"
                  value={a.name || ""}
                  onChange={(e) => onUpdateAsset(a.id, { name: e.target.value })}
                />
              </TableCell>

              <TableCell>
                <TextField
                  select
                  size="small"
                  value={a.type || "Saldo"}
                  onChange={(e) => onUpdateAsset(a.id, { type: e.target.value })}
                  sx={{ minWidth: 140 }}
                >
                  {TYPES.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </TextField>
              </TableCell>

              <TableCell>
                <TextField
                  select
                  size="small"
                  value={a.institution || ""}
                  onChange={(e) => onUpdateAsset(a.id, { institution: e.target.value })}
                  sx={{ minWidth: 160 }}
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
              </TableCell>

              <TableCell>
                <TextField
                  size="small"
                  inputMode="decimal"
                  value={String(a.total ?? "")}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "") {
                      onUpdateAsset(a.id, { total: 0 });
                      return;
                    }
                    const n = toNumberBR(raw);
                    onUpdateAsset(a.id, { total: Number.isFinite(n) ? n : 0 });
                  }}
                />
              </TableCell>

              <TableCell align="right">
                <IconButton color="error" onClick={() => onRemoveAsset(a.id)}>
                  <DeleteRoundedIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
