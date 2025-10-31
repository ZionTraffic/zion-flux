-- Inserir dados de tráfego para ASF Finance
-- Workspace ID: 01d0cff7-2de1-4731-af0d-ee62f5ba974b
-- Período: Outubro 2025
-- Total investido: R$ 2.435,10

INSERT INTO custo_anuncios (workspace_id, day, amount)
VALUES
  ('01d0cff7-2de1-4731-af0d-ee62f5ba974b', '2025-10-01', 85.50),
  ('01d0cff7-2de1-4731-af0d-ee62f5ba974b', '2025-10-02', 92.30),
  ('01d0cff7-2de1-4731-af0d-ee62f5ba974b', '2025-10-03', 78.90),
  ('01d0cff7-2de1-4731-af0d-ee62f5ba974b', '2025-10-04', 105.20),
  ('01d0cff7-2de1-4731-af0d-ee62f5ba974b', '2025-10-05', 88.40),
  ('01d0cff7-2de1-4731-af0d-ee62f5ba974b', '2025-10-06', 0),
  ('01d0cff7-2de1-4731-af0d-ee62f5ba974b', '2025-10-07', 95.60),
  ('01d0cff7-2de1-4731-af0d-ee62f5ba974b', '2025-10-08', 110.30),
  ('01d0cff7-2de1-4731-af0d-ee62f5ba974b', '2025-10-09', 87.20),
  ('01d0cff7-2de1-4731-af0d-ee62f5ba974b', '2025-10-10', 99.50),
  ('01d0cff7-2de1-4731-af0d-ee62f5ba974b', '2025-10-11', 102.80),
  ('01d0cff7-2de1-4731-af0d-ee62f5ba974b', '2025-10-12', 91.70),
  ('01d0cff7-2de1-4731-af0d-ee62f5ba974b', '2025-10-13', 0),
  ('01d0cff7-2de1-4731-af0d-ee62f5ba974b', '2025-10-14', 88.90),
  ('01d0cff7-2de1-4731-af0d-ee62f5ba974b', '2025-10-15', 96.40),
  ('01d0cff7-2de1-4731-af0d-ee62f5ba974b', '2025-10-16', 103.20),
  ('01d0cff7-2de1-4731-af0d-ee62f5ba974b', '2025-10-17', 89.60),
  ('01d0cff7-2de1-4731-af0d-ee62f5ba974b', '2025-10-18', 94.80),
  ('01d0cff7-2de1-4731-af0d-ee62f5ba974b', '2025-10-19', 87.30),
  ('01d0cff7-2de1-4731-af0d-ee62f5ba974b', '2025-10-20', 0),
  ('01d0cff7-2de1-4731-af0d-ee62f5ba974b', '2025-10-21', 101.50),
  ('01d0cff7-2de1-4731-af0d-ee62f5ba974b', '2025-10-22', 93.70),
  ('01d0cff7-2de1-4731-af0d-ee62f5ba974b', '2025-10-23', 98.20),
  ('01d0cff7-2de1-4731-af0d-ee62f5ba974b', '2025-10-24', 86.90),
  ('01d0cff7-2de1-4731-af0d-ee62f5ba974b', '2025-10-25', 92.60),
  ('01d0cff7-2de1-4731-af0d-ee62f5ba974b', '2025-10-26', 89.40),
  ('01d0cff7-2de1-4731-af0d-ee62f5ba974b', '2025-10-27', 0),
  ('01d0cff7-2de1-4731-af0d-ee62f5ba974b', '2025-10-28', 95.30),
  ('01d0cff7-2de1-4731-af0d-ee62f5ba974b', '2025-10-29', 88.70),
  ('01d0cff7-2de1-4731-af0d-ee62f5ba974b', '2025-10-30', 91.20)
ON CONFLICT (workspace_id, day) DO UPDATE
SET amount = EXCLUDED.amount;
