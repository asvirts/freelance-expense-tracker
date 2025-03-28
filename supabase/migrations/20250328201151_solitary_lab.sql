/*
  # Add clients table and update transactions

  1. New Tables
    - `clients`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `created_at` (timestamp)

  2. Changes
    - Modify transactions table to reference clients instead of using categories
    
  3. Security
    - Enable RLS on clients table
    - Add policies for authenticated users to manage their clients
*/

CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own clients"
  ON clients
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients"
  ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Update transactions table
ALTER TABLE transactions 
DROP COLUMN category,
ADD COLUMN client_id uuid REFERENCES clients(id) NOT NULL;