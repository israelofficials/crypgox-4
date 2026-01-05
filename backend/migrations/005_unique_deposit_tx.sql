CREATE UNIQUE INDEX IF NOT EXISTS idx_user_deposits_unique_txid
  ON user_deposits (tx_id)
  WHERE tx_id IS NOT NULL AND status = 'COMPLETED';
