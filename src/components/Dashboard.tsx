import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Transaction } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardProps {
  transactions: Transaction[];
}

export default function Dashboard({ transactions }: DashboardProps) {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netIncome = totalIncome - totalExpenses;

  const chartData = {
    labels: ['Income', 'Expenses', 'Net Income'],
    datasets: [
      {
        label: 'Amount (USD)',
        data: [totalIncome, totalExpenses, netIncome],
        backgroundColor: [
          'rgba(34, 197, 94, 0.5)',
          'rgba(239, 68, 68, 0.5)',
          'rgba(59, 130, 246, 0.5)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
          'rgb(59, 130, 246)'
        ],
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">
            ${totalIncome.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Total Expenses
          </h3>
          <p className="text-2xl font-bold text-red-600">
            ${totalExpenses.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Net Income</h3>
          <p
            className={`text-2xl font-bold ${
              netIncome >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            ${netIncome.toFixed(2)}
          </p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Financial Overview
        </h3>
        <div className="h-64">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}