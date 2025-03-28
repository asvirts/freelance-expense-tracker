/*
  # Create transactions table

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `type` (text, either 'income' or 'expense')
      - `amount` (numeric, transaction amount)
      - `currency` (text, currency code)
      - `category` (text, transaction category)
      - `description` (text, transaction details)
      - `date` (timestamptz, when the transaction occurred)
      - `created_at` (timestamptz, when the record was created)

  2. Security
    - Enable RLS on `transactions` table
    - Add policies for authenticated users to:
      - Read their own transactions
      - Create new transactions
*/

CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  amount numeric NOT NULL CHECK (amount >= 0),
  currency text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);