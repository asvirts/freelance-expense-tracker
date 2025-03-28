import React, { useState, useEffect } from 'react';
import { PlusCircle, UserPlus } from 'lucide-react';
import { Transaction, Client } from '../types';
import { supabase } from '../lib/supabase';

interface TransactionFormProps {
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
}

export default function TransactionForm({ onSubmit }: TransactionFormProps) {
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [clientId, setClientId] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [clients, setClients] = useState<Client[]>([]);
  const [newClientName, setNewClientName] = useState('');
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');

      if (error) throw error;
      if (data) {
        setClients(data);
        if (data.length > 0) setClientId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([{ 
          name: newClientName.trim(),
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setClients([...clients, data]);
        setClientId(data.id);
        setNewClientName('');
        setShowNewClientForm(false);
      }
    } catch (error) {
      console.error('Error adding client:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type,
      amount: parseFloat(amount),
      client_id: clientId,
      description,
      date: new Date().toISOString(),
      currency
    });
    setAmount('');
    setDescription('');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-2 px-4 rounded-md ${
              type === 'income'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-2 px-4 rounded-md ${
              type === 'expense'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Expense
          </button>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Client
            </label>
            <button
              type="button"
              onClick={() => setShowNewClientForm(!showNewClientForm)}
              className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
            >
              <UserPlus size={16} />
              {showNewClientForm ? 'Cancel' : 'Add New Client'}
            </button>
          </div>
          
          {showNewClientForm ? (
            <form onSubmit={handleAddClient} className="flex gap-2">
              <input
                type="text"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="Enter client name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                Add
              </button>
            </form>
          ) : (
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 flex items-center justify-center gap-2"
        >
          <PlusCircle size={20} />
          Add Transaction
        </button>
      </form>
    </div>
  );
}