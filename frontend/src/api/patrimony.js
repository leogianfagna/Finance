import api from './client'

export const getAssets = async () => {
  const res = await api.get('/api/patrimony/assets/')
  return res.data
}

export const createAsset = async (payload) => {
  const res = await api.post('/api/patrimony/assets/', payload)
  return res.data
}

export const addEvolution = async (assetId, payload) => {
  const res = await api.post(`/api/patrimony/assets/${assetId}/evolutions/`, payload)
  return res.data
}

export const getTotalSummary = async () => {
  const res = await api.get('/api/patrimony/summary/total/')
  return res.data
}

export const getBalanceByType = async (month) => {
  const res = await api.get('/api/patrimony/summary/by-type/', {
    params: month ? { month } : {}
  })
  return res.data
}

export const getTotalByMonth = async () => {
  const res = await api.get('/api/patrimony/summary/total-by-month/')
  return res.data
}

export const getByTypeByMonth = async () => {
  const res = await api.get('/api/patrimony/summary/by-type-by-month/')
  return res.data
}

export const getPercentageEvolution = async (start, end) => {
  const res = await api.get('/api/patrimony/summary/percentage-evolution/', {
    params: { start, end }
  })
  return res.data
}
