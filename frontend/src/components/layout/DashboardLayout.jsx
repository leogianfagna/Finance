import React, { useState } from 'react'
import { Box, Toolbar } from '@mui/material'
import { Outlet } from 'react-router-dom'
import NavBar from './NavBar'
import SideBar from './SideBar'

const drawerWidth = 260

const DashboardLayout = () => {
  const [openSidebar, setOpenSidebar] = useState(false)

  return (
    <Box sx={{ display: 'flex' }}>
      <NavBar onOpenSidebar={() => setOpenSidebar(true)} />
      <SideBar open={openSidebar} onClose={() => setOpenSidebar(false)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          backgroundColor: 'background.default',
          ml: { lg: `${drawerWidth}px` }
        }}
      >
        <Toolbar />
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default DashboardLayout
