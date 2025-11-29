import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Stack
} from '@mui/material'
import {
  getTotalSummary,
  getBalanceByType,
  getTotalByMonth,
  getByTypeByMonth,
  getPercentageEvolution
} from '../api/patrimony'
import TotalBalanceChart from '../components/charts/TotalBalanceChart'
import ByTypeByMonthChart from '../components/charts/ByTypeByMonthChart'

const DashboardPage = () => {
  const [total, setTotal] = useState(null)
  const [balanceByType, setBalanceByType] = useState({})
  const [totalByMonth, setTotalByMonth] = useState({})
  const [byTypeByMonth, setByTypeByMonth] = useState({})
  const [percentageSummary, setPercentageSummary] = useState(null)

  const [filters, setFilters] = useState({
    start: '',
    end: '',
    monthByType: ''
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [t, byType, tbm, btm] = await Promise.all([
          getTotalSummary(),
          getBalanceByType(),
          getTotalByMonth(),
          getByTypeByMonth()
        ])
        setTotal(t?.total_balance ?? 0)
        setBalanceByType(byType?.balances_by_type ?? {})
        setTotalByMonth(tbm?.totals_by_month ?? {})
        setByTypeByMonth(btm?.totals_by_type_by_month ?? {})
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Carregar % quando filtros mudarem e estiverem preenchidos
  useEffect(() => {
    const { start, end } = filters
    if (!start || !end) {
      setPercentageSummary(null)
      return
    }
    const load = async () => {
      try {
        const res = await getPercentageEvolution(start, end)
        setPercentageSummary(res)
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [filters.start, filters.end])

  // Atualizar balanceByType por mês específico
  useEffect(() => {
    const { monthByType } = filters
    const load = async () => {
      try {
        const res = await getBalanceByType(monthByType || undefined)
        setBalanceByType(res?.balances_by_type ?? {})
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [filters.monthByType])

  const totalFormatted = useMemo(
    () => (total != null ? total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '--'),
    [total]
  )

  if (loading) {
    return (
      <Box>
        <Typography>Carregando dashboard...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        Visão geral do patrimônio
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Saldo total atual
              </Typography>
              <Typography variant="h4">{totalFormatted}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Saldo por tipo (último registro ou mês filtrado)
              </Typography>
              {Object.keys(balanceByType).length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Nenhum registro ainda.
                </Typography>
              ) : (
                <Box>
                  {Object.entries(balanceByType).map(([type, value]) => (
                    <Typography key={type}>
                      {type}:&nbsp;
                      {value.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </Typography>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <TotalBalanceChart data={totalByMonth} />
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Filtros dos gráficos
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Mês para saldo por tipo"
                  type="month"
                  size="small"
                  value={filters.monthByType}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, monthByType: e.target.value }))
                  }
                />
                <TextField
                  label="Início (YYYY-MM)"
                  type="month"
                  size="small"
                  value={filters.start}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, start: e.target.value }))
                  }
                />
                <TextField
                  label="Fim (YYYY-MM)"
                  type="month"
                  size="small"
                  value={filters.end}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, end: e.target.value }))
                  }
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <ByTypeByMonthChart data={byTypeByMonth} />
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Rentabilidade no período
              </Typography>
              {!filters.start || !filters.end ? (
                <Typography variant="body2" color="text.secondary">
                  Selecione um intervalo de meses para ver a evolução percentual.
                </Typography>
              ) : !percentageSummary ? (
                <Typography>Carregando dados de rentabilidade...</Typography>
              ) : (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Período: {percentageSummary.start_month} →{' '}
                    {percentageSummary.end_month}
                  </Typography>
                  <Typography variant="h5">
                    Total:{' '}
                    {percentageSummary.total_change_percent == null
                      ? 'N/A'
                      : `${percentageSummary.total_change_percent.toFixed(2)} %`}
                  </Typography>
                  <Box mt={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Por tipo:
                    </Typography>
                    {Object.entries(
                      percentageSummary.by_type_change_percent || {}
                    ).map(([type, value]) => (
                      <Typography key={type} variant="body2">
                        {type}: {value == null ? 'N/A' : `${value.toFixed(2)} %`}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DashboardPage
