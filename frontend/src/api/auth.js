import api from './client'

export const login = async (username, password) => {
  const res = await api.post('/api/auth/login/', { username, password })
  const { access } = res.data
  const meRes = await api.get('/api/auth/me/', {
    headers: { Authorization: `Bearer ${access}` }
  })
  return {
    token: access,
    user: meRes.data
  }
}

export const register = async ({ username, email, password }) => {
  await api.post('/api/auth/register/', { username, email, password })
}
