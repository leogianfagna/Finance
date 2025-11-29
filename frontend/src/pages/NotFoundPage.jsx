import React from 'react'
import { Box, Button, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const NotFoundPage = () => {
  const navigate = useNavigate()
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        textAlign: 'center'
      }}
    >
      <Typography variant="h3" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" gutterBottom>
        Página não encontrada
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        A página que você está procurando não existe.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/dashboard')}>
        Voltar ao dashboard
      </Button>
    </Box>
  )
}

export default NotFoundPage
