import React from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js'
import { Card, CardHeader, CardContent } from '@mui/material'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

const TotalBalanceChart = ({ data }) => {
  const labels = Object.keys(data || {})
  const values = labels.map((key) => data[key])

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Saldo total',
        data: values,
        tension: 0.3
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: { mode: 'index', intersect: false }
    },
    interaction: { mode: 'index', intersect: false },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }

  return (
    <Card>
      <CardHeader title="Evolução do saldo total por mês" />
      <CardContent>
        <Line data={chartData} options={options} />
      </CardContent>
    </Card>
  )
}

export default TotalBalanceChart
