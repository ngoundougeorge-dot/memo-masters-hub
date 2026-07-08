ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'documents_envoyes' BEFORE 'en_cours';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS documents_submitted_at timestamptz;