import React from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js'
import { Card, CardHeader, CardContent } from '@mui/material'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const ByTypeByMonthChart = ({ data }) => {
  const months = Object.keys(data || {})
  const allTypesSet = new Set()
  months.forEach((m) => {
    const typesObj = data[m] || {}
    Object.keys(typesObj).forEach((t) => allTypesSet.add(t))
  })
  const allTypes = Array.from(allTypesSet)

  const datasets = allTypes.map((t) => ({
    label: t,
    data: months.map((m) => (data[m]?.[t] ?? 0)),
    stack: 'stack1'
  }))

  const chartData = {
    labels: months,
    datasets
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true }
    },
    scales: {
      x: {
        stacked: true
      },
      y: {
        stacked: true,
        beginAtZero: true
      }
    }
  }

  return (
    <Card>
      <CardHeader title="Saldo por tipo e por mês" />
      <CardContent>
        <Bar data={chartData} options={options} />
      </CardContent>
    </Card>
  )
}

export default ByTypeByMonthChart
