import { alpha, useTheme } from "@mui/material/styles";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";

export default function FinanceDataGrid(props) {
  const theme = useTheme();

  return (
    <DataGrid
      autoHeight
      disableRowSelectionOnClick
      pageSizeOptions={[5, 10, 25, 50]}
      initialState={{
        pagination: { paginationModel: { pageSize: 10, page: 0 } },
      }}
      slots={{ toolbar: GridToolbar }}
      slotProps={{
        toolbar: {
          showQuickFilter: true,
          quickFilterProps: { debounceMs: 350 },
        },
      }}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        "--DataGrid-overlayHeight": "120px",
        "& .MuiDataGrid-columnHeaders": {
          backgroundColor: alpha(theme.palette.primary.main, 0.06),
          borderBottom: "1px solid",
          borderColor: "divider",
          fontWeight: 700,
        },
        "& .MuiDataGrid-cell": {
          borderBottomColor: alpha(theme.palette.text.primary, 0.08),
        },
        "& .MuiDataGrid-toolbarContainer": {
          borderBottom: "1px solid",
          borderColor: "divider",
          p: 0.8,
        },
        "& .MuiDataGrid-footerContainer": {
          borderTop: "1px solid",
          borderColor: "divider",
        },
      }}
      {...props}
    />
  );
}
