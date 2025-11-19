-- Adicionar coluna de moeda com valor padrão BRL
ALTER TABLE financial_goals 
ADD COLUMN currency text NOT NULL DEFAULT 'BRL';

-- Adicionar constraint para aceitar apenas moedas válidas
ALTER TABLE financial_goals 
ADD CONSTRAINT valid_currency 
CHECK (currency IN ('BRL', 'USD', 'EUR'));

-- Comentário descritivo
COMMENT ON COLUMN financial_goals.currency IS 'Moeda da meta: BRL (Real), USD (Dólar), EUR (Euro)';