import React, { useState, useEffect } from 'react';
import { Download, BarChart3, ListFilter } from 'lucide-react';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Dashboard from './components/Dashboard';
import { Transaction } from './types';
import { supabase } from './lib/supabase';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [view, setView] = useState<'list' | 'dashboard'>('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (newTransaction: Omit<Transaction, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...newTransaction, user_id: (await supabase.auth.getUser()).data.user?.id }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setTransactions([data, ...transactions]);
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const exportToCSV = () => {
    const headers = ['Type', 'Date', 'Category', 'Description', 'Amount', 'Currency'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => 
        [t.type, t.date, t.category, t.description, t.amount, t.currency].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'transactions.csv';
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Freelance Expense Tracker
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => setView('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                view === 'dashboard'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700'
              }`}
            >
              <BarChart3 size={20} />
              Dashboard
            </button>
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                view === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700'
              }`}
            >
              <ListFilter size={20} />
              Transactions
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              <Download size={20} />
              Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <TransactionForm onSubmit={handleAddTransaction} />
          </div>
          <div className="lg:col-span-3">
            {view === 'dashboard' ? (
              <Dashboard transactions={transactions} />
            ) : (
              <TransactionList transactions={transactions} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;