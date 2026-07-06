
CREATE TYPE public.document_type AS ENUM ('memoire_licence','memoire_master','rapport_stage','correction','autre');
CREATE TYPE public.order_status AS ENUM ('nouveau','paiement_recu','en_cours','redaction','livre');

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  document_type public.document_type NOT NULL,
  academic_level TEXT,
  subject TEXT NOT NULL,
  instructions TEXT,
  deadline DATE,
  pages INTEGER,
  price_fcfa INTEGER,
  payment_method TEXT,
  file_paths TEXT[] NOT NULL DEFAULT '{}',
  status public.order_status NOT NULL DEFAULT 'nouveau',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Anyone can create an order (public form)
CREATE POLICY "Anyone can submit an order" ON public.orders
  FOR INSERT TO anon, authenticated WITH CHECK (true);
-- No public read - only service_role (admin) reads back office
