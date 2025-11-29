import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import TimelineIcon from '@mui/icons-material/Timeline'
import {
  getAssets,
  createAsset,
  addEvolution
} from '../api/patrimony'

const getLastEvolution = (asset) => {
  const evolutions = asset.evolutions || []
  if (!evolutions.length) return null
  const sorted = [...evolutions].sort((a, b) => a.date.localeCompare(b.date))
  return sorted[sorted.length - 1]
}

const AssetsPage = () => {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [openNewAsset, setOpenNewAsset] = useState(false)
  const [openNewEvolution, setOpenNewEvolution] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [assetForm, setAssetForm] = useState({
    location: '',
    type: '',
    firstDate: '',
    firstValue: ''
  })
  const [evolutionForm, setEvolutionForm] = useState({
    date: '',
    value: ''
  })

  const loadAssets = async () => {
    setLoading(true)
    try {
      const data = await getAssets()
      setAssets(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAssets()
  }, [])

  const handleAssetChange = (e) => {
    setAssetForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleEvolutionChange = (e) => {
    setEvolutionForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleCreateAsset = async (e) => {
    e.preventDefault()
    const payload = {
      location: assetForm.location,
      type: assetForm.type
    }
    if (assetForm.firstDate && assetForm.firstValue) {
      payload.evolutions = [
        {
          date: assetForm.firstDate,
          value: parseFloat(assetForm.firstValue)
        }
      ]
    }
    try {
      await createAsset(payload)
      setOpenNewAsset(false)
      setAssetForm({
        location: '',
        type: '',
        firstDate: '',
        firstValue: ''
      })
      await loadAssets()
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateEvolution = async (e) => {
    e.preventDefault()
    if (!selectedAsset) return
    try {
      await addEvolution(selectedAsset.id, {
        date: evolutionForm.date,
        value: parseFloat(evolutionForm.value)
      })
      setOpenNewEvolution(false)
      setEvolutionForm({ date: '', value: '' })
      setSelectedAsset(null)
      await loadAssets()
    } catch (err) {
      console.error(err)
    }
  }

  const totalAssets = useMemo(() => assets.length, [assets])

  return (
    <Box>
      <Box
        mb={3}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap'
        }}
      >
        <Box>
          <Typography variant="h4">Patrimônio</Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie seus locais de investimento e atualize as evoluções mensais.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => setOpenNewAsset(true)}
          >
            Novo ativo
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total de ativos cadastrados
              </Typography>
              <Typography variant="h4">{totalAssets}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2
                }}
              >
                <Typography variant="h6">Lista de ativos</Typography>
                <Typography variant="body2" color="text.secondary">
                  Clique no ícone de gráfico para adicionar uma nova evolução.
                </Typography>
              </Box>
              {loading ? (
                <Typography>Carregando ativos...</Typography>
              ) : assets.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Nenhum ativo cadastrado ainda.
                </Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Local</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell align="right">Último valor</TableCell>
                      <TableCell align="right">Última data</TableCell>
                      <TableCell align="center">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assets.map((asset) => {
                      const last = getLastEvolution(asset)
                      return (
                        <TableRow key={asset.id} hover>
                          <TableCell>{asset.location}</TableCell>
                          <TableCell>{asset.type}</TableCell>
                          <TableCell align="right">
                            {last
                              ? last.value.toLocaleString('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                })
                              : '-'}
                          </TableCell>
                          <TableCell align="right">
                            {last ? new Date(last.date).toLocaleDateString('pt-BR') : '-'}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              color="primary"
                              onClick={() => {
                                setSelectedAsset(asset)
                                setOpenNewEvolution(true)
                              }}
                            >
                              <TimelineIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog novo ativo */}
      <Dialog open={openNewAsset} onClose={() => setOpenNewAsset(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Novo ativo</DialogTitle>
        <Box component="form" onSubmit={handleCreateAsset}>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <TextField
                label="Local"
                name="location"
                value={assetForm.location}
                onChange={handleAssetChange}
                fullWidth
                required
              />
              <TextField
                label="Tipo"
                name="type"
                value={assetForm.type}
                onChange={handleAssetChange}
                fullWidth
                required
              />
              <Typography variant="subtitle2" color="text.secondary">
                Evolução inicial (opcional)
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Data"
                  name="firstDate"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={assetForm.firstDate}
                  onChange={handleAssetChange}
                  fullWidth
                />
                <TextField
                  label="Valor"
                  name="firstValue"
                  type="number"
                  value={assetForm.firstValue}
                  onChange={handleAssetChange}
                  fullWidth
                />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenNewAsset(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">
              Salvar
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Dialog nova evolução */}
      <Dialog
        open={openNewEvolution}
        onClose={() => {
          setOpenNewEvolution(false)
          setSelectedAsset(null)
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Nova evolução</DialogTitle>
        <Box component="form" onSubmit={handleCreateEvolution}>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Ativo: {selectedAsset?.location} ({selectedAsset?.type})
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Data"
                name="date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={evolutionForm.date}
                onChange={handleEvolutionChange}
                fullWidth
                required
              />
              <TextField
                label="Valor"
                name="value"
                type="number"
                value={evolutionForm.value}
                onChange={handleEvolutionChange}
                fullWidth
                required
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenNewEvolution(false)
                setSelectedAsset(null)
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="contained">
              Salvar evolução
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  )
}

export default AssetsPage
