export interface Client {
  id: string;
  user_id?: string;
  name: string;
  created_at?: string;
}

export interface Transaction {
  id: string;
  user_id?: string;
  type: 'income' | 'expense';
  amount: number;
  client_id: string;
  description: string;
  date: string;
  currency: string;
  created_at?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}